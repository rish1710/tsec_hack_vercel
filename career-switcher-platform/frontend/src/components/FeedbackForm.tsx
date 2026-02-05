'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  sessionId: string
  onSubmit: (stars: number, review: string) => void
}

export default function FeedbackForm({ sessionId, onSubmit }: FeedbackFormProps) {
  const [stars, setStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a star rating')
      return
    }

    setSubmitting(true)

    try {
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

      onSubmit(stars, review)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
