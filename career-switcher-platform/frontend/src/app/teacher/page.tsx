'use client'

import { useState, useEffect } from 'react'

interface KPIs {
  total_views: number
  total_watch_time: number
  total_earned: number
  earning_potential: number
  average_rating: number
}

interface TimelinePoint {
  timestamp: number
  retention_rate: number
  cumulative_revenue: number
  active_viewers: number
}

export default function TeacherDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null)

  useEffect(() => {
    fetchKPIs()
    fetchTimeline()
  }, [])

  const fetchKPIs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/teacher/dashboard/vid001')
      const data = await response.json()
      setKpis(data.kpis)
    } catch (error) {
      console.error('Error fetching KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/teacher/video-revenue/vid001')
      const data = await response.json()
      setTimeline(data.timeline)
    } catch (error) {
      console.error('Error fetching timeline:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Teacher! 🎓</h1>
        <p className="text-indigo-100">Here's how your course is performing</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Views */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {kpis?.total_views || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-3xl">👁️</span>
            </div>
          </div>
        </div>

        {/* Watch Time */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Watch Time</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {kpis ? Math.round(kpis.total_watch_time / 60) : 0}m
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-3xl">⏱️</span>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${kpis ? kpis.total_earned.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* Earning Potential */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Earning Potential</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${kpis ? kpis.earning_potential.toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">If all watched full video</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {kpis ? kpis.average_rating.toFixed(1) : '0.0'} ⭐
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-3xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Timeline Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Video Revenue Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            🟡 First 10s FREE (flat at $0) • 💵 Then $0.50/min • 📊 Peaks = high engagement • 📉 Valleys = drop-offs
          </p>
        </div>

        {timeline.length > 0 && (
          <div className="relative">
            {/* Chart Container */}
            <div className="h-80 relative">
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                <line x1="60" y1="250" x2="760" y2="250" stroke="#e5e7eb" strokeWidth="2" />
                <line x1="60" y1="200" x2="760" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="60" y1="150" x2="760" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="60" y1="100" x2="760" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="60" y1="50" x2="760" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                {/* Y-axis labels (Revenue) */}
                <text x="45" y="255" fontSize="12" fill="#6b7280" textAnchor="end">$0</text>
                <text x="45" y="205" fontSize="12" fill="#6b7280" textAnchor="end">$25</text>
                <text x="45" y="155" fontSize="12" fill="#6b7280" textAnchor="end">$50</text>
                <text x="45" y="105" fontSize="12" fill="#6b7280" textAnchor="end">$75</text>
                <text x="45" y="55" fontSize="12" fill="#6b7280" textAnchor="end">$100</text>

                {/* X-axis labels (Time) */}
                <text x="60" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">0s</text>
                <text x="410" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">90s</text>
                <text x="760" y="270" fontSize="12" fill="#6b7280" textAnchor="middle">180s</text>

                {/* Free preview zone (first 10 seconds) */}
                <rect x="60" y="50" width="38.9" height="200" fill="#fef3c7" opacity="0.3" />
                <text x="79.5" y="30" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="600">FREE</text>

                {/* Revenue line */}
                <polyline
                  points={timeline.map((point, i) => {
                    const x = 60 + (i / (timeline.length - 1)) * 700
                    const y = 250 - (point.cumulative_revenue / 100) * 200
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Retention line */}
                <polyline
                  points={timeline.map((point, i) => {
                    const x = 60 + (i / (timeline.length - 1)) * 700
                    const y = 250 - (point.retention_rate) * 200
                    return `${x},${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />

                {/* Interactive points */}
                {timeline.map((point, i) => {
                  const x = 60 + (i / (timeline.length - 1)) * 700
                  const y = 250 - (point.cumulative_revenue / 100) * 200
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-6 transition-all"
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredPoint && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm">
                  <p className="font-semibold mb-1">At {hoveredPoint.timestamp}s</p>
                  <p className="text-blue-300">Revenue: ${hoveredPoint.cumulative_revenue.toFixed(2)}</p>
                  <p className="text-green-300">Retention: {(hoveredPoint.retention_rate * 100).toFixed(1)}%</p>
                  <p className="text-gray-300">Viewers: {hoveredPoint.active_viewers}</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span className="text-gray-700">Cumulative Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
                <span className="text-gray-700">Retention Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 bg-yellow-100 border border-yellow-300"></div>
                <span className="text-gray-700">Free Preview (10s)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/teacher/insights"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all border border-indigo-200"
          >
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-gray-800">View Insights</p>
              <p className="text-xs text-gray-600">AI-powered analysis</p>
            </div>
          </a>

          <a
            href="/teacher/reviews"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all border border-purple-200"
          >
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-gray-800">Smart Reviews</p>
              <p className="text-xs text-gray-600">Classified feedback</p>
            </div>
          </a>

          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 opacity-75">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-gray-800">Course Analytics</p>
              <p className="text-xs text-gray-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
