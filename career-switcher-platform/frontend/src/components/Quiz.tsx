'use client'

import { useState } from 'react'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizProps {
  quizNumber: number
  questions: QuizQuestion[]
  onComplete: (score: number) => void
  onClose: () => void
}

export default function Quiz({ quizNumber, questions, onComplete, onClose }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    setAnswers([...answers, isCorrect])

    if (isCorrect) {
      setScore(score + 1)
    }

    if (currentQuestion + 1 < questions.length) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      }, 800)
    } else {
      setTimeout(() => {
        setShowResult(true)
      }, 800)
    }
  }

  const handleComplete = () => {
    onComplete(score)
    onClose()
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {!showResult ? (
          <>
            {/* Quiz Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Quiz #{quizNumber}
                </h2>
                <span className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 min-h-[200px] flex flex-col justify-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </>
        ) : (
          /* Quiz Result */
          <div className="text-center">
            <div className={`inline-block p-6 rounded-full mb-6 ${
              score / questions.length >= 0.7 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {score / questions.length >= 0.7 ? (
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {score / questions.length >= 0.7 ? 'Great Job!' : 'Keep Learning!'}
            </h3>
            <p className="text-gray-600 mb-6">
              You scored {score} out of {questions.length}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p className="text-gray-600">Score</p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Continue Watching
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
