import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface SubscriptionGuardProps {
  serviceType: 'prescription' | 'consultation' | 'chatbot' | 'premium';
  serviceName: string;
  children: ReactNode;
}

export const SubscriptionGuard = ({ serviceType, serviceName, children }: SubscriptionGuardProps) => {
  const { subscriptionStatus, checkAccess, loading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check access when component mounts or subscription status changes
  useEffect(() => {
    if (!loading && subscriptionStatus) {
      const hasAccess = checkAccess(serviceType);
      
      // If no access, redirect to subscription page
      if (!hasAccess) {
        // Encode current path for redirect back after subscription
        const redirectPath = encodeURIComponent(location.pathname);
        navigate(`/subscription?redirect=${redirectPath}&service=${serviceName}`);
      }
    }
  }, [loading, subscriptionStatus, serviceType, navigate, location.pathname, serviceName, checkAccess]);

  // If still loading, render nothing
  if (loading) {
    return null;
  }

  // If trial is nearly exhausted, show warning
  const showWarning = (
    serviceType === 'prescription' && 
    subscriptionStatus?.status === 'trial' && 
    subscriptionStatus.trialAnalysesRemaining === 1
  ) || (
    serviceType === 'consultation' && 
    subscriptionStatus?.status === 'trial' && 
    subscriptionStatus.trialConsultationsRemaining === 1
  );

  // If using trial and the premium features would be better, show premium upsell
  const showPremiumUpsell = 
    subscriptionStatus?.status === 'trial' && 
    (
      (serviceType === 'prescription' && subscriptionStatus.trialAnalysesRemaining <= 3) ||
      (serviceType === 'consultation' && subscriptionStatus.trialConsultationsRemaining <= 3)
    );

  return (
    <>
      {showWarning && (
        <Alert className="mb-6 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Trial Ending Soon</AlertTitle>
          <AlertDescription className="text-amber-700 flex justify-between items-center">
            <span>This is your last free {serviceType} in your trial. Subscribe to continue using all features.</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-4 border-amber-400 bg-amber-100 text-amber-800 hover:bg-amber-200"
              onClick={() => navigate('/subscription')}
            >
              View Plans
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {showPremiumUpsell && !showWarning && (
        <Alert className="mb-6 border-blue-300 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Upgrade to Premium</AlertTitle>
          <AlertDescription className="text-blue-700 flex justify-between items-center">
            <span>You have {serviceType === 'prescription' ? subscriptionStatus.trialAnalysesRemaining : subscriptionStatus.trialConsultationsRemaining} free uses left. Upgrade to premium for unlimited access.</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-4 border-blue-400 bg-blue-100 text-blue-800 hover:bg-blue-200"
              onClick={() => navigate('/subscription')}
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </>
  );
}; 