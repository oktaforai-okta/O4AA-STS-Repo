'use client';

import { FolderGit2, GitPullRequest, Bug, Zap, KeyRound } from 'lucide-react';

interface QuickActionsCardProps {
  onAction: (message: string) => void;
  onTestConsent?: () => void;
}

const quickActions = [
  {
    icon: <FolderGit2 className="w-4 h-4" />,
    label: 'View All Repos',
    message: 'Show all my GitHub repositories',
    color: 'accent'
  },
  {
    icon: <GitPullRequest className="w-4 h-4" />,
    label: 'Review PRs',
    message: 'List all open pull requests',
    color: 'devops-purple'
  },
  {
    icon: <Bug className="w-4 h-4" />,
    label: 'Triage Issues',
    message: 'Show all open issues',
    color: 'error-red'
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Quick Help',
    message: 'What can you do?',
    color: 'github-green'
  },
];

export default function QuickActionsCard({ onAction, onTestConsent }: QuickActionsCardProps) {
  return (
    <div className="rounded-xl border-2 p-4 shadow-sm" style={{ backgroundColor: '#e0f2f1', borderColor: '#26a69a' }}>
      <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        Quick Actions
      </div>
      <div className="space-y-2">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onAction(action.message)}
            className="w-full text-left px-3 py-2 bg-white hover:bg-accent/10 rounded-lg transition-all hover:shadow-md hover:scale-[1.02] flex items-center gap-2 group"
          >
            <div className={`text-${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-sm text-gray-700 group-hover:text-accent transition-colors">
              {action.label}
            </span>
          </button>
        ))}
        {onTestConsent && (
          <button
            onClick={onTestConsent}
            className="w-full text-left px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-all hover:shadow-md hover:scale-[1.02] flex items-center gap-2 group border border-orange-300"
          >
            <div className="text-orange-600 group-hover:scale-110 transition-transform">
              <KeyRound className="w-4 h-4" />
            </div>
            <span className="text-sm text-orange-700 font-medium">
              Test Consent Flow
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
