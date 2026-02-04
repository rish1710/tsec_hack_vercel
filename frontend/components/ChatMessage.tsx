'use client';

import React from 'react';

interface SessionRecommendation {
  title: string;
  description: string;
  estimatedMinutes: number;
  totalEstimatedCost: number;
  instructorName: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string (safe for Next.js)
  sessionRecommendation?: SessionRecommendation;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-100'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {message.sessionRecommendation && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <p className="font-semibold text-sm mb-2">
              {message.sessionRecommendation.title}
            </p>

            <p className="text-xs opacity-90 mb-2">
              {message.sessionRecommendation.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="opacity-75">Duration</span>
                <p className="font-semibold">
                  {message.sessionRecommendation.estimatedMinutes} min
                </p>
              </div>

              <div>
                <span className="opacity-75">Cost</span>
                <p className="font-semibold">
                  ₹{message.sessionRecommendation.totalEstimatedCost.toFixed(2)}
                </p>
              </div>

              <div className="col-span-2">
                <span className="opacity-75">Instructor</span>
                <p className="font-semibold">
                  {message.sessionRecommendation.instructorName}
                </p>
              </div>
            </div>

            <button className="mt-2 w-full bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs font-medium transition-colors">
              Start Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

