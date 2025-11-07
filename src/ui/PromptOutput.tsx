// UI layer - Prompt output component

'use client';

import { useState } from 'react';

interface PromptOutputProps {
  prompt: string;
}

export function PromptOutput({ prompt }: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!prompt) return null;

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Generated Prompt</h2>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-purple-200">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
