'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Timer from '@/components/Timer';
import CostMeter from '@/components/CostMeter';

export default function LiveSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [sessionData, setSessionData] = useState<any>(null);
    const [isEnding, setIsEnding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get session data from URL params or localStorage
        const sessionId = searchParams.get('session_id');
        const storedSession = localStorage.getItem('active_session');

        if (storedSession) {
            setSessionData(JSON.parse(storedSession));
        } else if (!sessionId) {
            router.push('/student/chat');
        }
    }, [searchParams, router]);

    const handleEndSession = async () => {
        if (!sessionData) return;

        setIsEnding(true);
        setError('');

        try {
            const response = await fetch(`/api/session/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionData.session_id })
            });

            if (!response.ok) {
                throw new Error('Failed to end session');
            }

            const result = await response.json();

            // Store summary data
            localStorage.setItem('session_summary', JSON.stringify(result));
            localStorage.removeItem('active_session');

            // Navigate to summary
            router.push('/student/summary');
        } catch (err: any) {
            setError(err.message || 'Failed to end session');
            setIsEnding(false);
        }
    };

    if (!sessionData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                Live Session
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {sessionData.title || 'Learning Session'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content - Video/Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Placeholder */}
                        <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-white text-lg font-medium">Video Call Interface</p>
                                <p className="text-white/60 text-sm mt-1">Integration placeholder</p>
                            </div>
                        </div>

                        {/* Session Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Session Details
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Topic</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {sessionData.topic || 'General Learning'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Teacher</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {sessionData.teacher_name || 'Instructor'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Timer & Cost */}
                    <div className="space-y-6">
                        {/* Timer Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                Session Duration
                            </h3>
                            <Timer
                                startTime={new Date(sessionData.started_at)}
                                isRunning={true}
                            />
                        </div>

                        {/* Cost Meter Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                Cost Tracking
                            </h3>
                            <CostMeter
                                costPerMinute={sessionData.cost_per_minute}
                                startTime={new Date(sessionData.started_at)}
                                isRunning={true}
                                lockedAmount={sessionData.locked_amount}
                            />
                        </div>

                        {/* End Session Button */}
                        <button
                            onClick={handleEndSession}
                            disabled={isEnding}
                            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                        >
                            {isEnding ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Ending Session...
                                </span>
                            ) : (
                                'End Session'
                            )}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-medium mb-1">Pay-per-minute billing</p>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        You'll only be charged for the actual time used. Unused funds will be refunded automatically.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
