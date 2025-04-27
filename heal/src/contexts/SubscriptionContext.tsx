import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getSubscriptionStatus, SubscriptionStatus } from '@/services/subscriptionService';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface SubscriptionContextValue {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  checkAccess: (service: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscriptionStatus: null,
  loading: false,
  error: null,
  refreshSubscriptionStatus: async () => {},
  checkAccess: () => true,
});

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchSubscriptionStatus = async () => {
    if (!isAuthenticated) {
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getSubscriptionStatus();
      setSubscriptionStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription status');
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [isAuthenticated]);

  const refreshSubscriptionStatus = async () => {
    await fetchSubscriptionStatus();
  };

  /**
   * Check if user has access to a service based on subscription status
   * @param service The service type to check ("prescription", "consultation", "chatbot", or "premium")
   * @returns boolean indicating if the user has access
   */
  const checkAccess = (service: string): boolean => {
    if (!subscriptionStatus) return false;

    // Active subscription has access to everything
    if (subscriptionStatus.status === 'active' && 
        subscriptionStatus.subscriptionEndDate && 
        new Date(subscriptionStatus.subscriptionEndDate) > new Date()) {
      return true;
    }

    // Trial users have limited access
    if (subscriptionStatus.status === 'trial') {
      if (service === 'prescription' && subscriptionStatus.trialAnalysesRemaining > 0) {
        return true;
      }
      if (service === 'consultation' && subscriptionStatus.trialConsultationsRemaining > 0) {
        return true;
      }
      if (service === 'chatbot') {
        return true; // Unlimited chatbot during trial
      }
      // Premium features are only available to paid subscribers
      if (service === 'premium') {
        return false;
      }
    }

    return false;
  };

  const value = {
    subscriptionStatus,
    loading,
    error,
    refreshSubscriptionStatus,
    checkAccess,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 