'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  sessionId: string
  onSubmit: (stars: number, review: string) => void
}

interface Reflection {
  positives: string[]
  suggestions: string[]
}

export default function FeedbackForm({ sessionId, onSubmit }: FeedbackFormProps) {
  const [stars, setStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState<Reflection | null>(null)
  const [loadingReflection, setLoadingReflection] = useState(false)

  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a star rating')
      return
    }

    setSubmitting(true)

    try {
      // Submit feedback
      const response = await fetch('http://localhost:8000/api/video-session/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          stars,
          review
        })
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      // Get AI reflection
      setLoadingReflection(true)
      const reflectionResponse = await fetch('http://localhost:8000/api/student/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId
        })
      })

      if (reflectionResponse.ok) {
        const reflectionData = await reflectionResponse.json()
        setReflection(reflectionData.reflection)
        setShowReflection(true)
      } else {
        // If reflection fails, just show summary
        onSubmit(stars, review)
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
      setLoadingReflection(false)
    }
  }

  const handleContinue = () => {
    onSubmit(stars, review)
  }

  // Show reflection after feedback submitted
  if (showReflection && reflection) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Learning Reflection</h2>
          <p className="text-gray-600">Here's what we noticed about your learning journey</p>
        </div>

        {/* Positives */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">What You Did Well</h3>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <ul className="space-y-2">
              {reflection.positives.map((positive, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <p className="text-gray-700">{positive}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Ways to Grow</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <ul className="space-y-2">
              {reflection.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <p className="text-gray-700">{suggestion}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          View Session Summary
        </button>

        {/* AI Badge */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 7H7v6h6V7z" />
            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
          </svg>
          <span>Personalized insights powered by AI</span>
        </div>
      </div>
    )
  }

  // Loading reflection
  if (loadingReflection) {
    return (
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4 animate-pulse">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Your Reflection...</h2>
          <p className="text-gray-600">AI is analyzing your learning journey</p>
        </div>
      </div>
    )
  }

  // Feedback form
  return (
    <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">How was your experience?</h2>
        <p className="text-gray-600">Your feedback helps us improve</p>
      </div>

      {/* Star Rating */}
      <div className="mb-8">
        <p className="text-center text-gray-700 font-medium mb-4">Rate this course</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStars(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
            >
              <svg
                className={`w-12 h-12 ${
                  star <= (hoveredStar || stars)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          ))}
        </div>
        {stars > 0 && (
          <p className="text-center text-gray-600 mt-2">
            {stars === 5 ? 'Excellent!' : stars === 4 ? 'Great!' : stars === 3 ? 'Good' : stars === 2 ? 'Fair' : 'Needs Improvement'}
          </p>
        )}
      </div>

      {/* Review Text Area */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Share your thoughts (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="What did you like or what could be improved?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || stars === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  )
}
