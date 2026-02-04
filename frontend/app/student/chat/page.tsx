'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionRecommendation?: any;
}

interface ConversationResponse {
  message: string;
  sessionRecommendation?: any;
}

async function sendMessage(message: string, history: any[]): Promise<ConversationResponse> {
  // Mock response for now - replace with actual API call
  return {
    message: "I understand you want to learn that! Let me help you find the perfect teacher. What's your current skill level?",
  };
}


export default function StudentChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi! I'm Murph, your AI learning guide. Tell me: what would you like to learn today? For example: 'I want to learn Python for college projects' or 'I need help with JavaScript basics'.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to backend
      const response: ConversationResponse = await sendMessage(
        inputValue,
        conversationHistory
      );

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        sessionRecommendation: response.sessionRecommendation,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "Sorry, I encountered an error. Please try again or check if the backend is running.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">Murph</h1>
          <p className="text-sm text-slate-400">Your AI Learning Guide</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-slate-700 px-4 py-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-950 border-t border-slate-700 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything... (e.g., 'I want to learn Python for college')"
              disabled={isLoading}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
