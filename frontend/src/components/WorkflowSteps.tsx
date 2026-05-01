'use client';

import { useState } from 'react';
import { TokenExchange, TokenInfo } from '@/types';
import {
  ChevronDown,
  ChevronRight,
  Workflow,
  User,
  FileText,
  Send,
  AlertCircle,
  Key,
  Server,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';

function ColoredJwt({ token }: { token: string }) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return <span className="text-orange-300">{token}</span>;
  }
  return (
    <>
      <span className="text-red-300">{parts[0]}</span>
      <span className="text-white/40">.</span>
      <span className="text-purple-300">{parts[1]}</span>
      <span className="text-white/40">.</span>
      <span className="text-cyan-300">{parts[2]}</span>
    </>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatTimestamp(ts?: number) {
  if (!ts) return 'N/A';
  return new Date(ts * 1000).toLocaleString();
}

function StepTokenView({ tokenInfo, label }: { tokenInfo?: TokenInfo; label: string }) {
  const [mode, setMode] = useState<'encoded' | 'decoded'>('encoded');
  const [copied, setCopied] = useState(false);
  const decoded = tokenInfo?.decoded;

  const handleCopy = async () => {
    if (!decoded?.raw_token) return;
    try {
      await navigator.clipboard.writeText(decoded.raw_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked
    }
  };

  if (!decoded) {
    return (
      <div className="bg-black/20 rounded p-2 text-[10px] text-white/50 italic">
        {label} not yet available
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded p-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">
          {label}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('encoded')}
            className={`px-2 py-0.5 text-[9px] rounded transition ${
              mode === 'encoded'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Encoded
          </button>
          <button
            onClick={() => setMode('decoded')}
            className={`px-2 py-0.5 text-[9px] rounded transition ${
              mode === 'decoded'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            Decoded
          </button>
        </div>
      </div>

      {mode === 'encoded' ? (
        <div className="space-y-1">
          <div className="font-mono text-[10px] break-all max-h-32 overflow-y-auto leading-snug bg-black/40 rounded p-1.5">
            {decoded.raw_token ? (
              <ColoredJwt token={decoded.raw_token} />
            ) : (
              <span className="text-white/50">Raw token not available</span>
            )}
          </div>
          {decoded.raw_token && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {decoded.header && (
            <div className="bg-black/40 rounded p-1.5">
              <div className="text-[9px] font-semibold text-cyan-300 uppercase mb-0.5">Header</div>
              <div className="font-mono text-[10px] space-y-0.5">
                {Object.entries(decoded.header).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="text-red-300 w-12 flex-shrink-0">{k}:</span>
                    <span className="text-white/90 truncate">{formatValue(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {decoded.payload && (
            <div className="bg-black/40 rounded p-1.5">
              <div className="text-[9px] font-semibold text-cyan-300 uppercase mb-0.5">Payload</div>
              <div className="font-mono text-[10px] space-y-0.5">
                {Object.entries(decoded.payload).map(([k, v]) => (
                  <div key={k} className="flex">
                    <span className="text-purple-300 w-12 flex-shrink-0">{k}:</span>
                    <span className="text-white/90 truncate">
                      {k === 'iat' || k === 'exp' ? formatTimestamp(v as number) : formatValue(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {decoded.signature_preview && (
            <div className="bg-black/40 rounded p-1.5">
              <div className="text-[9px] font-semibold text-cyan-300 uppercase mb-0.5">Signature</div>
              <div className="font-mono text-[10px] text-cyan-200/80 truncate">
                {decoded.signature_preview}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StepProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete';
  children?: React.ReactNode;
}

function Step({ stepNumber, title, description, icon, status, children }: StepProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasContent = !!children;

  const statusStyles = {
    complete: 'bg-green-400 text-green-900',
    active: 'bg-yellow-400 text-yellow-900 animate-pulse',
    pending: 'bg-white/20 text-white/70',
  };

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => hasContent && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 flex items-center justify-between transition ${
          hasContent ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
        }`}
        disabled={!hasContent}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${statusStyles[status]}`}
          >
            {status === 'complete' ? <CheckCircle className="w-3 h-3" /> : stepNumber}
          </div>
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="text-left min-w-0">
            <div className="text-sm font-medium text-white truncate">{title}</div>
            <div className="text-[10px] text-white/60 truncate">{description}</div>
          </div>
        </div>
        {hasContent && (
          <div className="flex-shrink-0 ml-2">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/60" />
            )}
          </div>
        )}
      </button>

      {isOpen && hasContent && (
        <div className="px-3 pb-3 pt-1 animate-fadeIn space-y-2">{children}</div>
      )}
    </div>
  );
}

interface WorkflowStepsProps {
  exchanges: TokenExchange[];
  isLoading?: boolean;
  activeService?: 'github' | 'jira';
}

export default function WorkflowSteps({ exchanges, isLoading, activeService = 'github' }: WorkflowStepsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const latest = exchanges.length > 0 ? exchanges[exchanges.length - 1] : null;
  const tokenDetails = latest?.token_details;

  const serviceName =
    latest?.agent_name.toLowerCase().includes('jira')
      ? 'Jira'
      : latest?.agent_name.toLowerCase().includes('github')
      ? 'GitHub'
      : activeService === 'jira'
      ? 'Jira'
      : 'GitHub';

  const hasIdToken = !!tokenDetails?.id_token?.decoded;
  const hasClientAssertion = !!tokenDetails?.client_assertion?.decoded;
  const hasAccessToken = !!tokenDetails?.access_token?.decoded;
  const requiredConsent =
    latest?.status === 'interaction_required' ||
    exchanges.some((ex) => ex.status === 'interaction_required');
  const granted = latest?.status === 'granted';

  const statusOf = (done: boolean, active: boolean): 'pending' | 'active' | 'complete' =>
    done ? 'complete' : active ? 'active' : 'pending';

  return (
    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#4c1d95' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-white/10 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Workflow className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Step-by-Step Workflow</div>
            <div className="text-xs text-white/70">OAuth-STS Brokered Consent Flow</div>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 animate-fadeIn">
          <Step
            stepNumber={1}
            title="User authenticated to Okta for Chat Bot interface"
            description="Sign-in complete; ID Token issued"
            icon={<User className="w-3 h-3 text-white" />}
            status={statusOf(hasIdToken, isLoading === true && !hasIdToken)}
          >
            <p className="text-[11px] text-white/80 leading-relaxed">
              The user signs in via Okta. Okta issues an ID Token (JWT) identifying the
              authenticated user to downstream services.
            </p>
            <StepTokenView tokenInfo={tokenDetails?.id_token} label="ID Token" />
          </Step>

          <Step
            stepNumber={2}
            title="AI Agent proves its identity to Okta"
            description="Signed JWT (RS256) sent to Okta STS"
            icon={<FileText className="w-3 h-3 text-white" />}
            status={statusOf(hasClientAssertion, isLoading === true && !hasClientAssertion)}
          >
            <p className="text-[11px] text-white/80 leading-relaxed">
              The AI agent builds a short-lived JWT signed with its RSA private key. This
              client assertion authenticates the agent itself to Okta STS.
            </p>
            <StepTokenView tokenInfo={tokenDetails?.client_assertion} label="Client Assertion" />
          </Step>

          <Step
            stepNumber={3}
            title="Agent requests delegated access on user's behalf"
            description="POST /oauth2/v1/token (token-exchange grant)"
            icon={<Send className="w-3 h-3 text-white" />}
            status={statusOf(hasClientAssertion && hasIdToken, isLoading === true)}
          >
            <p className="text-[11px] text-white/80 leading-relaxed">
              Agent POSTs to Okta&apos;s token endpoint with a token-exchange grant. The body
              carries the user&apos;s ID Token (subject_token) and the client assertion.
            </p>
            <div className="bg-black/40 rounded p-2 font-mono text-[10px] text-white/80 leading-snug">
              <div><span className="text-yellow-300">grant_type</span>: urn:ietf:params:oauth:grant-type:token-exchange</div>
              <div><span className="text-yellow-300">requested_token_type</span>: urn:okta:params:oauth:token-type:oauth-sts</div>
              <div><span className="text-yellow-300">subject_token</span>: &lt;ID Token&gt;</div>
              <div><span className="text-yellow-300">subject_token_type</span>: urn:ietf:params:oauth:token-type:id_token</div>
              <div><span className="text-yellow-300">client_assertion</span>: &lt;Signed JWT&gt;</div>
              <div><span className="text-yellow-300">resource</span>: &lt;{serviceName} resource indicator&gt;</div>
            </div>
          </Step>

          {requiredConsent && (
            <Step
              stepNumber={4}
              title={`User grants consent at ${serviceName}`}
              description={`First-time authorization at ${serviceName}`}
              icon={<AlertCircle className="w-3 h-3 text-white" />}
              status={granted ? 'complete' : 'active'}
            >
              <p className="text-[11px] text-white/80 leading-relaxed">
                First-time access: Okta returns <code className="text-yellow-300">interaction_required</code>{' '}
                with an <code className="text-yellow-300">interaction_uri</code>. The user is
                redirected to {serviceName} to grant consent. No token is issued at this step.
              </p>
            </Step>
          )}

          <Step
            stepNumber={requiredConsent ? 5 : 4}
            title={`Okta issues scoped access for ${serviceName}`}
            description="Scoped credentials granted to the agent"
            icon={<Key className="w-3 h-3 text-white" />}
            status={statusOf(hasAccessToken && granted, isLoading === true)}
          >
            <p className="text-[11px] text-white/80 leading-relaxed">
              After consent (if required), Okta STS returns an access token scoped for
              {' '}{serviceName}. For GitHub this is an opaque token (<code className="text-yellow-300">gho_*</code>);
              for Jira it may be a JWT.
            </p>
            <StepTokenView tokenInfo={tokenDetails?.access_token} label="Access Token" />
          </Step>

          <Step
            stepNumber={requiredConsent ? 6 : 5}
            title={`AI Agent acts on user's behalf in ${serviceName}`}
            description={`Performs the requested task in ${serviceName}`}
            icon={<Server className="w-3 h-3 text-white" />}
            status={statusOf(hasAccessToken && granted, isLoading === true && hasAccessToken)}
          >
            <p className="text-[11px] text-white/80 leading-relaxed">
              The agent calls the {serviceName} API with the access token in the
              Authorization header. The token&apos;s scopes enforce what the agent can do on
              behalf of the user.
            </p>
            <div className="bg-black/40 rounded p-2 font-mono text-[10px] text-white/80 leading-snug">
              <div><span className="text-yellow-300">Authorization</span>: Bearer &lt;access_token&gt;</div>
              <div><span className="text-yellow-300">Accept</span>: application/json</div>
            </div>
          </Step>

          {!latest && !isLoading && (
            <div className="text-center py-2">
              <p className="text-[11px] text-white/60">
                Send a message to walk through the flow step by step
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
