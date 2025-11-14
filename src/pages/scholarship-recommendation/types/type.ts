export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ScholarshipRecommendation {
  id: string;
  title: string;
  provider: string;
  deadline: string;
  amount: string;
  requirements: string[];
  description: string;
  eligibility: string;
  link: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  recommendations: ScholarshipRecommendation[];
}
