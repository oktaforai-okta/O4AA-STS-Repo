'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Key, Lock, Shield, Activity, GitBranch } from 'lucide-react';
import CollapsibleSection from '@/components/CollapsibleSection';

export default function ArchitecturePage() {
  const { data: session } = useSession();

  const userSub = (session?.user as any)?.sub || '00u...';
  const userName = session?.user?.name || 'Developer';
  const userEmail = session?.user?.email || 'user@example.com';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div>
              <h1 className="text-white text-2xl font-bold">DevOps Agent</h1>
              <p className="text-gray-400 text-sm">Architecture & Security Overview</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition font-semibold shadow-lg hover:scale-[1.02] transform"
          >
            Back to Chat
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">OAuth-STS Architecture</h2>
          <p className="text-gray-300 text-lg">Okta Brokered Consent for AI Agents</p>
        </div>

        {/* Section 1: OAuth-STS Token Exchange Flow */}
        <CollapsibleSection
          title="OAuth-STS Token Exchange Flow"
          subtitle="Complete authentication and authorization flow"
          icon={<Key className="w-5 h-5" />}
          defaultOpen={true}
        >
          <div className="mt-4 space-y-4">
            <p className="text-gray-700">
              The DevOps Agent uses <strong>Okta Brokered Consent (OAuth-STS)</strong> to securely access GitHub on behalf of users.
            </p>

            {/* Flow Steps */}
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 bg-purple-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">User Authentication</div>
                  <div className="text-sm text-gray-600">User logs in via Okta OIDC and receives an ID token from the linked application</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">OAuth-STS Token Exchange</div>
                  <div className="text-sm text-gray-600">Backend makes POST request to Okta with user's ID token + signed client assertion JWT</div>
                  <div className="mt-2 bg-white rounded p-2 text-xs font-mono text-gray-600">
                    POST /oauth2/v1/token<br/>
                    grant_type=token-exchange<br/>
                    resource=rajeshkumar-okta:github:application
                  </div>
                </div>
              </div>

              {/* Step 3a */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3a
                </div>
                <div className="flex-1 bg-amber-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">First Time: interaction_required</div>
                  <div className="text-sm text-gray-600">Okta returns 400 with interaction_uri → Modal appears → User authorizes at GitHub → Popup closes</div>
                </div>
              </div>

              {/* Step 3b */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3b
                </div>
                <div className="flex-1 bg-green-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">Already Authorized: access_token</div>
                  <div className="text-sm text-gray-600">Okta returns 200 with GitHub access token (cached, valid for ~8 hours)</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1 bg-indigo-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">Retry After Authorization</div>
                  <div className="text-sm text-gray-600">Same OAuth-STS POST → Okta returns GitHub token → GitHub API call succeeds</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  5
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-3">
                  <div className="font-semibold text-gray-800 mb-1">GitHub API Calls</div>
                  <div className="text-sm text-gray-600">Use exchanged token to list repos, PRs, issues, create comments, etc.</div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Client Assertion JWT */}
        <CollapsibleSection
          title="Client Assertion JWT"
          subtitle="How the AI Agent authenticates to Okta"
          icon={<Lock className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="mt-4 space-y-4">
            <p className="text-gray-700">
              The AI Agent proves its identity by signing a JWT with its private key (RS256).
            </p>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">JWT Structure:</div>
              <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono">
{`{
  "header": {
    "kid": "35b6430dae8d3135e5cff2194625091f",
    "alg": "RS256"
  },
  "payload": {
    "iss": "${(session as any)?.user?.sub || 'wlp...'}",
    "sub": "${(session as any)?.user?.sub || 'wlp...'}",
    "aud": "https://rkumariagoie.oktapreview.com/oauth2/v1/token",
    "iat": ${Math.floor(Date.now() / 1000)},
    "exp": ${Math.floor(Date.now() / 1000) + 60},
    "jti": "unique-request-id"
  }
}`}</pre>
              <div className="text-xs text-gray-500 mt-2">Signed with AI Agent's private JWK using RS256 algorithm</div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 3: GitHub Integration */}
        <CollapsibleSection
          title="GitHub Integration"
          subtitle="Supported operations and API endpoints"
          icon={<GitBranch className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-800 text-sm mb-2">📁 Repositories</div>
                <div className="text-xs text-gray-600 font-mono">GET /user/repos</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-800 text-sm mb-2">🔀 Pull Requests</div>
                <div className="text-xs text-gray-600 font-mono">{"GET /repos/{owner}/{repo}/pulls"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-800 text-sm mb-2">🐛 Issues</div>
                <div className="text-xs text-gray-600 font-mono">{"GET /repos/{owner}/{repo}/issues"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-800 text-sm mb-2">💬 Comments</div>
                <div className="text-xs text-gray-600 font-mono">{"POST /repos/.../issues/{n}/comments"}</div>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-700">
                <strong>Authentication:</strong> All GitHub API calls use the access token obtained from OAuth-STS exchange.
              </div>
              <div className="text-xs text-gray-600 mt-2 font-mono bg-white rounded p-2">
                Authorization: Bearer gho_xxxxxxxxxx
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: OAuth-STS vs ID-JAG */}
        <CollapsibleSection
          title="OAuth-STS vs ID-JAG Comparison"
          subtitle="Understanding the key differences"
          icon={<Shield className="w-5 h-5" />}
          defaultOpen={true}
        >
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ID-JAG (ProGear) */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                    PG
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">ProGear (ID-JAG)</div>
                    <div className="text-xs text-gray-500">Internal API Access</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">→</span>
                    <span>User ID Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">→</span>
                    <span>ID-JAG Exchange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">→</span>
                    <span>Custom Auth Server</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">→</span>
                    <span className="font-semibold">Internal API Token</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200 text-xs text-gray-600">
                  <strong>Use Case:</strong> Enterprise microservices
                </div>
              </div>

              {/* OAuth-STS (DevOps) */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    DA
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">DevOps Agent (OAuth-STS)</div>
                    <div className="text-xs text-gray-500">External SaaS Access</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">→</span>
                    <span>User ID Token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">→</span>
                    <span>OAuth-STS Exchange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">→</span>
                    <span>Brokered Consent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500">→</span>
                    <span className="font-semibold">GitHub Access Token</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-200 text-xs text-gray-600">
                  <strong>Use Case:</strong> Third-party SaaS integrations
                </div>
              </div>
            </div>

            {/* Key Differences Table */}
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Aspect</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID-JAG</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">OAuth-STS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 font-medium">Target</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Internal APIs</td>
                    <td className="px-4 py-2 text-sm text-gray-600">External SaaS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 font-medium">Consent</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Not required</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Required (brokered)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 font-medium">Token Type</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Custom audience</td>
                    <td className="px-4 py-2 text-sm text-gray-600">External service</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700 font-medium">Steps</td>
                    <td className="px-4 py-2 text-sm text-gray-600">2-step exchange</td>
                    <td className="px-4 py-2 text-sm text-gray-600">Direct exchange</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 5: Security & Governance */}
        <CollapsibleSection
          title="Security & Governance"
          subtitle="How Okta ensures secure access"
          icon={<Activity className="w-5 h-5" />}
          defaultOpen={false}
        >
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-800">User Consent</div>
                </div>
                <div className="text-sm text-gray-600">
                  Users explicitly authorize the AI agent to access their GitHub account. Can be revoked anytime.
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-800">Audit Trail</div>
                </div>
                <div className="text-sm text-gray-600">
                  All OAuth-STS exchanges logged in Okta system logs. Full visibility into AI agent actions.
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-800">Token Security</div>
                </div>
                <div className="text-sm text-gray-600">
                  Tokens are time-limited, can be revoked, and are never stored in frontend code.
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-800">Scoped Access</div>
                </div>
                <div className="text-sm text-gray-600">
                  Agent only gets permissions granted in GitHub App configuration. Principle of least privilege.
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Live User Info */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-300/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-white">Current Session</div>
              <div className="text-sm text-gray-300">{userEmail}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-gray-400 mb-1">User ID</div>
              <div className="text-white font-mono">{userSub}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-gray-400 mb-1">Auth Method</div>
              <div className="text-white font-mono">Okta OIDC</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
