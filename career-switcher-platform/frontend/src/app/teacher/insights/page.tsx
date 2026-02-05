'use client'

import { useState } from 'react'

interface Insights {
  strengths: string[]
  improvements: string[]
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/teacher/generate-insights/vid001', {
        method: 'POST'
      })
      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error('Error generating insights:', error)
      alert('Failed to generate insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Insights 💡</h1>
        <p className="text-purple-100">Discover what's working and what needs improvement</p>
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <button
          onClick={generateInsights}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing Reviews...</span>
            </span>
          ) : (
            '🤖 Generate AI Insights'
          )}
        </button>
      </div>

      {/* Insights Display */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-green-500">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">✅</span>
              <h2 className="text-2xl font-bold text-gray-800">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {insights.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold mt-0.5">{idx + 1}.</span>
                  <p className="text-gray-700 flex-1">{strength}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-orange-500">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🔧</span>
              <h2 className="text-2xl font-bold text-gray-800">Areas to Improve</h2>
            </div>
            <ul className="space-y-3">
              {insights.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-600 font-bold mt-0.5">{idx + 1}.</span>
                  <p className="text-gray-700 flex-1">{improvement}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && (
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <span className="text-6xl mb-4 block">🎯</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Insights Yet</h3>
          <p className="text-gray-500">Click the button above to generate AI-powered insights from student reviews</p>
        </div>
      )}
    </div>
  )
}
