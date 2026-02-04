'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ConversationThread {
  id: string;
  title: string;
  timestamp: string;
}

export function Sidebar() {
  const [conversations, setConversations] = useState<ConversationThread[]>([
    {
      id: '1',
      title: 'Understanding React Hooks',
      timestamp: 'Today',
    },
    {
      id: '2',
      title: 'Database Design Basics',
      timestamp: 'Yesterday',
    },
  ]);

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 h-screen flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-700">
        <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2">
          <span>+</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
            Recent
          </h3>
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/student/chat?thread=${conv.id}`}
              className="block p-3 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300 truncate"
            >
              <p className="truncate font-medium">{conv.title}</p>
              <p className="text-xs text-slate-500">{conv.timestamp}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300">
          ⚙️ Settings
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm text-slate-300">
          ❓ Help
        </button>
      </div>
    </aside>
  );
}
