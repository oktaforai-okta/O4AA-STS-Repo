'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error = searchParams?.get('error');

  const handleSignIn = () => {
    signIn('okta', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-primary to-primary-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-accent/30 rounded-full blur-3xl animate-pulse"></div>
            <svg className="w-24 h-24 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DevOps Agent</h1>
          <p className="text-gray-300">Okta Brokered Consent + GitHub</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-accent/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome</h2>
            <p className="text-gray-600">Sign in to access your DevOps assistant</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-red/10 border-l-4 border-error-red rounded-lg">
              <p className="text-error-red text-sm font-semibold">
                {error === 'OAuthCallback' && 'Authentication failed. Please try again.'}
                {error === 'Configuration' && 'Okta configuration error. Check environment variables.'}
                {!['OAuthCallback', 'Configuration'].includes(error) && `Error: ${error}`}
              </p>
            </div>
          )}

          {/* Sign In Button - Bright Green for visibility */}
          <button
            onClick={handleSignIn}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center space-x-3 border-b-4 border-green-700"
          >
            <svg className="w-6 h-6" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 0C114.5 0 0 114.5 0 256s114.5 256 256 256 256-114.5 256-256S397.5 0 256 0zm0 384c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z"/>
            </svg>
            <span className="text-lg">Sign in with Okta</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-okta-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secured by Okta Identity</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="text-2xl mb-2">🔐</div>
            <div className="text-xs text-gray-300">OAuth-STS</div>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-xs text-gray-300">AI Agent</div>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-xs text-gray-300">GitHub</div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            This demo showcases Okta Brokered Consent (OAuth-STS) for AI agents
            accessing external SaaS applications on behalf of users.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-primary to-primary-light flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
