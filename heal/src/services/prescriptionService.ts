import axios from 'axios';
import { authHeader, getCurrentAuth } from './authService';
import { API_URL } from './doctorService';

export interface PrescriptionAnalysis {
  precautions: {
    dietary_restrictions: string[];
    activity_limitations: string[];
    side_effects: string[];
  };
  duration: {
    total_days: number | null;
    frequency: string;
    timing: string;
  };
  warnings: {
    drug_interactions: string[];
    contraindications: string[];
    overdose_symptoms: string[];
  };
}

export interface Prescription {
  _id: string;
  userId: string;
  ocrText: string;
  analysis: PrescriptionAnalysis;
  createdAt: string;
}

export interface PrescriptionResponse {
  success: boolean;
  data: PrescriptionAnalysis;
  error?: string;
}

export interface TextPreprocessingResult {
  structuredText: string;
  medicationCount: number;
  isAiProcessed: boolean;
}

export interface TextPreprocessingResponse {
  success: boolean;
  data: TextPreprocessingResult;
  error?: string;
}

// Check if user is authenticated
const checkAuth = () => {
  const auth = getCurrentAuth();
  if (!auth.isAuthenticated) {
    throw new Error('Please log in to analyze prescriptions');
  }
  return auth;
};

/**
 * Preprocess OCR text using AI to extract and format medication info
 */
export const preprocessOcrText = async (ocrText: string): Promise<TextPreprocessingResult> => {
  try {
    // Check authentication first
    checkAuth();
    
    const response = await axios.post<TextPreprocessingResponse>(
      `${API_URL}/prescriptions/preprocess`,
      { ocrText },
      { headers: authHeader() }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to preprocess text');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error preprocessing OCR text:', error);
    if (error.response?.status === 401) {
      throw new Error('Please log in to analyze prescriptions');
    }
    // Return original text if processing fails
    return {
      structuredText: ocrText,
      medicationCount: 0,
      isAiProcessed: false
    };
  }
};

// Analyze a prescription using OCR text
export const analyzePrescription = async (ocrText: string): Promise<PrescriptionAnalysis> => {
  try {
    // Check authentication first
    checkAuth();
    
    const response = await axios.post<PrescriptionResponse>(
      `${API_URL}/prescriptions/analyze`,
      { ocrText },
      { headers: authHeader() }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to analyze prescription');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error analyzing prescription:', error);
    if (error.response?.status === 401) {
      throw new Error('Please log in to analyze prescriptions');
    }
    throw new Error(error.response?.data?.error || error.message || 'Failed to analyze prescription');
  }
};

// Extract text from prescription image using Llama Scout
export const extractTextFromImage = async (formData: FormData): Promise<string> => {
  try {
    // Check authentication first
    checkAuth();
    
    console.log('Sending image to server for text extraction...');
    
    // Add debug information to the request
    const response = await axios.post<{ success: boolean; data: { text: string }; error?: string }>(
      `${API_URL}/prescriptions/extract-text`,
      formData,
      { 
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data'
        },
        // Add timeout to prevent indefinite waiting
        timeout: 60000 // 60 seconds timeout
      }
    );
    
    console.log('Response received from server:', response.status);
    
    if (!response.data.success) {
      const errorMsg = response.data.error || 'Failed to extract text from image';
      console.error('Server error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    const extractedText = response.data.data.text;
    console.log('Text extracted successfully, length:', extractedText.length);
    return extractedText;
  } catch (error: any) {
    console.error('Error extracting text from image:', error);
    
    // Check for specific error types
    if (error.response?.status === 401) {
      throw new Error('Please log in to analyze prescriptions');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid image format or size');
    } else if (error.response?.status === 500) {
      throw new Error(error.response.data?.error || 'Server error processing image');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The server took too long to respond.');
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to extract text from image');
  }
};
