'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Career Switcher Platform
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
