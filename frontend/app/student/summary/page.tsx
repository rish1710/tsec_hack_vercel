'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionSummaryPage() {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedSummary = localStorage.getItem('session_summary');
        if (storedSummary) {
            setSummaryData(JSON.parse(storedSummary));
        } else {
            router.push('/student/chat');
        }
    }, [router]);

    const handleSubmitReview = async () => {
        if (!summaryData || rating === 0) return;

        setIsSubmitting(true);
        try {
            // Submit review API call would go here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            localStorage.removeItem('session_summary');
            router.push('/student/chat');
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!summaryData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Session Complete!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Thank you for learning with Murph
                    </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Session Summary
                    </h2>

                    {/* Duration & Cost */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Duration</div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {summaryData.duration_minutes?.toFixed(1)} min
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Total Cost</div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                ${summaryData.total_cost?.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                            Payment Breakdown
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Rate per minute</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${summaryData.cost_per_minute?.toFixed(2)}/min
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Locked amount</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${summaryData.locked_amount?.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Actual charge</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    ${summaryData.total_cost?.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Refunded</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    ${summaryData.refunded_amount?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction ID */}
                    {summaryData.transaction_id && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction ID</div>
                            <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                {summaryData.transaction_id}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Rate Your Session
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Help us improve by rating your learning experience
                    </p>

                    {/* Star Rating */}
                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                            >
                                <svg
                                    className={`w-10 h-10 ${star <= rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>

                    {/* Review Text */}
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this session (optional)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                        rows={4}
                    />

                    {/* Submit Button */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleSubmitReview}
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('session_summary');
                                router.push('/student/chat');
                            }}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Fair Pricing Guarantee
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                You were only charged for {summaryData.duration_minutes?.toFixed(1)} minutes of actual learning time.
                                The remaining ${summaryData.refunded_amount?.toFixed(2)} has been automatically refunded to your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
