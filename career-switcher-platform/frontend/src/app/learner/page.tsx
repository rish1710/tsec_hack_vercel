'use client'

import ChatInterface from '@/components/ChatInterface'
import Link from 'next/link'

export default function LearnerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Morph Learning Portal
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered personalized learning for your career journey
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Non-tech to tech • Homemakers • Career changers • Fresh starts
          </p>
        </header>

        <ChatInterface />
      </div>
    </main>
  )
}
