import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

interface SubscriptionStatusProps {
  onSubscribe: () => void;
}

export const SubscriptionStatus = ({ onSubscribe }: SubscriptionStatusProps) => {
  const { subscriptionStatus, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 text-medical-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!subscriptionStatus) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Available</AlertTitle>
        <AlertDescription>Subscription information is unavailable.</AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = () => {
    switch (subscriptionStatus.status) {
      case 'trial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Free Trial</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
      default:
        return null;
    }
  };

  // Format the subscription end date if it exists
  const formattedEndDate = subscriptionStatus.subscriptionEndDate 
    ? format(new Date(subscriptionStatus.subscriptionEndDate), 'MMMM dd, yyyy')
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subscription Status</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {subscriptionStatus.status === 'trial' 
            ? "You're currently on the free trial plan"
            : subscriptionStatus.status === 'active'
              ? "You have an active subscription"
              : "Your subscription is inactive"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionStatus.status === 'trial' && (
          <>
            <div className="flex justify-between items-center">
              <span>Prescription Analyses:</span>
              <span className="font-semibold">{subscriptionStatus.trialAnalysesRemaining} remaining</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Consultations:</span>
              <span className="font-semibold">{subscriptionStatus.trialConsultationsRemaining} remaining</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chatbot Access:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Unlimited during trial
              </span>
            </div>
          </>
        )}

        {subscriptionStatus.status === 'active' && (
          <>
            <div className="flex justify-between items-center">
              <span>Prescription Analyses:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Unlimited
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Consultations:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Unlimited
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chatbot Access:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Unlimited
              </span>
            </div>
            {formattedEndDate && (
              <div className="flex justify-between items-center">
                <span>Expires On:</span>
                <span className="font-semibold">{formattedEndDate}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {subscriptionStatus.requiresPayment && (
          <Button 
            className="w-full" 
            onClick={onSubscribe}
          >
            Buy Subscription (100 XLM)
          </Button>
        )}
        {!subscriptionStatus.requiresPayment && subscriptionStatus.status === 'active' && (
          <div className="text-sm text-muted-foreground w-full text-center">
            Your subscription is active until {formattedEndDate}
          </div>
        )}
        {!subscriptionStatus.requiresPayment && subscriptionStatus.status === 'trial' && (
          <>
            <Button 
              className="w-full mb-2" 
              onClick={onSubscribe}
              variant="outline"
            >
              Upgrade to Premium (100 XLM)
            </Button>
            <div className="text-xs text-muted-foreground w-full text-center">
              Upgrade anytime to get unlimited access to all features
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}; 