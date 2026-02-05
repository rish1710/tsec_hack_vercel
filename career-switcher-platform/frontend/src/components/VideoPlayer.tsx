'use client'

import { useState, useRef, useEffect } from 'react'
import Quiz from './Quiz'

interface VideoPlayerProps {
  videoSrc: string
  sessionData: any
  videoDescription: string
  onEndSession: (summary: any) => void
  onGoBack: () => void
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

// Quiz timestamps (in seconds)
const QUIZ_TIMES = [20, 50, 90]  // First at 20s (after 10s free + 10s paid), then 50s, 90s
const FREE_PREVIEW_TIME = 10  // 10 seconds free

export default function VideoPlayer({ videoSrc, sessionData, videoDescription, onEndSession, onGoBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentCost, setCurrentCost] = useState(0)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [ending, setEnding] = useState(false)

  // Free preview state
  const [isPreview, setIsPreview] = useState(true)
  const [showPreviewEnd, setShowPreviewEnd] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<number | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([])
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  // Track video time updates
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime)
      setCurrentVideoTime(currentTime)

      // Check for preview end (10 seconds)
      if (isPreview && currentTime >= FREE_PREVIEW_TIME) {
        video.pause()
        setShowPreviewEnd(true)
      }

      // Check for quiz times
      if (isPaid && !currentQuiz) {
        const quizIndex = QUIZ_TIMES.findIndex(
          (time, idx) => currentTime >= time && !completedQuizzes.includes(idx)
        )

        if (quizIndex !== -1) {
          video.pause()
          generateQuiz(quizIndex + 1)
          setCurrentQuiz(quizIndex)
        }
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [isPreview, isPaid, currentQuiz, completedQuizzes])

  // Timer for paid content only
  useEffect(() => {
    if (!isPaid) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const newSeconds = prev + 1
        const cost = (newSeconds / 60) * sessionData.session.rate_per_minute
        setCurrentCost(Math.min(cost, sessionData.session.locked_amount))
        return newSeconds
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaid, sessionData])

  const generateQuiz = (quizNumber: number) => {
    // Generate quiz based on video description and difficulty
    const difficulty = quizNumber === 1 ? 'intro' : quizNumber === 2 ? 'intermediate' : 'advanced'

    // Sample questions - in production, use AI to generate from description
    const allQuestions: Record<number, QuizQuestion[]> = {
      1: [
        {
          question: `Based on the course intro, what is the main focus of "${sessionData.video.title}"?`,
          options: [
            'Building basic foundational skills',
            'Advanced expert techniques',
            'Industry best practices',
            'Project management'
          ],
          correctAnswer: 0
        },
        {
          question: 'What background is this course designed for?',
          options: [
            'Experienced professionals',
            'Career switchers and beginners',
            'PhD researchers',
            'Corporate managers'
          ],
          correctAnswer: 1
        },
        {
          question: 'What should you expect to learn first?',
          options: [
            'Core fundamentals and basics',
            'Advanced optimization',
            'Real-world projects',
            'Team collaboration'
          ],
          correctAnswer: 0
        }
      ],
      2: [
        {
          question: 'What key concept was just covered?',
          options: [
            'Practical application methods',
            'Historical context only',
            'Future predictions',
            'Unrelated topics'
          ],
          correctAnswer: 0
        },
        {
          question: 'How should you apply what you learned?',
          options: [
            'Memorize without practice',
            'Practice with hands-on exercises',
            'Just watch passively',
            'Skip to advanced topics'
          ],
          correctAnswer: 1
        }
      ],
      3: [
        {
          question: 'What advanced technique was demonstrated?',
          options: [
            'Industry-standard workflows',
            'Beginner basics',
            'Outdated methods',
            'Unrelated skills'
          ],
          correctAnswer: 0
        }
      ]
    }

    setQuizQuestions(allQuestions[quizNumber] || allQuestions[1])
  }

  const handleContinuePaid = () => {
    setIsPreview(false)
    setIsPaid(true)
    setShowPreviewEnd(false)
    videoRef.current?.play()
  }

  const handleQuizComplete = async (score: number) => {
    // Submit quiz score to backend
    try {
      await fetch('http://localhost:8000/api/video-session/quiz-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionData.session.session_id,
          score,
          total_questions: quizQuestions.length,
          video_time: currentVideoTime
        })
      })
    } catch (err) {
      console.error('Error submitting quiz score:', err)
    }

    setCompletedQuizzes([...completedQuizzes, currentQuiz!])
    setCurrentQuiz(null)
    videoRef.current?.play()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndSession = async () => {
    setEnding(true)

    try {
      const response = await fetch('http://localhost:8000/api/video-session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionData.session.session_id
        })
      })

      if (!response.ok) throw new Error('Failed to end session')

      const data = await response.json()
      onEndSession(data)
    } catch (err) {
      console.error('Error ending session:', err)
      alert('Error ending session. Please try again.')
      setEnding(false)
      setShowEndConfirm(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          className="w-full aspect-video"
          onError={(e) => console.error('Video error:', e)}
        >
          Your browser does not support the video tag.
        </video>

        {/* Quiz Markers on Timeline */}
        {isPaid && (
          <div className="absolute bottom-12 left-0 right-0 px-4 pointer-events-none">
            <div className="relative h-1">
              {QUIZ_TIMES.map((time, idx) => {
                const percentage = (time / 180) * 100  // Assuming 3min video
                return (
                  <div
                    key={idx}
                    className="absolute top-0 transform -translate-y-1/2"
                    style={{ left: `${percentage}%` }}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      completedQuizzes.includes(idx) ? 'bg-green-500' : 'bg-yellow-400'
                    } border-2 border-white shadow-lg`} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Preview Watermark */}
        {isPreview && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg">
            FREE PREVIEW: {Math.max(0, FREE_PREVIEW_TIME - currentVideoTime)}s left
          </div>
        )}
      </div>

      {/* Payment Tracker (only show when paid) */}
      {isPaid && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Time Watched (Paid)</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(elapsedSeconds)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Cost</p>
              <p className="text-2xl font-bold text-green-600">${currentCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Locked Amount</p>
              <p className="text-2xl font-bold text-gray-800">${sessionData.session.locked_amount}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Rate: ${sessionData.session.rate_per_minute.toFixed(2)}/min</p>
                <p className="text-xs text-gray-500 mt-1">
                  Refund after end: ${(sessionData.session.locked_amount - currentCost).toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Quizzes completed: {completedQuizzes.length} / {QUIZ_TIMES.length}
                </p>
              </div>
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview End Modal */}
      {showPreviewEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Free Preview Ended</h3>

            <p className="text-gray-600 mb-6">
              You've watched the first {FREE_PREVIEW_TIME} seconds for free!
              Continue watching to unlock the full course content.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">Starting from now:</p>
              <p className="text-lg font-semibold text-blue-600">
                ${sessionData.session.rate_per_minute.toFixed(2)} per minute
              </p>
              <p className="text-xs text-gray-500 mt-2">
                You'll only pay for what you watch. Unused balance refunded.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onGoBack}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← View Other Videos
              </button>
              <button
                onClick={handleContinuePaid}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Continue Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {currentQuiz !== null && quizQuestions.length > 0 && (
        <Quiz
          quizNumber={currentQuiz + 1}
          questions={quizQuestions}
          onComplete={handleQuizComplete}
          onClose={() => {
            setCurrentQuiz(null)
            videoRef.current?.play()
          }}
        />
      )}

      {/* End Session Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">End Session?</h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Time watched:</span>
                <span className="font-medium">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">You will be charged:</span>
                <span className="font-medium text-green-600">${currentCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Refund amount:</span>
                <span className="font-medium text-blue-600">
                  ${(sessionData.session.locked_amount - currentCost).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Quizzes completed:</span>
                <span className="font-medium">{completedQuizzes.length} / {QUIZ_TIMES.length}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              The instructor will receive ${currentCost.toFixed(2)} and ${(sessionData.session.locked_amount - currentCost).toFixed(2)} will be refunded to your wallet.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                disabled={ending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Continue Watching
              </button>
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {ending ? 'Processing...' : 'End & Settle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
