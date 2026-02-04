'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
interface Balance {
  balance?: string
  availableBalance?: string
  currency?: string
  [key: string]: any
}

interface Session {
  session_id: string
  intent_id: string
  locked_amount: number
  rate_per_minute: number
  elapsed_seconds: number
  elapsed_minutes?: number
  amount_charged?: number
  amount_refunded?: number
  status: string
  teacher: string
  student: string
  session_title: string
}

interface Summary {
  elapsed_minutes: number
  amount_charged: number
  amount_refunded: number
  teacher_paid: boolean
  settlement_method: string
}

// Flow steps
type FlowStep = 'connect' | 'select' | 'active' | 'summary'

export default function Home() {
  // State management
  const [step, setStep] = useState<FlowStep>('connect')
  const [balance, setBalance] = useState<Balance | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Hardcoded session details
  const SESSION_TITLE = 'Live Guitar Basics'
  const RATE_PER_MINUTE = 1.50
  
  const MAX_LOCK = 30.00

  // Timer effect for active session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (step === 'active' && session) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [step, session])

  // Calculate current cost
  const currentCost = (elapsedSeconds / 60) * RATE_PER_MINUTE

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Step 1: Connect Wallet
  const handleConnectWallet = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔌 Connecting wallet...')
      const response = await axios.get(`${API_URL}/api/wallet/balance`)
      console.log('✅ Balance received:', response.data)

      setBalance(response.data)
      setStep('select')
    } catch (err: any) {
      console.error('❌ Error connecting wallet:', err)
      setError(err.response?.data?.detail || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Start Session
  const handleStartSession = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🎬 Starting session...')
      const response = await axios.post(`${API_URL}/api/session/start`, {
        amount: MAX_LOCK.toString(),
        rate_per_minute: RATE_PER_MINUTE,
        session_title: SESSION_TITLE
      })

      console.log('✅ Session started:', response.data)

      setSession(response.data.session)
      setElapsedSeconds(0)
      setStep('active')
    } catch (err: any) {
      console.error('❌ Error starting session:', err)
      setError(err.response?.data?.detail || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: End Session
  const handleEndSession = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      console.log('🛑 Ending session...')
      const response = await axios.post(`${API_URL}/api/session/end`, {
        session_id: session.session_id
      })

      console.log('✅ Session ended:', response.data)

      setSummary(response.data.summary)
      setSession(response.data.session)
      setStep('summary')
    } catch (err: any) {
      console.error('❌ Error ending session:', err)
      setError(err.response?.data?.detail || 'Failed to end session')
    } finally {
      setLoading(false)
    }
  }

  // Reset and start new session
  const handleNewSession = () => {
    setSession(null)
    setSummary(null)
    setElapsedSeconds(0)
    setError(null)
    setStep('select')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎸 Live Teaching Session MVP
          </h1>
          <p className="text-gray-600">Powered by Finternet Payment Infrastructure</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card bg-red-50 border-2 border-red-200 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {step === 'connect' && (
          <div className="card text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Connect to check your balance via Finternet API
              </p>
            </div>

            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="btn btn-primary text-lg px-8 py-4"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p>This will call: GET /api/v1/payment-intents/account/balance</p>
            </div>
          </div>
        )}

        {/* Step 2: Select Session */}
        {step === 'select' && (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Wallet Connected</h3>
                    <p className="text-green-700 text-sm">
                      Balance: {balance?.balance || balance?.availableBalance || 'N/A'}{' '}
                      {balance?.currency || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Selection */}
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Select Your Session
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        🎸 {SESSION_TITLE}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Learn guitar basics with Guitar Master Pro
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-semibold w-32">Rate:</span>
                          <span className="text-blue-600 font-bold">
                            ${RATE_PER_MINUTE.toFixed(2)} / minute
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold w-32">Max Lock:</span>
                          <span className="text-gray-700">${MAX_LOCK.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-semibold w-32">Max Duration:</span>
                          <span className="text-gray-700">
                            {(MAX_LOCK / RATE_PER_MINUTE).toFixed(0)} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={loading}
                className="btn btn-primary w-full text-lg py-4"
              >
                {loading ? 'Creating Payment Intent...' : 'Start Session'}
              </button>

              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>This will call: POST /api/v1/payment-intents</p>
                <p className="text-xs mt-1">Funds will be locked in escrow via Finternet</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Active Session */}
        {step === 'active' && session && (
          <div className="space-y-6">
            {/* Session Status */}
            <div className="card bg-blue-50 border-2 border-blue-300">
              <div className="text-center mb-4">
                <span className="badge badge-info text-lg px-4 py-2">
                  🔴 LIVE SESSION
                </span>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {SESSION_TITLE}
              </h2>
              <p className="text-center text-gray-600">
                Teacher: {session.teacher} | Student: {session.student}
              </p>
            </div>

            {/* Timer Display */}
            <div className="card text-center">
              <div className="mb-4">
                <h3 className="text-gray-600 text-lg mb-2">Elapsed Time</h3>
                <div className="text-7xl font-bold text-blue-600 mb-4 font-mono">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="text-3xl font-semibold text-gray-800">
                  ${currentCost.toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Current cost (${RATE_PER_MINUTE}/min)
                </p>
              </div>
            </div>

            {/* Locked Amount */}
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🔒</span>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Funds Locked</h3>
                    <p className="text-yellow-700">
                      ${session.locked_amount.toFixed(2)} in escrow
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-700">Intent ID:</p>
                  <p className="text-xs text-yellow-600 font-mono">
                    {session.intent_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Video Player */}
            <div className="card">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-xl">Mock Video Stream</p>
                  <p className="text-sm text-gray-400 mt-2">
                    (In production, this would be a real video player)
                  </p>
                </div>
              </div>
            </div>

            {/* End Session Button */}
            <button
              onClick={handleEndSession}
              disabled={loading}
              className="btn btn-danger w-full text-lg py-4"
            >
              {loading ? 'Processing Settlement...' : 'End Session'}
            </button>

            <div className="text-sm text-gray-500 text-center">
              <p>This will trigger settlement via Finternet API</p>
              <p className="text-xs mt-1">
                POST /api/v1/payment-intents/:id/escrow/delivery-proof
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 'summary' && summary && session && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="card bg-green-50 border-2 border-green-300 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-800 mb-2">
                Session Completed!
              </h2>
              <p className="text-green-700">
                Teacher paid instantly via Finternet
              </p>
            </div>

            {/* Transaction Summary */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Transaction Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-semibold text-gray-800">
                    {summary.elapsed_minutes.toFixed(2)} minutes
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Amount Locked</span>
                  <span className="font-semibold text-gray-800">
                    ${session.locked_amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Amount Charged</span>
                  <span className="font-semibold text-blue-600 text-lg">
                    ${summary.amount_charged.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Amount Refunded</span>
                  <span className="font-semibold text-green-600 text-lg">
                    ${summary.amount_refunded.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Settlement Method</span>
                  <span className="badge badge-info">{summary.settlement_method}</span>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Session Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-mono text-gray-800">{session.session_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intent ID:</span>
                  <span className="font-mono text-gray-800">{session.intent_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teacher:</span>
                  <span className="text-gray-800">{session.teacher}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="text-gray-800">${RATE_PER_MINUTE}/min</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleNewSession}
                className="btn btn-primary flex-1 py-4"
              >
                Start New Session
              </button>
              <button
                onClick={() => {
                  setStep('connect')
                  setBalance(null)
                  setSession(null)
                  setSummary(null)
                  setError(null)
                }}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex-1 py-4"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>🚀 Hackathon MVP - Finternet Labs Integration</p>
          <p className="mt-1">
            Backend: FastAPI | Frontend: Next.js + TypeScript + Tailwind
          </p>
        </div>
      </div>
    </div>
  )
}
