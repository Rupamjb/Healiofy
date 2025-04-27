import axios from 'axios';
import { authHeader, API_URL } from './authService';

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatbotQuery {
  query: string;
  contextType?: 'general' | 'prescription';
  messages?: ChatMessage[];
}

export interface ChatbotResponse {
  response: string;
}

// Get response from the chatbot API
export const getChatbotResponse = async (data: ChatbotQuery): Promise<string> => {
  try {
    const response = await axios.post<ChatbotResponse>(
      `${API_URL}/chatbot`,
      data,
      { headers: authHeader() }
    );
    return response.data.response;
  } catch (error: any) {
    console.error('Error getting chatbot response:', error);
    throw new Error(error.response?.data?.error || 'Failed to get chatbot response');
  }
}; 