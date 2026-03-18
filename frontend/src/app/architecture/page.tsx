'use client';

import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-bg to-primary">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-github-dark to-primary-light border-b-4 border-accent px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <h1 className="text-white text-xl font-bold">DevOps Agent</h1>
                <p className="text-gray-400 text-xs">Architecture</p>
              </div>
            </Link>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/10 hover:bg-accent/30 text-white rounded-lg transition flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Chat</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">OAuth-STS Architecture</h1>
          <p className="text-gray-300 text-lg">Okta Brokered Consent for AI Agents</p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Token Exchange Flow</h2>

          <div className="flex flex-col items-center space-y-4">
            {/* User Browser */}
            <div className="w-full max-w-2xl p-4 bg-gradient-to-r from-accent/10 to-devops-purple/10 border-2 border-accent rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-800">User Browser</div>
                  <div className="text-sm text-gray-500">Next.js Frontend</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 ml-13">
                • Okta SSO login<br/>
                • Chat interface<br/>
                • Token exchange visualization
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-xs text-gray-500 mt-1">HTTPS (Bearer ID Token)</span>
            </div>

            {/* Backend */}
            <div className="w-full max-w-2xl p-4 bg-gradient-to-r from-github-dark/10 to-primary/10 border-2 border-github-dark rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-github-dark rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-800">FastAPI Backend</div>
                  <div className="text-sm text-gray-500">LangGraph Orchestrator</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 ml-13">
                • Router → Intent detection<br/>
                • OAuth-STS token exchange<br/>
                • GitHub API calls<br/>
                • Response synthesis with Claude
              </div>
            </div>

            {/* Split Arrow */}
            <div className="flex items-center justify-center space-x-16">
              <div className="flex flex-col items-center">
                <svg className="w-6 h-6 text-gray-400 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="flex flex-col items-center">
                <svg className="w-6 h-6 text-gray-400 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Okta and GitHub */}
            <div className="flex items-center justify-center space-x-8 w-full max-w-2xl">
              <div className="flex-1 p-4 bg-gradient-to-r from-okta-blue/10 to-okta-blue-light/10 border-2 border-okta-blue rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-okta-blue rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M256 0C114.5 0 0 114.5 0 256s114.5 256 256 256 256-114.5 256-256S397.5 0 256 0zm0 384c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Okta STS</div>
                    <div className="text-sm text-gray-500">/oauth2/v1/token</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 ml-13">
                  • Token exchange<br/>
                  • Brokered consent<br/>
                  • Agent JWT assertion
                </div>
              </div>

              <div className="flex-1 p-4 bg-gradient-to-r from-github-green/10 to-success-green/10 border-2 border-github-green rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-github-green rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">GitHub API</div>
                    <div className="text-sm text-gray-500">api.github.com</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 ml-13">
                  • List repos/PRs/issues<br/>
                  • Create comments<br/>
                  • Close issues
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth-STS Details */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">OAuth-STS Token Exchange</h2>

          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm">
            <div className="text-gray-500 mb-2">POST /oauth2/v1/token</div>
            <div className="space-y-2">
              <div><span className="text-accent">grant_type:</span> urn:ietf:params:oauth:grant-type:token-exchange</div>
              <div><span className="text-accent">requested_token_type:</span> urn:okta:params:oauth:token-type:oauth-sts</div>
              <div><span className="text-accent">subject_token:</span> &lt;user's ID token&gt;</div>
              <div><span className="text-accent">subject_token_type:</span> urn:ietf:params:oauth:token-type:id_token</div>
              <div><span className="text-accent">client_assertion_type:</span> urn:ietf:params:oauth:client-assertion-type:jwt-bearer</div>
              <div><span className="text-accent">client_assertion:</span> &lt;signed JWT&gt;</div>
              <div><span className="text-accent">resource:</span> &lt;GitHub resource indicator&gt;</div>
            </div>
          </div>
        </div>

        {/* Comparison with ID-JAG */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Difference from ID-JAG (ProGear)</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-accent/5 to-devops-purple/5 border-2 border-accent/30 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-3">ProGear (ID-JAG)</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-accent">→</span>
                  <span>User token</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent">→</span>
                  <span>ID-JAG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent">→</span>
                  <span>Custom Auth Server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-accent">→</span>
                  <span className="font-semibold">Internal API token</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-okta-blue/5 to-github-green/5 border-2 border-okta-blue/30 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-3">DevOps Agent (OAuth-STS)</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-okta-blue">→</span>
                  <span>User token</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-okta-blue">→</span>
                  <span>OAuth-STS (Brokered Consent)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-okta-blue">→</span>
                  <span className="font-semibold">External service token (GitHub)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
