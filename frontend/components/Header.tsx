'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-white">Murph</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link
            href="/student/chat"
            className={`transition-colors ${
              pathname === '/student/chat'
                ? 'text-blue-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Chat
          </Link>
          <Link
            href="/student/sessions"
            className={`transition-colors ${
              pathname === '/student/sessions'
                ? 'text-blue-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sessions
          </Link>
          <Link
            href="/student/progress"
            className={`transition-colors ${
              pathname === '/student/progress'
                ? 'text-blue-400'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Progress
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">$0.00</span>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
            Account
          </button>
        </div>
      </nav>
    </header>
  );
}
