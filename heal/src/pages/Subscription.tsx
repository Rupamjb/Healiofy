import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, CreditCard } from 'lucide-react';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { StellarPayment } from '@/components/subscription/StellarPayment';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const Subscription = () => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const { subscriptionStatus, loading, error, refreshSubscriptionStatus } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract redirect path from query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';
  const serviceName = queryParams.get('service') || 'this service';

  useEffect(() => {
    // Automatically show payment if redirected from a service with exhausted trial
    if (redirectPath !== '/' && subscriptionStatus?.requiresPayment) {
      setShowPaymentFlow(true);
    }
  }, [redirectPath, subscriptionStatus]);

  const handleSubscribe = () => {
    setShowPaymentFlow(true);
  };

  const handlePaymentSuccess = async () => {
    await refreshSubscriptionStatus();
    setShowPaymentFlow(false);
    
    // If there's a redirect path, navigate there after successful payment
    if (redirectPath !== '/') {
      navigate(redirectPath);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <Helmet>
          <title>Subscription | Healiofy</title>
        </Helmet>
        <div className="container py-8 px-4 sm:px-6">
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to access subscription features.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <Helmet>
          <title>Subscription | Healiofy</title>
        </Helmet>
        <div className="container flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-medical-primary animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Subscription | Healiofy</title>
      </Helmet>
      
      <div className="container py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2 text-medical-primary hidden sm:block" />
            <h1 className="text-2xl sm:text-3xl font-bold">Subscription</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="self-start">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        
        {redirectPath !== '/' && !showPaymentFlow && subscriptionStatus?.requiresPayment && (
          <Alert className="mb-6 border-amber-300 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Trial Expired</AlertTitle>
            <AlertDescription className="text-amber-700">
              Your free trial has been exhausted for {serviceName}. Subscribe to continue using all features.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {!showPaymentFlow ? (
            <>
              <div className="space-y-6 order-2 md:order-1">
                <SubscriptionStatus onSubscribe={handleSubscribe} />
              </div>

              <Card className="order-1 md:order-2">
                <CardHeader>
                  <CardTitle>Premium Features</CardTitle>
                  <CardDescription>
                    Subscribe to unlock unlimited access to all features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Prescription Analyses</span>
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="bg-green-100 text-green-800 mb-1">Unlimited with Premium</Badge>
                      {subscriptionStatus?.status === 'trial' && (
                        <span className="text-xs text-amber-600">{subscriptionStatus.trialAnalysesRemaining} left in trial</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consultant Bookings</span>
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="bg-green-100 text-green-800 mb-1">Unlimited with Premium</Badge>
                      {subscriptionStatus?.status === 'trial' && (
                        <span className="text-xs text-amber-600">{subscriptionStatus.trialConsultationsRemaining} left in trial</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI Health Assistant</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Unlimited</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Priority Support</span>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800">Premium Only</Badge>
                      {subscriptionStatus?.status === 'trial' && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 ml-2">Not Available</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  {subscriptionStatus?.status === 'trial' && (
                    <Alert className="p-2 border-amber-300 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 text-xs">
                        Subscribe now to unlock premium features before your trial ends.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={handleSubscribe}
                    disabled={subscriptionStatus?.status === 'active'}
                  >
                    {subscriptionStatus?.status === 'active' 
                      ? 'Already Subscribed' 
                      : 'Subscribe Now (100 XLM)'}
                  </Button>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Subscribe to Healiofy</CardTitle>
                  <CardDescription>Complete your subscription payment to continue</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePaymentCancel}
                  className="mt-4 sm:mt-0"
                >
                  Cancel
                </Button>
              </CardHeader>
              <CardContent>
                <StellarPayment onSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Subscription; 