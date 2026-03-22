'use client';

import { useState } from 'react';
import { TokenExchange } from '@/types';
import { ChevronDown, ChevronRight, Key, Shield, Clock, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface TokenFlowAnalysisProps {
  exchanges: TokenExchange[];
  isLoading?: boolean;
}

export default function TokenFlowAnalysis({ exchanges, isLoading }: TokenFlowAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get the latest exchange for display
  const latestExchange = exchanges.length > 0 ? exchanges[exchanges.length - 1] : null;

  // Parse JWT claims from the exchange (mock for demo)
  const getTokenClaims = () => {
    if (!latestExchange) return null;

    // In a real scenario, you'd decode the JWT
    // For demo, we show representative claims
    return {
      sub: latestExchange.agent_name || 'user@example.com',
      aud: 'github-api',
      scope: latestExchange.scopes?.join(', ') || 'repo, read:org',
      iat: new Date().toISOString(),
      exp: new Date(Date.now() + 3600000).toISOString(),
    };
  };

  const claims = getTokenClaims();

  return (
    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#26a69a' }}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-white/10 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Token Flow Analysis</div>
            <div className="text-xs text-white/70">OAuth-STS Exchange Details</div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fadeIn">
          {/* OAuth-STS Flow Steps */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-2 flex items-center space-x-2">
              <Shield className="w-3 h-3" />
              <span>OAuth-STS Exchange Flow</span>
            </div>
            <div className="space-y-2">
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  latestExchange ? 'bg-green-400 text-green-900' : 'bg-white/30 text-white'
                }`}>
                  {latestExchange ? <CheckCircle className="w-3 h-3" /> : '1'}
                </div>
                <span className="text-sm text-white/90">ID Token → Okta STS</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  latestExchange ? 'bg-green-400 text-green-900' : 'bg-white/30 text-white'
                }`}>
                  {latestExchange ? <CheckCircle className="w-3 h-3" /> : '2'}
                </div>
                <span className="text-sm text-white/90">Client Assertion (JWT)</span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center space-x-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  latestExchange?.status === 'granted'
                    ? 'bg-green-400 text-green-900'
                    : latestExchange?.status === 'interaction_required'
                    ? 'bg-yellow-400 text-yellow-900'
                    : isLoading
                    ? 'bg-blue-400 text-blue-900 animate-pulse'
                    : 'bg-white/30 text-white'
                }`}>
                  {latestExchange?.status === 'granted' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : latestExchange?.status === 'interaction_required' ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : isLoading ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    '3'
                  )}
                </div>
                <span className="text-sm text-white/90">
                  GitHub Access Token {latestExchange?.status === 'granted' ? '✓' : latestExchange?.status === 'interaction_required' ? '(Consent Required)' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Token Claims Preview */}
          {claims && latestExchange && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-2 flex items-center space-x-2">
                <Lock className="w-3 h-3" />
                <span>Token Claims Preview</span>
              </div>
              <div className="font-mono text-xs space-y-1 bg-black/20 rounded p-2">
                <div className="flex">
                  <span className="text-cyan-300 w-12">sub:</span>
                  <span className="text-white/90 truncate">{claims.sub}</span>
                </div>
                <div className="flex">
                  <span className="text-cyan-300 w-12">aud:</span>
                  <span className="text-white/90">{claims.aud}</span>
                </div>
                <div className="flex">
                  <span className="text-cyan-300 w-12">scope:</span>
                  <span className="text-white/90 truncate">{claims.scope}</span>
                </div>
                <div className="flex">
                  <span className="text-cyan-300 w-12">exp:</span>
                  <span className="text-white/90 text-[10px]">{claims.exp}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  latestExchange?.status === 'granted'
                    ? 'bg-green-400 animate-pulse'
                    : latestExchange?.status === 'interaction_required'
                    ? 'bg-yellow-400 animate-pulse'
                    : isLoading
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-white/40'
                }`}></div>
                <span className="text-xs text-white/80">
                  {latestExchange?.status === 'granted'
                    ? 'Token Active'
                    : latestExchange?.status === 'interaction_required'
                    ? 'Consent Required'
                    : isLoading
                    ? 'Exchanging...'
                    : 'Awaiting Request'}
                </span>
              </div>
              {latestExchange && (
                <span className="text-xs text-white/60">
                  {exchanges.length} exchange{exchanges.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* No exchanges yet message */}
          {!latestExchange && !isLoading && (
            <div className="text-center py-2">
              <p className="text-xs text-white/60">
                Send a message to see token exchange flow
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
