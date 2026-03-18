"""
LangGraph Orchestrator for DevOps Agent

Coordinates the workflow for GitHub operations via Okta Brokered Consent:
1. Router - Parse user intent and extract parameters
2. STS Exchange - Exchange user token for GitHub token (handles interaction_required)
3. Execute GitHub - Perform the requested GitHub operation
4. Generate Response - Create natural language response

OAuth-STS Flow (per Okta documentation):
- First request may return "interaction_required" with interaction_uri
- User must be redirected to interaction_uri to authorize at GitHub
- After authorization, retry the token exchange to get access_token

Workflow Visualization:
  router → sts_exchange → execute_github → generate_response
"""

import os
import logging
import json
from typing import Dict, Any, List, Optional, TypedDict
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from auth.okta_sts import get_sts_exchange
from auth.agent_config import get_agent_config
from github.operations import GitHubOperations, get_demo_operations

logger = logging.getLogger(__name__)


class WorkflowState(TypedDict):
    """State passed through the LangGraph workflow."""
    # Input
    user_message: str
    user_token: str
    user_info: Dict[str, Any]

    # Routing
    intent: str  # list_repos, list_prs, list_issues, comment, close_issue, help
    parameters: Dict[str, Any]  # repo, owner, number, body, etc.

    # Token exchange
    github_token: Optional[str]
    sts_result: Dict[str, Any]
    interaction_required: bool
    interaction_uri: Optional[str]

    # GitHub operation
    github_result: Dict[str, Any]

    # Tracking for UI
    agent_flow: List[Dict[str, Any]]
    token_exchanges: List[Dict[str, Any]]

    # Response
    final_response: str


# Intent definitions
INTENTS = {
    "list_repos": {
        "description": "List user's repositories",
        "keywords": ["repos", "repositories", "my repos", "show repos", "list repos"],
    },
    "list_prs": {
        "description": "List pull requests",
        "keywords": ["prs", "pull requests", "pulls", "list prs", "show prs"],
    },
    "list_issues": {
        "description": "List issues",
        "keywords": ["issues", "bugs", "list issues", "show issues"],
    },
    "comment": {
        "description": "Comment on PR or issue",
        "keywords": ["comment", "add comment", "reply", "respond"],
    },
    "close_issue": {
        "description": "Close an issue",
        "keywords": ["close", "close issue", "resolve"],
    },
    "help": {
        "description": "Show help",
        "keywords": ["help", "what can you do", "capabilities"],
    },
}


class Orchestrator:
    """
    LangGraph-based orchestrator for DevOps Agent.

    Coordinates OAuth-STS token exchange and GitHub operations.
    Handles the interaction_required flow for first-time user consent.
    """

    def __init__(self, user_token: str, user_info: Dict[str, Any]):
        """
        Initialize the orchestrator.

        Args:
            user_token: User's Okta ID token (from linked application)
            user_info: User information (sub, email, name, groups)
        """
        self.user_token = user_token
        self.user_info = user_info
        self.config = get_agent_config()

        # LLM for routing and response generation
        # Explicitly pass API key to ensure it works on deployed environments
        anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        if not anthropic_api_key:
            logger.error("ANTHROPIC_API_KEY not set in environment!")
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")

        # Use standard Anthropic model ID format
        # Note: Model availability varies by API key type (standard vs custom gateway)
        self.llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",  # Claude Sonnet 4 (standard format)
            temperature=0,
            anthropic_api_key=anthropic_api_key  # Explicitly pass API key
        )

        # Build the workflow graph
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(WorkflowState)

        # Add nodes
        workflow.add_node("router", self._router_node)
        workflow.add_node("sts_exchange", self._sts_exchange_node)
        workflow.add_node("execute_github", self._execute_github_node)
        workflow.add_node("generate_response", self._generate_response_node)

        # Add edges
        workflow.set_entry_point("router")
        workflow.add_conditional_edges(
            "router",
            self._should_execute,
            {
                "execute": "sts_exchange",
                "help": "generate_response",
            }
        )
        workflow.add_conditional_edges(
            "sts_exchange",
            self._check_sts_result,
            {
                "continue": "execute_github",
                "interaction_required": "generate_response",
            }
        )
        workflow.add_edge("execute_github", "generate_response")
        workflow.add_edge("generate_response", END)

        return workflow.compile()

    def _should_execute(self, state: WorkflowState) -> str:
        """Determine if we should execute GitHub operation or just respond."""
        if state["intent"] == "help":
            return "help"
        return "execute"

    def _check_sts_result(self, state: WorkflowState) -> str:
        """Check if STS exchange requires user interaction."""
        if state.get("interaction_required"):
            return "interaction_required"
        return "continue"

    async def _router_node(self, state: WorkflowState) -> WorkflowState:
        """Parse user intent and extract parameters."""
        logger.info(f"[Router] Processing: {state['user_message'][:50]}...")

        # Update agent flow
        state["agent_flow"].append({
            "step": "router",
            "action": "Analyzing request",
            "status": "processing",
        })

        # Use LLM to parse intent
        system_prompt = """You are a DevOps assistant that helps with GitHub operations.
Analyze the user's message and extract:
1. intent: One of: list_repos, list_prs, list_issues, comment, close_issue, help
2. parameters: Any relevant parameters like repo name, owner, PR/issue number, comment body

Respond with JSON only:
{"intent": "...", "parameters": {"repo": "...", "owner": "...", "number": ..., "body": "..."}}

Examples:
- "Show my repos" → {"intent": "list_repos", "parameters": {}}
- "List PRs in my-repo" → {"intent": "list_prs", "parameters": {"repo": "my-repo"}}
- "Show issues in oktaforai-okta/test" → {"intent": "list_issues", "parameters": {"owner": "oktaforai-okta", "repo": "test"}}
- "Comment on PR #5 saying 'Looks good'" → {"intent": "comment", "parameters": {"number": 5, "body": "Looks good"}}
- "Close issue 10" → {"intent": "close_issue", "parameters": {"number": 10}}
- "What can you do?" → {"intent": "help", "parameters": {}}
"""

        response = await self.llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=state["user_message"])
        ])

        try:
            # Parse LLM response (handle markdown code blocks)
            content = response.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```"):
                # Extract JSON from code block
                lines = content.split("\n")
                content = "\n".join(lines[1:-1]) if len(lines) > 2 else content
                content = content.strip()

            result = json.loads(content)
            state["intent"] = result.get("intent", "help")
            state["parameters"] = result.get("parameters", {})
            logger.info(f"[Router] Parsed intent: {state['intent']}")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse router response: {response.content}")
            logger.error(f"JSON parse error: {e}")
            state["intent"] = "help"
            state["parameters"] = {}

        # Update agent flow
        state["agent_flow"][-1]["status"] = "completed"
        state["agent_flow"][-1]["action"] = f"Intent: {state['intent']}"

        logger.info(f"[Router] Intent: {state['intent']}, Params: {state['parameters']}")

        return state

    async def _sts_exchange_node(self, state: WorkflowState) -> WorkflowState:
        """Exchange user token for GitHub token via OAuth-STS."""
        logger.info("[STS Exchange] Starting token exchange")

        state["agent_flow"].append({
            "step": "sts_exchange",
            "action": "Exchanging token via OAuth-STS",
            "status": "processing",
        })

        sts = get_sts_exchange()
        result = await sts.exchange_token(state["user_token"])

        state["sts_result"] = result
        state["interaction_required"] = result.get("interaction_required", False)
        state["interaction_uri"] = result.get("interaction_uri")

        if result["success"]:
            state["github_token"] = result["access_token"]

            # Record token exchange for UI
            # Note: OAuth-STS doesn't return scope info, so we don't display scopes
            state["token_exchanges"].append({
                "agent": "DevOps Agent",
                "agent_name": "GitHub MCP",
                "color": "#6366f1",
                "success": True,
                "access_denied": False,
                "status": "granted",
                "scopes": [],  # OAuth-STS doesn't provide scope details
                "requested_scopes": [],
                "demo_mode": result.get("demo_mode", False),
            })

            state["agent_flow"][-1]["status"] = "completed"
            state["agent_flow"][-1]["action"] = "Token exchange successful"

        elif result.get("interaction_required"):
            # User needs to authorize at GitHub first
            state["github_token"] = None

            state["token_exchanges"].append({
                "agent": "DevOps Agent",
                "agent_name": "GitHub MCP",
                "color": "#6366f1",
                "success": False,
                "access_denied": False,
                "status": "interaction_required",
                "scopes": [],
                "requested_scopes": [],  # OAuth-STS doesn't provide scope details
                "error": "User authorization required",
                "interaction_uri": result.get("interaction_uri"),
                "demo_mode": False,
            })

            state["agent_flow"][-1]["status"] = "pending"
            state["agent_flow"][-1]["action"] = "Awaiting user authorization at GitHub"

            logger.info(f"[STS Exchange] Interaction required, URI: {result.get('interaction_uri')}")

        else:
            # Other failure
            state["github_token"] = None

            state["token_exchanges"].append({
                "agent": "DevOps Agent",
                "agent_name": "GitHub MCP",
                "color": "#6366f1",
                "success": False,
                "access_denied": True,
                "status": "denied",
                "scopes": [],
                "requested_scopes": [],  # OAuth-STS doesn't provide scope details
                "error": result.get("error"),
                "demo_mode": False,
            })

            state["agent_flow"][-1]["status"] = "error"
            state["agent_flow"][-1]["action"] = result.get("error", "Token exchange failed")

        logger.info(f"[STS Exchange] Result: success={result['success']}, interaction_required={state['interaction_required']}")

        return state

    async def _execute_github_node(self, state: WorkflowState) -> WorkflowState:
        """Execute the GitHub operation."""
        logger.info(f"[Execute] Operation: {state['intent']}")

        state["agent_flow"].append({
            "step": "execute_github",
            "action": f"Executing {state['intent']}",
            "status": "processing",
        })

        # Check if we have a token
        if not state["github_token"]:
            error_msg = state["sts_result"].get("error", "No GitHub token available")
            state["github_result"] = {
                "success": False,
                "error": error_msg,
            }
            state["agent_flow"][-1]["status"] = "error"
            state["agent_flow"][-1]["action"] = error_msg
            return state

        # Use demo data if in demo mode
        if state["sts_result"].get("demo_mode"):
            demo_data = get_demo_operations()
            state["github_result"] = {
                "success": True,
                "operation": state["intent"],
                "data": demo_data,
                "demo_mode": True,
            }
            state["agent_flow"][-1]["status"] = "completed"
            state["agent_flow"][-1]["action"] = f"Demo: {state['intent']}"
            return state

        # Create GitHub operations client
        ops = GitHubOperations(
            token=state["github_token"],
            default_org=self.config.github_org,
            default_repo=self.config.github_default_repo
        )

        params = state["parameters"]

        # Execute based on intent
        if state["intent"] == "list_repos":
            result = await ops.list_repos()
        elif state["intent"] == "list_prs":
            result = await ops.list_pull_requests(
                repo=params.get("repo"),
                owner=params.get("owner")
            )
        elif state["intent"] == "list_issues":
            result = await ops.list_issues(
                repo=params.get("repo"),
                owner=params.get("owner")
            )
        elif state["intent"] == "comment":
            number = params.get("number")
            body = params.get("body", "")
            if number:
                result = await ops.comment_on_issue(
                    issue_number=int(number),
                    body=body,
                    repo=params.get("repo"),
                    owner=params.get("owner")
                )
            else:
                result = {"success": False, "error": "Missing issue/PR number"}
        elif state["intent"] == "close_issue":
            number = params.get("number")
            if number:
                result = await ops.close_issue(
                    issue_number=int(number),
                    repo=params.get("repo"),
                    owner=params.get("owner")
                )
            else:
                result = {"success": False, "error": "Missing issue number"}
        else:
            result = {"success": False, "error": f"Unknown intent: {state['intent']}"}

        state["github_result"] = result

        # Check if token was revoked (401/403 from GitHub)
        if result.get("token_revoked"):
            logger.warning("[Execute] GitHub token was revoked (401) - OAuth-STS cache still valid")

            # Okta OAuth-STS caches tokens. It won't return interaction_required until:
            # 1. User manually revokes in Okta user settings, OR
            # 2. Cache expires (~8 hours)
            # We can't force cache clear programmatically

            state["agent_flow"][-1]["status"] = "error"
            state["agent_flow"][-1]["action"] = "GitHub token revoked - Okta cache active"
            state["interaction_required"] = True  # Trigger special message
            state["interaction_uri"] = None  # No URI until Okta cache cleared
        elif result["success"]:
            state["agent_flow"][-1]["status"] = "completed"
            state["agent_flow"][-1]["action"] = result.get("summary", f"Completed {state['intent']}")
        else:
            state["agent_flow"][-1]["status"] = "error"
            state["agent_flow"][-1]["action"] = result.get("error", "Operation failed")

        return state

    async def _generate_response_node(self, state: WorkflowState) -> WorkflowState:
        """Generate natural language response."""
        logger.info("[Response] Generating response")

        state["agent_flow"].append({
            "step": "generate_response",
            "action": "Generating response",
            "status": "processing",
        })

        # Handle help intent
        if state["intent"] == "help":
            state["final_response"] = """I'm a DevOps Agent that can help you with GitHub operations. Here's what I can do:

**Repository Operations:**
- List your repositories: "Show my repos"

**Pull Request Operations:**
- List PRs: "List PRs in {repo}" or "Show pull requests"

**Issue Operations:**
- List issues: "Show issues in {repo}"
- Comment on issues: "Comment on issue #5 saying 'message'"
- Close issues: "Close issue #10"

I access GitHub on your behalf using Okta Brokered Consent (OAuth-STS), which means:
- I use your GitHub permissions
- You can revoke access at any time through Okta
- All actions are logged and auditable

What would you like to do?"""
            state["agent_flow"][-1]["status"] = "completed"
            return state

        # Check GitHub result first (for token revoked case)
        github_result = state.get("github_result", {})

        # Handle token revoked BEFORE interaction_required (takes priority)
        if not github_result.get("success") and github_result.get("token_revoked"):
            state["final_response"] = """⚠️ **GitHub Access Token Revoked**

Your GitHub authorization has been revoked, but Okta still has a cached token.

**To re-authorize, follow these steps:**

**Step 1: Revoke in Okta**
1. Open: https://oktaforai.oktapreview.com/enduser/settings
2. Go to: "My apps" or "Connected apps" section
3. Find: GitHub connection
4. Click: "Remove" or "Revoke access"

**Step 2: Retry Your Request**
1. Come back to this chat
2. Ask your question again (e.g., "Show my repos")
3. Authorization modal will appear
4. Click "Authorize GitHub Access"
5. Grant permission at GitHub

**Alternative: Wait 8 Hours**
The cached token will expire, then retry will trigger fresh authorization.

_Why this happens: Okta caches OAuth-STS tokens for performance. When you revoke in GitHub, Okta doesn't know until the cache expires._

**Status:** GitHub returned 401 Unauthorized"""
            state["agent_flow"][-1]["status"] = "completed"
            return state

        # Handle interaction_required from OAuth-STS (first time auth)
        if state.get("interaction_required") and state.get("interaction_uri"):
            state["final_response"] = """To access your GitHub account, I need your authorization first.

**Click the "Authorize GitHub Access" button** that will appear below this message.

This is a one-time authorization through Okta Brokered Consent. After you authorize, you can retry your request.

_Authorization is required because this is the first time you're using the DevOps Agent with your GitHub account._"""
            state["agent_flow"][-1]["status"] = "completed"
            return state

        # Handle other GitHub errors
        if not github_result.get("success"):
            error = github_result.get("error", "An error occurred")
            state["final_response"] = f"I encountered an issue: {error}"
            state["agent_flow"][-1]["status"] = "completed"
            return state

        # Success - use LLM to generate natural response
        system_prompt = """You are a helpful DevOps assistant. Generate a concise, friendly response based on the GitHub operation result.
Keep responses brief but informative. Use plain text only - no markdown, no bold, no special formatting."""

        context = f"""
Operation: {state['intent']}
Result: {json.dumps(github_result.get('data', {}), indent=2)}
Summary: {github_result.get('summary', '')}
"""

        response = await self.llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Generate a response for this GitHub operation:\n{context}")
        ])

        state["final_response"] = response.content
        state["agent_flow"][-1]["status"] = "completed"

        return state

    async def process(self, message: str, conversation_context: str = "") -> Dict[str, Any]:
        """
        Process a user message through the workflow.

        Args:
            message: User's message
            conversation_context: Previous conversation for context

        Returns:
            Dict with content, agent_flow, token_exchanges, and interaction_uri if needed
        """
        # Initialize state
        initial_state: WorkflowState = {
            "user_message": message,
            "user_token": self.user_token,
            "user_info": self.user_info,
            "intent": "",
            "parameters": {},
            "github_token": None,
            "sts_result": {},
            "interaction_required": False,
            "interaction_uri": None,
            "github_result": {},
            "agent_flow": [],
            "token_exchanges": [],
            "final_response": "",
        }

        # Run the workflow
        try:
            final_state = await self.graph.ainvoke(initial_state)

            result = {
                "content": final_state["final_response"],
                "agent_flow": final_state["agent_flow"],
                "token_exchanges": final_state["token_exchanges"],
                "github_data": final_state.get("github_result", {}).get("data"),
            }

            # Include interaction_uri if authorization is required
            if final_state.get("interaction_required") and final_state.get("interaction_uri"):
                result["interaction_required"] = True
                result["interaction_uri"] = final_state["interaction_uri"]

            return result

        except Exception as e:
            logger.error(f"Orchestrator error: {e}")
            return {
                "content": f"I encountered an error processing your request: {str(e)}",
                "agent_flow": [{"step": "error", "action": str(e), "status": "error"}],
                "token_exchanges": [],
                "github_data": None,
            }
