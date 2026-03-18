"""
OAuth-STS Token Exchange for Brokered Consent

Exchanges a user's Okta ID token for a GitHub access token via OAuth-STS.
This implements Okta's Brokered Consent flow for AI Agents.

Flow (per Okta documentation):
1. User authenticates with Okta (gets ID token from LINKED application)
2. AI Agent makes OAuth-STS token exchange request
3. First request returns "interaction_required" error with interaction_uri
4. User is redirected to interaction_uri to authorize at GitHub
5. After user authorizes, retry OAuth-STS request to get access_token

Token Exchange Parameters:
- grant_type: urn:ietf:params:oauth:grant-type:token-exchange
- requested_token_type: urn:okta:params:oauth:token-type:oauth-sts
- subject_token: User's ID token (from linked application)
- subject_token_type: urn:ietf:params:oauth:token-type:id_token
- client_assertion_type: urn:ietf:params:oauth:client-assertion-type:jwt-bearer
- client_assertion: Signed JWT from jwt_builder
- resource: Resource indicator from Managed Connection
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
import httpx

from .agent_config import get_agent_config, AgentConfig
from .jwt_builder import JWTBuilderFactory

logger = logging.getLogger(__name__)

# OAuth-STS Grant Types and Token Types
GRANT_TYPE_TOKEN_EXCHANGE = "urn:ietf:params:oauth:grant-type:token-exchange"
REQUESTED_TOKEN_TYPE_STS = "urn:okta:params:oauth:token-type:oauth-sts"
SUBJECT_TOKEN_TYPE_ID = "urn:ietf:params:oauth:token-type:id_token"
CLIENT_ASSERTION_TYPE_JWT = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"


class OktaSTSExchange:
    """
    Handles OAuth-STS token exchange for GitHub access.

    Exchanges user ID tokens for GitHub access tokens via Okta Brokered Consent.
    Handles the interaction_required flow for first-time consent.
    """

    def __init__(self):
        """Initialize the STS exchange handler."""
        self._config = get_agent_config()
        self._jwt_builder = JWTBuilderFactory.get_builder()

    def is_configured(self) -> bool:
        """Check if STS exchange is properly configured."""
        return bool(
            self._config.agent_id and
            self._config.private_key and
            self._config.resource_indicator and
            self._jwt_builder
        )

    def _build_token_exchange_payload(self, user_id_token: str) -> Dict[str, str]:
        """Build the OAuth-STS token exchange request payload."""
        client_assertion = self._jwt_builder.build_client_assertion(
            principal_id=self._config.agent_id,
            audience=self._config.token_endpoint
        )

        return {
            "grant_type": GRANT_TYPE_TOKEN_EXCHANGE,
            "requested_token_type": REQUESTED_TOKEN_TYPE_STS,
            "subject_token": user_id_token,
            "subject_token_type": SUBJECT_TOKEN_TYPE_ID,
            "client_assertion_type": CLIENT_ASSERTION_TYPE_JWT,
            "client_assertion": client_assertion,
            "resource": self._config.resource_indicator,
        }

    async def exchange_token(
        self,
        user_id_token: str,
    ) -> Dict[str, Any]:
        """
        Exchange user's ID token for GitHub access token.

        This may return interaction_required on first attempt, requiring
        user to authorize at GitHub before retrying.

        Args:
            user_id_token: User's Okta ID token (from linked application via NextAuth)

        Returns:
            Dict with:
            - success: bool
            - access_token: str (GitHub token if successful)
            - token_type: str
            - expires_in: int
            - interaction_required: bool (if user needs to authorize at ISV)
            - interaction_uri: str (URL to redirect user for authorization)
            - error: str (if failed)
            - exchange_details: dict (for UI visualization)
        """
        if not self.is_configured():
            return self._demo_result()

        try:
            # Build token exchange payload
            payload = self._build_token_exchange_payload(user_id_token)

            logger.info(f"[OAuth-STS] Exchanging token for resource: {self._config.resource_indicator}")
            logger.info(f"[OAuth-STS] Token endpoint: {self._config.token_endpoint}")
            logger.info(f"[OAuth-STS] Grant type: {payload['grant_type']}")
            logger.info(f"[OAuth-STS] Requested token type: {payload['requested_token_type']}")

            # Make the token exchange request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self._config.token_endpoint,
                    data=payload,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=30.0
                )

            logger.info(f"[OAuth-STS] Response status: {response.status_code}")

            # Success - got the access token
            if response.status_code == 200:
                token_data = response.json()
                logger.info(f"[OAuth-STS] Token exchange SUCCESS, expires_in={token_data.get('expires_in')}")

                return {
                    "success": True,
                    "access_token": token_data.get("access_token"),
                    "token_type": token_data.get("token_type", "Bearer"),
                    "expires_in": token_data.get("expires_in"),
                    "refresh_token": token_data.get("refresh_token"),
                    "interaction_required": False,
                    "interaction_uri": None,
                    "demo_mode": False,
                    "exchange_details": {
                        "flow": "OAuth-STS (Brokered Consent)",
                        "agent": self._config.name,
                        "resource": "GitHub",
                        "status": "token_granted",
                        "exchanged_at": datetime.now().isoformat(),
                    }
                }

            # Handle error responses
            error_data = {}
            if response.headers.get("content-type", "").startswith("application/json"):
                try:
                    error_data = response.json()
                except:
                    pass

            error_code = error_data.get("error", "unknown_error")
            error_description = error_data.get("error_description", response.text)
            interaction_uri = error_data.get("interaction_uri")

            logger.warning(f"[OAuth-STS] Token exchange response: error={error_code}, interaction_uri={interaction_uri}")

            # Check for interaction_required - user needs to authorize at GitHub
            if error_code == "interaction_required":
                logger.info(f"[OAuth-STS] Interaction required - user must authorize at ISV")

                # Build the redirect URL if we have interaction_uri or dataHandle
                redirect_uri = interaction_uri
                if not redirect_uri:
                    # Try to extract dataHandle and build the URL
                    data_handle = error_data.get("dataHandle")
                    if data_handle:
                        redirect_uri = f"{self._config.okta_domain}/oauth2/v1/sts/redirect?dataHandle={data_handle}"

                return {
                    "success": False,
                    "access_token": None,
                    "interaction_required": True,
                    "interaction_uri": redirect_uri,
                    "error": "User authorization required at GitHub",
                    "error_code": error_code,
                    "error_description": error_description,
                    "demo_mode": False,
                    "exchange_details": {
                        "flow": "OAuth-STS (Brokered Consent)",
                        "agent": self._config.name,
                        "resource": "GitHub",
                        "status": "interaction_required",
                        "message": "Please authorize the DevOps Agent to access your GitHub account",
                    }
                }

            # Check for consent_required (alternative error code)
            if error_code == "consent_required" or "consent" in error_description.lower():
                return {
                    "success": False,
                    "access_token": None,
                    "interaction_required": True,
                    "interaction_uri": interaction_uri,
                    "error": "User consent required for GitHub access",
                    "error_code": error_code,
                    "demo_mode": False,
                    "exchange_details": {
                        "flow": "OAuth-STS (Brokered Consent)",
                        "agent": self._config.name,
                        "resource": "GitHub",
                        "status": "consent_required",
                    }
                }

            # Check for access denied
            if error_code in ["access_denied", "unauthorized_client", "invalid_grant"]:
                return {
                    "success": False,
                    "access_token": None,
                    "interaction_required": False,
                    "interaction_uri": None,
                    "error": f"Access denied: {error_description}",
                    "error_code": error_code,
                    "demo_mode": False,
                    "exchange_details": {
                        "flow": "OAuth-STS (Brokered Consent)",
                        "agent": self._config.name,
                        "resource": "GitHub",
                        "status": "access_denied",
                    }
                }

            # Generic error
            return {
                "success": False,
                "access_token": None,
                "interaction_required": False,
                "interaction_uri": None,
                "error": f"{error_code}: {error_description}",
                "error_code": error_code,
                "demo_mode": False,
            }

        except httpx.TimeoutException:
            logger.error("[OAuth-STS] Token exchange timeout")
            return {
                "success": False,
                "access_token": None,
                "interaction_required": False,
                "interaction_uri": None,
                "error": "Token exchange timeout",
                "error_code": "timeout",
                "demo_mode": False,
            }
        except Exception as e:
            logger.error(f"[OAuth-STS] Token exchange error: {e}")
            return {
                "success": False,
                "access_token": None,
                "interaction_required": False,
                "interaction_uri": None,
                "error": str(e),
                "error_code": "exchange_error",
                "demo_mode": False,
            }

    def _demo_result(self) -> Dict[str, Any]:
        """Return demo mode result when OAuth-STS is not configured."""
        return {
            "success": True,
            "access_token": f"demo-github-token-{int(datetime.now().timestamp())}",
            "token_type": "Bearer",
            "expires_in": 3600,
            "interaction_required": False,
            "interaction_uri": None,
            "demo_mode": True,
            "exchange_details": {
                "flow": "OAuth-STS (Demo Mode)",
                "agent": "DevOps Agent",
                "resource": "GitHub",
                "note": "Real OAuth-STS not configured - using demo token",
            }
        }


# Singleton instance
_sts_exchange: Optional[OktaSTSExchange] = None


def get_sts_exchange() -> OktaSTSExchange:
    """Get or create the OktaSTSExchange singleton."""
    global _sts_exchange
    if _sts_exchange is None:
        _sts_exchange = OktaSTSExchange()
    return _sts_exchange
