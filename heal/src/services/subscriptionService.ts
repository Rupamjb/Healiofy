import axios from 'axios';
import { API_URL, authHeader } from './authService';

// Subscription status types
export interface SubscriptionStatus {
  status: 'trial' | 'active' | 'inactive';
  trialAnalysesRemaining: number;
  trialConsultationsRemaining: number;
  subscriptionEndDate: string | null;
  requiresPayment: boolean;
}

// Response interfaces
export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionStatus;
}

export interface PaymentTransactionResponse {
  success: boolean;
  data: {
    transactionXDR: string;
    amount: number;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  data: {
    message: string;
    startDate: string;
    endDate: string;
    transactionId: string;
  };
}

export interface TestAccountResponse {
  success: boolean;
  data: {
    publicKey: string;
    secretKey: string;
    message: string;
  };
}

export interface TestPaymentResponse {
  success: boolean;
  data: {
    message: string;
    startDate: string;
    endDate: string;
    transactionId: string;
  };
}

// Get user's subscription status
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus | null> => {
  try {
    const response = await axios.get<SubscriptionResponse>(
      `${API_URL}/subscription/status`,
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
};

// Create a payment transaction
export const createPaymentTransaction = async (userPublicKey: string): Promise<PaymentTransactionResponse['data'] | null> => {
  try {
    const response = await axios.post<PaymentTransactionResponse>(
      `${API_URL}/subscription/payment/create`,
      { userPublicKey },
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating payment transaction:', error);
    throw new Error(error.response?.data?.error || 'Failed to create payment transaction');
  }
};

// Verify a payment transaction
export const verifyPayment = async (signedTransactionXDR: string): Promise<PaymentVerificationResponse['data'] | null> => {
  try {
    const response = await axios.post<PaymentVerificationResponse>(
      `${API_URL}/subscription/payment/verify`,
      { signedTransactionXDR },
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    throw new Error(error.response?.data?.error || 'Failed to verify payment');
  }
};

// Create a test account for hackathon demo
export const createTestAccount = async (): Promise<TestAccountResponse['data'] | null> => {
  try {
    const response = await axios.post<TestAccountResponse>(
      `${API_URL}/subscription/testaccount`,
      {},
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating test account:', error);
    throw new Error(error.response?.data?.error || 'Failed to create test account');
  }
};

// Process payment directly with a test account
export const processTestPayment = async (publicKey: string, secretKey: string): Promise<TestPaymentResponse['data'] | null> => {
  try {
    const response = await axios.post<TestPaymentResponse>(
      `${API_URL}/subscription/payment/test`,
      { publicKey, secretKey },
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error processing test payment:', error);
    throw new Error(error.response?.data?.error || 'Failed to process test payment');
  }
}; 