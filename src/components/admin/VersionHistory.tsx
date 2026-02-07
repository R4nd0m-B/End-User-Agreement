'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import type { Agreement } from '@/lib/types';

interface VersionHistoryProps {
  history: Agreement[];
}

export default function VersionHistory({ history }: VersionHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (history.length === 0) {
    return <p className="text-gray-400 text-sm">No versions recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {history.map((ver) => (
        <div key={ver.id} className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === ver.id ? null : ver.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-800">Version {ver.version}</span>
              <span className="text-xs text-gray-400">{ver.created_at}</span>
            </div>
            <div className="flex items-center gap-2">
              {ver.is_active === 1 && <Badge variant="success">Current</Badge>}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === ver.id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {expandedId === ver.id && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mt-3 mb-2">Title: {ver.title}</p>
              <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-100 rounded p-3 text-xs text-gray-600 agreement-scroll">
                <MarkdownRenderer content={ver.content} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
