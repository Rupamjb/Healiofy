import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumFeatureAlertProps {
  featureName: string;
}

export const PremiumFeatureAlert = ({ featureName }: PremiumFeatureAlertProps) => {
  const navigate = useNavigate();

  return (
    <Alert className="my-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <div className="flex-1">
        <AlertTitle className="text-amber-700">Premium Feature</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p className="mb-2">{featureName} is available exclusively with a premium subscription.</p>
          <Button 
            size="sm" 
            onClick={() => navigate('/subscription')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </div>
    </Alert>
  );
}; 