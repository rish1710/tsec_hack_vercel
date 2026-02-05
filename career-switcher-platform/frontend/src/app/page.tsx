'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState<'learner' | 'teacher' | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo & Brand */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-8 py-4">
                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200">
                  Morph
                </h1>
              </div>
            </div>
          </div>

          <p className="text-2xl md:text-3xl text-purple-100 font-light mb-4 tracking-wide">
            For professionals ready for their next chapter
          </p>

          <div className="flex items-center justify-center space-x-2 text-pink-200">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <p className="text-sm md:text-base">Transform your career • Learn on demand • Teach your expertise</p>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
          </div>
        </div>

        {/* Call to Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mb-12">
          {/* Learner Card */}
          <Link href="/learner">
            <div
              onMouseEnter={() => setHoveredCard('learner')}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 md:p-12 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-purple-300/50 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}></div>

              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
                Join as Learner
              </h2>
              <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                Discover personalized courses tailored to your career goals. Learn at your own pace with AI-powered guidance.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI conversational learning
                </li>
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Pay only for what you watch
                </li>
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant AI feedback
                </li>
              </ul>

              {/* CTA Button */}
              <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-lg">Start Learning</span>
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link href="/teacher">
            <div
              onMouseEnter={() => setHoveredCard('teacher')}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 md:p-12 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-orange-300/50 hover:shadow-2xl hover:shadow-orange-500/50"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}></div>

              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-orange-200 transition-colors">
                Join as Teacher
              </h2>
              <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                Share your expertise and earn. Create on-demand courses with AI-powered analytics and instant payments.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Real-time analytics dashboard
                </li>
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI-powered insights
                </li>
                <li className="flex items-center text-purple-200">
                  <svg className="w-5 h-5 mr-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant payment processing
                </li>
              </ul>

              {/* CTA Button */}
              <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-lg">Start Teaching</span>
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer tagline */}
        <div className="text-center text-purple-200/80 text-sm">
          <p>Powered by AI • Built for Career Transformation</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </main>
  )
}
