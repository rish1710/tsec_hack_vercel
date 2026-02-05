'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PaymentFlow from '@/components/PaymentFlow'
import VideoPlayer from '@/components/VideoPlayer'
import FeedbackForm from '@/components/FeedbackForm'

interface Video {
  id: string
  title: string
  description: string
  category: string
  duration: string
  video_link: string
  transcript: string
  keywords: string[]
}

type ViewState = 'details' | 'payment' | 'watching' | 'summary' | 'feedback'

export default function VideoPage() {
  const params = useParams()
  const videoId = params.id as string
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [viewState, setViewState] = useState<ViewState>('details')
  const [sessionData, setSessionData] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  // Course price based on duration (rough calculation)
  const coursePrice = video ? "30.00" : "30.00"

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/video/${videoId}`)
        if (!response.ok) throw new Error('Video not found')

        const data = await response.json()
        setVideo(data)
      } catch (err) {
        console.error('Error fetching video:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  const handleStartPayment = () => {
    setViewState('payment')
  }

  const handlePaymentComplete = (data: any) => {
    setSessionData(data)
    setViewState('watching')
  }

  const handleEndSession = (summaryData: any) => {
    setSummary(summaryData)
    setViewState('feedback')
  }

  const handleGoBack = () => {
    window.location.href = '/'
  }

  const handleFeedbackSubmit = (stars: number, review: string) => {
    // Feedback already submitted to backend, now show summary
    setViewState('summary')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-xl text-gray-600">Loading...</div>
      </main>
    )
  }

  if (error || !video) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Video Not Found</h1>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Chat
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </Link>
        </div>

        {/* Video Content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Course Details View */}
          {viewState === 'details' && (
            <>
              <div className="bg-gray-900 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block p-6 bg-blue-600 rounded-full mb-4">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg mb-4">Pay-per-watch course</p>
                  <p className="text-gray-300 text-sm max-w-md mx-auto">
                    Lock ${coursePrice} to start. You'll only be charged for the time you actually watch.
                    Unused funds are automatically refunded.
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                      {video.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{video.title}</h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {video.duration}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lock: ${coursePrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">About This Course</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">{video.description}</p>

                  <h2 className="text-xl font-semibold text-gray-800 mb-3">What You'll Learn</h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {video.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleStartPayment}
                    className="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                  >
                    Start Learning Now - Lock ${coursePrice}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Pay only for what you watch. Unused balance refunded automatically.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Watching View */}
          {viewState === 'watching' && sessionData && (
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{video.title}</h1>
                <p className="text-gray-600">Session started - Timer is running</p>
              </div>

              <VideoPlayer
                videoSrc="/videos/course.mp4"
                sessionData={sessionData}
                videoDescription={video.description}
                onEndSession={handleEndSession}
                onGoBack={handleGoBack}
              />
            </div>
          )}

          {/* Feedback View */}
          {viewState === 'feedback' && summary && sessionData && (
            <div className="p-8">
              <FeedbackForm
                sessionId={sessionData.session.session_id}
                onSubmit={handleFeedbackSubmit}
              />
            </div>
          )}

          {/* Summary View */}
          {viewState === 'summary' && summary && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block p-6 bg-green-100 rounded-full mb-4">
                  <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
                <p className="text-gray-600">Your session is complete</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Time Watched:</span>
                  <span className="font-bold">{summary.summary.elapsed_minutes.toFixed(2)} minutes</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Amount Charged:</span>
                  <span className="font-bold text-green-600">${summary.summary.amount_charged}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Amount Refunded:</span>
                  <span className="font-bold text-blue-600">${summary.summary.amount_refunded}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Teacher Payment:</span>
                    <span className={summary.summary.teacher_paid ? 'text-green-600' : 'text-red-600'}>
                      {summary.summary.teacher_paid ? '✓ Sent' : '✗ Failed'}
                    </span>
                  </div>
                </div>

                {/* Quiz Results */}
                {summary.summary.quiz_scores && summary.summary.quiz_scores.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">Quiz Performance</h4>
                    {summary.summary.quiz_scores.map((quiz: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Quiz {quiz.quiz_number}:</span>
                        <span className="font-medium">
                          {quiz.score}/{quiz.total_questions} ({Math.round((quiz.score / quiz.total_questions) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feedback Display */}
                {summary.summary.feedback && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">Your Feedback</h4>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">Rating:</span>
                      <div className="flex">
                        {[...Array(summary.summary.feedback.stars)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {summary.summary.feedback.review && (
                      <p className="text-sm text-gray-600 italic">"{summary.summary.feedback.review}"</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Watch Again
                </button>
                <Link
                  href="/"
                  className="block w-full px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Flow Modal */}
      {viewState === 'payment' && (
        <PaymentFlow
          videoId={video.id}
          videoTitle={video.title}
          price={coursePrice}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </main>
  )
}
