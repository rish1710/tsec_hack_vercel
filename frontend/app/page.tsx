import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Murph
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 font-medium">
            AI-Guided Learning, Pay-Per-Minute
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn with clarity, not commitment. Pay only for the minutes you use.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/student/chat"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Learning
          </Link>
          <Link
            href="/teacher/dashboard"
            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Teach on Murph
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pay Per Minute</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Only charged for actual time used</p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Guidance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Murph helps you find the right teacher</p>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Fair Pricing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Automatic refunds for unused funds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

