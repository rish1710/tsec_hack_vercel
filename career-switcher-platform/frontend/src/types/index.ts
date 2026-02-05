export interface Message {
  role: 'user' | 'assistant';
  content: string;
  videoSuggestions?: VideoSuggestion[];
}

export interface VideoSuggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  duration: string;
  category: string;
  thumbnail?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  keywords: string[];
  url?: string;
  thumbnail?: string;
}
