'use client';

import { useEffect, useState } from 'react';

interface CostMeterProps {
    costPerMinute: number;
    startTime?: Date;
    isRunning?: boolean;
    lockedAmount?: number;
    className?: string;
}

export default function CostMeter({
    costPerMinute,
    startTime = new Date(),
    isRunning = true,
    lockedAmount,
    className = ''
}: CostMeterProps) {
    const [currentCost, setCurrentCost] = useState(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(startTime).getTime();
            const diffMs = now - start;
            const diffMin = diffMs / 1000 / 60;

            setElapsedMinutes(diffMin);
            setCurrentCost(diffMin * costPerMinute);
        }, 100); // Update every 100ms for smooth animation

        return () => clearInterval(interval);
    }, [startTime, costPerMinute, isRunning]);

    const percentageUsed = lockedAmount ? (currentCost / lockedAmount) * 100 : 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Current Cost Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Current Cost
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                        ${costPerMinute.toFixed(2)}/min
                    </span>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        ${currentCost.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({elapsedMinutes.toFixed(1)} min)
                    </span>
                </div>

                {/* Progress Bar */}
                {lockedAmount && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Used</span>
                            <span>Locked: ${lockedAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {percentageUsed.toFixed(1)}% of locked funds used
                        </div>
                    </div>
                )}
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Rate
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ${costPerMinute.toFixed(2)}/min
                    </div>
                </div>

                {lockedAmount && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Remaining
                        </div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ${Math.max(0, lockedAmount - currentCost).toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
