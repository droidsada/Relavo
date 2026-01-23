import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MessageOutputProps {
  message: string;
}

export default function MessageOutput({ message }: MessageOutputProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!message) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Your Message</h3>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
      </div>

      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          Tip: Review and personalize further before sending!
        </p>
      </div>
    </div>
  );
}
