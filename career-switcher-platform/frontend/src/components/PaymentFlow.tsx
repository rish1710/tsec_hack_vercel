'use client'

import { useState } from 'react'

interface PaymentFlowProps {
  videoId: string
  videoTitle: string
  price: string
  onPaymentComplete: (sessionData: any) => void
}

type Step = 'wallet' | 'card' | 'confirm' | 'loading'

export default function PaymentFlow({ videoId, videoTitle, price, onPaymentComplete }: PaymentFlowProps) {
  const [step, setStep] = useState<Step>('wallet')
  const [balance, setBalance] = useState<any>(null)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnectWallet = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/wallet/balance')
      if (!response.ok) throw new Error('Failed to connect wallet')

      const data = await response.json()
      setBalance(data)
      setStep('card')
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const validateCard = () => {
    if (!cardData.cardholderName.trim()) return 'Cardholder name required'
    if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) return 'Card number must be 16 digits'
    if (!cardData.expiryMonth || parseInt(cardData.expiryMonth) < 1 || parseInt(cardData.expiryMonth) > 12) return 'Invalid month'
    if (!cardData.expiryYear || cardData.expiryYear.length !== 2) return 'Invalid year'
    if (!/^\d{3,4}$/.test(cardData.cvv)) return 'CVV must be 3-4 digits'
    return null
  }

  const handleCardSubmit = () => {
    const validationError = validateCard()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep('confirm')
  }

  const handleStartCourse = async () => {
    setLoading(true)
    setStep('loading')

    try {
      const response = await fetch('http://localhost:8000/api/video-session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          locked_amount: price
        })
      })

      if (!response.ok) throw new Error('Failed to start session')

      const data = await response.json()
      onPaymentComplete(data)
    } catch (err: any) {
      setError(err.message || 'Failed to start course')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Wallet Connect Step */}
        {step === 'wallet' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to pay for the course</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}

        {/* Card Input Step */}
        {step === 'card' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Details</h2>
            <p className="text-sm text-gray-600 mb-4">
              Wallet Balance: ${balance?.balance || balance?.totalBalance || '0'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
                  maxLength={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input
                    type="text"
                    value={cardData.expiryMonth}
                    onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="MM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={cardData.expiryYear}
                    onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                  />
                </div>
              </div>

              <button
                onClick={handleCardSubmit}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mt-4"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{videoTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lock Amount:</span>
                <span className="font-medium">${price}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">
                  Funds will be locked. You'll only be charged for the time you actually watch.
                  Remaining balance will be refunded automatically.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleStartCourse}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Processing...' : 'Lock Funds & Start Course'}
            </button>
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Starting your course...</p>
          </div>
        )}
      </div>
    </div>
  )
}
