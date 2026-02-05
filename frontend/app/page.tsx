'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types
interface Balance {
  balance?: string
  availableBalance?: string
  pendingBalance?: string
  reservedBalance?: string
  totalBalance?: string
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

interface CreditCardData {
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

// Flow steps
type FlowStep = 'connect' | 'select' | 'payment' | 'active' | 'summary'

export default function Home() {
  // State management
  const [step, setStep] = useState<FlowStep>('connect')
  const [balance, setBalance] = useState<Balance | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })

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

  // Validate credit card data
  const validateCardData = (): string | null => {
    if (!cardData.cardholderName.trim()) {
      return 'Cardholder name is required'
    }
    if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
      return 'Card number must be 16 digits'
    }
    if (!cardData.expiryMonth || parseInt(cardData.expiryMonth) < 1 || parseInt(cardData.expiryMonth) > 12) {
      return 'Invalid expiry month'
    }
    if (!cardData.expiryYear || cardData.expiryYear.length !== 2) {
      return 'Invalid expiry year'
    }
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      return 'CVV must be 3 or 4 digits'
    }
    return null
  }

  // Handle payment submission
  const handlePaymentSubmit = () => {
    const validationError = validateCardData()
    if (validationError) {
      setError(validationError)
      return
    }
    // Move to session start - card is just for mock purposes
    setError(null)
    setStep('select')
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
      setStep('payment')
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
          <div className="card bg-red-50 border-2 border-red-300 mb-6 animate-shake">
            <div className="flex items-start">
              <span className="text-3xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2 text-lg">Error Occurred</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800 underline font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="card bg-blue-50 border-2 border-blue-300 mb-6">
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <p className="text-blue-800 font-semibold">Processing...</p>
                <p className="text-blue-600 text-sm">
                  {step === 'connect' && 'Connecting to Finternet API...'}
                  {step === 'select' && 'Creating payment intent...'}
                  {step === 'active' && 'Processing settlement...'}
                </p>
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
              className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center mx-auto"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Connecting to Finternet...' : 'Connect Wallet'}
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p>This will call: GET /api/v1/payment-intents/account/balance</p>
            </div>
          </div>
        )}

        {/* Step 2: Mock Credit Card Entry */}
        {step === 'payment' && (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Wallet Connected</h3>
                    <p className="text-green-700 text-sm">Ready to add payment method</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Details Card */}
            <div className="card bg-blue-50 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3">💰 Wallet Balance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${balance?.availableBalance || '0'} {balance?.currency || 'USD'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Total Balance</p>
                  <p className="text-xl font-semibold text-blue-900">
                    ${balance?.totalBalance || balance?.balance || '0'} {balance?.currency || 'USD'}
                  </p>
                </div>
                {balance?.pendingBalance && balance.pendingBalance !== '0' && (
                  <div>
                    <p className="text-sm text-blue-600">Pending Balance</p>
                    <p className="text-lg font-medium text-blue-800">
                      ${balance.pendingBalance} {balance.currency || 'USD'}
                    </p>
                  </div>
                )}
                {balance?.reservedBalance && balance.reservedBalance !== '0' && (
                  <div>
                    <p className="text-sm text-blue-600">Reserved Balance</p>
                    <p className="text-lg font-medium text-blue-800">
                      ${balance.reservedBalance} {balance.currency || 'USD'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Credit Card Form */}
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  💳 Add Payment Method
                </h2>
                <p className="text-sm text-gray-600">
                  Enter mock credit card details (for demo purposes only)
                </p>
              </div>

              <div className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
                      if (value.length <= 16) {
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                        setCardData({ ...cardData, cardNumber: formatted })
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      value={cardData.expiryMonth}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 2 && (value === '' || parseInt(value) <= 12)) {
                          setCardData({ ...cardData, expiryMonth: value })
                        }
                      }}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={cardData.expiryYear}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 2) {
                          setCardData({ ...cardData, expiryYear: value })
                        }
                      }}
                      placeholder="YY"
                      maxLength={2}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 4) {
                          setCardData({ ...cardData, cvv: value })
                        }
                      }}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono"
                    />
                  </div>
                </div>

                {/* Mock Card Preview */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                  <div className="text-xs mb-4 opacity-75">MOCK CREDIT CARD</div>
                  <div className="font-mono text-xl mb-4 tracking-wider">
                    {cardData.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-75 mb-1">CARDHOLDER</div>
                      <div className="text-sm font-semibold">
                        {cardData.cardholderName || 'YOUR NAME'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs opacity-75 mb-1">EXPIRES</div>
                      <div className="text-sm font-semibold">
                        {cardData.expiryMonth || 'MM'}/{cardData.expiryYear || 'YY'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentSubmit}
                className="btn btn-primary w-full text-lg py-4 mt-6"
              >
                Continue to Session Selection
              </button>

              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>⚠️ This is a mock payment form for demo purposes</p>
                <p className="text-xs mt-1">No real payment processing occurs</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Session */}
        {step === 'select' && (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Payment Method Added</h3>
                    <p className="text-green-700 text-sm">
                      Available Balance: ${balance?.availableBalance || '0'} {balance?.currency || 'USD'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-700">Card: ****{cardData.cardNumber.slice(-4)}</p>
                  <p className="text-xs text-green-600">{cardData.cardholderName}</p>
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
                className="btn btn-primary w-full text-lg py-4 flex items-center justify-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                )}
                {loading ? 'Creating Payment Intent...' : 'Start Session 🎬'}
              </button>

              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>This will call: POST /api/v1/payment-intents</p>
                <p className="text-xs mt-1">Funds will be locked in escrow via Finternet</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Active Session */}
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
              <p className="text-center text-gray-600 mb-3">
                Teacher: {session.teacher} | Student: {session.student}
              </p>
              <div className="bg-white rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Session ID</p>
                    <p className="font-mono text-xs text-gray-800">{session.session_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-blue-600">{session.status}</p>
                  </div>
                </div>
              </div>
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
              <div className="mb-3">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🔒</span>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Funds Locked in Escrow</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                      ${session.locked_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Rate per minute:</span>
                  <span className="font-semibold text-yellow-900">${session.rate_per_minute.toFixed(2)}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Max duration:</span>
                  <span className="font-semibold text-yellow-900">
                    {(session.locked_amount / session.rate_per_minute).toFixed(0)} minutes
                  </span>
                </div>
                <div className="pt-2 border-t border-yellow-300">
                  <p className="text-xs text-yellow-700">Finternet Payment Intent:</p>
                  <p className="text-xs text-yellow-600 font-mono break-all">
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
              className="btn btn-danger w-full text-lg py-4 flex items-center justify-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Processing Settlement via Finternet...' : 'End Session 🛑'}
            </button>

            <div className="text-sm text-gray-500 text-center">
              <p>This will trigger settlement via Finternet API</p>
              <p className="text-xs mt-1">
                POST /api/v1/payment-intents/:id/escrow/delivery-proof
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 'summary' && summary && session && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="card bg-green-50 border-2 border-green-300 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-800 mb-2">
                Session Completed!
              </h2>
              <p className="text-green-700 text-lg">
                Payment processed via Finternet Infrastructure
              </p>
              <div className="mt-4 inline-block bg-green-100 rounded-lg px-4 py-2">
                <p className="text-sm text-green-700">
                  Teacher: <span className="font-semibold">{session.teacher}</span>
                </p>
                <p className="text-sm text-green-700">
                  Settlement: <span className="font-semibold">{summary.settlement_method}</span>
                </p>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Transaction Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Session Duration</p>
                    <p className="font-semibold text-gray-800 text-lg">
                      {summary.elapsed_minutes.toFixed(2)} minutes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Rate</p>
                    <p className="font-semibold text-gray-800">
                      ${session.rate_per_minute.toFixed(2)}/min
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg border-2 border-blue-200">
                  <div>
                    <p className="text-sm text-blue-600">Amount Locked in Escrow</p>
                    <p className="font-semibold text-blue-900 text-lg">
                      ${session.locked_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Finternet Escrow
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 bg-red-50 px-4 rounded-lg border-2 border-red-200">
                  <div>
                    <p className="text-sm text-red-600">Amount Charged</p>
                    <p className="font-bold text-red-700 text-2xl">
                      ${summary.amount_charged.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-600">Paid to Teacher</p>
                    <p className="text-sm font-semibold text-red-700">
                      {summary.teacher_paid ? '✅ Settled' : '⏳ Processing'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg border-2 border-green-200">
                  <div>
                    <p className="text-sm text-green-600">Amount Refunded</p>
                    <p className="font-bold text-green-700 text-2xl">
                      ${summary.amount_refunded.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">Returned to Student</p>
                    <p className="text-sm font-semibold text-green-700">
                      ✅ Instant Refund
                    </p>
                  </div>
                </div>

                <div className="py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-indigo-600">Settlement Method</p>
                      <p className="font-semibold text-indigo-900 text-lg">
                        {summary.settlement_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full font-semibold">
                        Powered by Finternet
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="card bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-xl mr-2">📋</span>
                Session & Payment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Session Information</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session ID:</span>
                      <span className="font-mono text-gray-900 font-semibold">{session.session_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="text-gray-900 font-semibold">{session.session_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teacher:</span>
                      <span className="text-gray-900">{session.teacher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student:</span>
                      <span className="text-gray-900">{session.student}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Finternet Payment Intent</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Intent ID:</span>
                      <span className="font-mono text-gray-900 text-xs break-all text-right ml-2">
                        {session.intent_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-semibold">{session.status}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Card</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Card Used:</span>
                    <span className="font-mono text-gray-900">**** **** **** {cardData.cardNumber.slice(-4)}</span>
                  </div>
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
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p className="text-lg">🚀 Hackathon MVP - Finternet Labs Integration</p>
          <p className="font-semibold text-gray-600">
            Backend: FastAPI | Frontend: Next.js + TypeScript + Tailwind
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 inline-block">
            <p className="text-xs text-yellow-800">
              💳 <strong>Mock Payment System:</strong> Credit card entry is for demonstration only.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              🔐 <strong>Real Integration:</strong> Finternet API handles actual escrow & settlement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
