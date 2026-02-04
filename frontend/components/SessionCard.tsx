'use client';

interface SessionCardProps {
    session: {
        session_id: string;
        title: string;
        description?: string;
        topic: string;
        skill_level: string;
        cost_per_minute: number;
        estimated_duration?: number;
        status: 'scheduled' | 'active' | 'completed' | 'cancelled';
        teacher?: {
            name: string;
            rating?: number;
            avatar?: string;
        };
        duration_minutes?: number;
        total_cost?: number;
    };
    onAction?: (sessionId: string, action: 'join' | 'view' | 'rate' | 'cancel') => void;
    className?: string;
}

export default function SessionCard({ session, onAction, className = '' }: SessionCardProps) {
    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const skillLevelColors = {
        beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        advanced: 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    };

    const getActionButton = () => {
        switch (session.status) {
            case 'scheduled':
                return (
                    <button
                        onClick={() => onAction?.(session.session_id, 'join')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Join Session
                    </button>
                );
            case 'active':
                return (
                    <button
                        onClick={() => onAction?.(session.session_id, 'view')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors animate-pulse"
                    >
                        View Live
                    </button>
                );
            case 'completed':
                return (
                    <button
                        onClick={() => onAction?.(session.session_id, 'rate')}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Rate Session
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${className}`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {session.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
                                {session.status}
                            </span>
                        </div>

                        {session.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {session.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                        📚 {session.topic}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${skillLevelColors[session.skill_level as keyof typeof skillLevelColors] || 'bg-gray-100 text-gray-700'}`}>
                        {session.skill_level}
                    </span>
                </div>

                {/* Teacher Info */}
                {session.teacher && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {session.teacher.avatar || session.teacher.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {session.teacher.name}
                            </div>
                            {session.teacher.rating && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <span>⭐</span>
                                    <span>{session.teacher.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Cost & Duration */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${session.cost_per_minute.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/min</span>
                        </div>
                        {session.estimated_duration && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                ~{session.estimated_duration} min session
                            </div>
                        )}
                    </div>

                    {session.status === 'completed' && session.total_cost !== undefined && (
                        <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                ${session.total_cost.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {session.duration_minutes?.toFixed(1)} min
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                    {getActionButton()}
                    {session.status === 'scheduled' && (
                        <button
                            onClick={() => onAction?.(session.session_id, 'cancel')}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
