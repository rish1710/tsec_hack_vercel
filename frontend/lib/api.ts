import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionRecommendation?: SessionRecommendation;
}

export interface SessionRecommendation {
  sessionId: string;
  title: string;
  description: string;
  instructorName: string;
  estimatedMinutes: number;
  costPerMinute: number;
  totalEstimatedCost: number;
  relevanceScore: number;
}

export interface ConversationRequest {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ConversationResponse {
  message: string;
  sessionRecommendation?: SessionRecommendation;
  clarifyingQuestions?: string[];
}

export async function sendMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ConversationResponse> {
  try {
    const response = await api.post<ConversationResponse>('/api/chat', {
      message,
      conversationHistory,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getSessionRecommendations(
  learningGoal: string,
  skillLevel: string
): Promise<SessionRecommendation[]> {
  try {
    const response = await api.post<SessionRecommendation[]>('/api/recommendations', {
      learningGoal,
      skillLevel,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}
