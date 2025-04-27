import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPaymentTransaction, verifyPayment, createTestAccount, processTestPayment } from "@/services/subscriptionService";
import { Loader2, AlertCircle, ExternalLink, Check, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

declare global {
  interface Window {
    freighterApi?: {
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, network: string) => Promise<string>;
      isConnected: () => Promise<boolean>;
    };
  }
}

interface StellarPaymentProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StellarPayment = ({ onSuccess, onCancel }: StellarPaymentProps) => {
  const [stellarPublicKey, setStellarPublicKey] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testAccount, setTestAccount] = useState<{ publicKey: string; secretKey: string; } | null>(null);
  const [isCreatingTestAccount, setIsCreatingTestAccount] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "test">("wallet");
  const { toast } = useToast();
  const { refreshSubscriptionStatus } = useSubscription();
  
  // Check if Freighter is installed
  const isFreighterInstalled = !!window.freighterApi;

  // Check if wallet is connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (isFreighterInstalled) {
        try {
          setIsLoadingWallet(true);
          const isConnected = await window.freighterApi?.isConnected();
          setIsWalletConnected(!!isConnected);
          
          if (isConnected) {
            // Get the user's public key
            const publicKey = await window.freighterApi?.getPublicKey();
            if (publicKey) {
              setStellarPublicKey(publicKey);
            }
          }
        } catch (err: any) {
          console.error("Error checking wallet connection:", err);
          setError("Failed to connect to wallet");
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };

    checkWalletConnection();
  }, [isFreighterInstalled]);

  // Connect to Freighter wallet
  const connectWallet = async () => {
    if (!isFreighterInstalled) {
      setError("Freighter wallet extension is not installed");
      return;
    }

    try {
      setIsLoadingWallet(true);
      setError(null);
      const publicKey = await window.freighterApi?.getPublicKey();
      if (publicKey) {
        setStellarPublicKey(publicKey);
        setIsWalletConnected(true);
      } else {
        setError("Failed to get public key from wallet");
      }
    } catch (err: any) {
      console.error("Error connecting to wallet:", err);
      setError(`Failed to connect to wallet: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Process the payment with Freighter wallet
  const processFreighterPayment = async () => {
    if (!isWalletConnected || !stellarPublicKey) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError(null);
      
      // Create a payment transaction
      const transactionData = await createPaymentTransaction(stellarPublicKey);
      
      if (!transactionData) {
        throw new Error("Failed to create payment transaction");
      }
      
      // Sign the transaction with Freighter wallet
      const signedXDR = await window.freighterApi?.signTransaction(
        transactionData.transactionXDR,
        "TESTNET" // Use Testnet
      );
      
      if (!signedXDR) {
        throw new Error("Transaction was not signed");
      }
      
      // Submit and verify the signed transaction
      const result = await verifyPayment(signedXDR);
      
      if (result) {
        // Success! Update subscription status and notify user
        await refreshSubscriptionStatus();
        toast({
          title: "Payment Successful",
          description: "Your subscription is now active!",
        });
        onSuccess();
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(`Payment failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Process payment with test account
  const processTestAccountPayment = async () => {
    if (!testAccount || !testAccount.publicKey) {
      setError("Please create a test account first");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError(null);
      
      // Process test payment directly - no wallet signing needed
      const result = await processTestPayment(testAccount.publicKey, testAccount.secretKey);
      
      if (result) {
        // Success! Update subscription status and notify user
        await refreshSubscriptionStatus();
        toast({
          title: "Test Payment Successful",
          description: "Your subscription is now active!",
        });
        onSuccess();
      }
    } catch (err: any) {
      console.error("Test payment error:", err);
      setError(`Test payment failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Create a test account for demo purposes
  const handleCreateTestAccount = async () => {
    try {
      setIsCreatingTestAccount(true);
      setError(null);
      
      const accountData = await createTestAccount();
      
      if (accountData) {
        setTestAccount({
          publicKey: accountData.publicKey,
          secretKey: accountData.secretKey
        });
        
        // Automatically set the public key for use
        setStellarPublicKey(accountData.publicKey);
        setPaymentMethod("test");
        
        toast({
          title: "Test Account Created",
          description: "A new Stellar Testnet account was created and funded with XLM.",
        });
      }
    } catch (err: any) {
      console.error("Error creating test account:", err);
      setError(`Failed to create test account: ${err.message || "Unknown error"}`);
    } finally {
      setIsCreatingTestAccount(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="text-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Subscription Payment</h3>
        <p className="text-sm md:text-base text-muted-foreground">
          Pay 100 XLM to subscribe for 1 month
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-3 md:mb-4 text-sm md:text-base">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "wallet" | "test")}>
        <TabsList className="grid w-full grid-cols-2 text-xs md:text-sm">
          <TabsTrigger value="wallet">Wallet Payment</TabsTrigger>
          <TabsTrigger value="test">Test Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
          {!isFreighterInstalled && (
            <Alert className="mb-3 md:mb-4 text-xs md:text-sm">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              <AlertDescription>
                Freighter wallet extension is not installed. Please{" "}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  install Freighter
                </a>{" "}
                to continue with wallet payment or use a test account instead.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="stellarAddress" className="text-sm md:text-base">Stellar Public Key</Label>
            <Input
              id="stellarAddress"
              value={stellarPublicKey}
              onChange={(e) => setStellarPublicKey(e.target.value)}
              placeholder="Enter your Stellar address or connect wallet"
              disabled={isWalletConnected || isLoadingWallet}
              className="text-xs md:text-sm"
            />
          </div>

          <div className="flex flex-col space-y-3 md:space-y-4">
            {!isWalletConnected ? (
              <Button
                variant="outline"
                onClick={connectWallet}
                disabled={!isFreighterInstalled || isLoadingWallet}
                className="text-xs md:text-sm h-8 md:h-10"
              >
                {isLoadingWallet ? (
                  <>
                    <Loader2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Freighter Wallet"
                )}
              </Button>
            ) : (
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="text-green-700 text-xs md:text-sm">Wallet Connected</span>
              </div>
            )}

            <Button
              onClick={processFreighterPayment}
              disabled={!isWalletConnected || isProcessingPayment || !stellarPublicKey}
              className="text-xs md:text-sm h-8 md:h-10"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Payment with Wallet"
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
          <Alert className="mb-3 md:mb-4 bg-blue-50 border-blue-100 text-xs md:text-sm">
            <Info className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Use a test account to easily complete the payment without setting up a real wallet.
              This is perfect for testing the subscription feature.
            </AlertDescription>
          </Alert>
          
          {testAccount ? (
            <Card className="mb-3 md:mb-4">
              <CardContent className="p-2 md:p-4 space-y-2">
                <div>
                  <Label className="text-xs md:text-sm text-gray-500">Test Account Public Key</Label>
                  <p className="font-mono text-xxs md:text-xs break-all bg-gray-50 p-1 md:p-2 rounded">
                    {testAccount.publicKey}
                  </p>
                </div>
                <div>
                  <Label className="text-xs md:text-sm text-gray-500">Secret Key (Keep this secure!)</Label>
                  <p className="font-mono text-xxs md:text-xs break-all bg-gray-50 p-1 md:p-2 rounded">
                    {testAccount.secretKey}
                  </p>
                </div>
                <div className="flex items-center space-x-2 p-1 md:p-2 bg-green-50 rounded">
                  <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                  <span className="text-green-700 text-xs md:text-sm">Test Account Ready</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="secondary"
              onClick={handleCreateTestAccount}
              disabled={isCreatingTestAccount}
              className="w-full mb-3 md:mb-4 text-xs md:text-sm h-8 md:h-10"
            >
              {isCreatingTestAccount ? (
                <>
                  <Loader2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Creating Test Account...
                </>
              ) : (
                "Create Test Account"
              )}
            </Button>
          )}
          
          <Button
            onClick={processTestAccountPayment}
            disabled={!testAccount || isProcessingPayment}
            className="w-full text-xs md:text-sm h-8 md:h-10"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                Processing Test Payment...
              </>
            ) : (
              "Complete Payment with Test Account"
            )}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="border-t pt-3 md:pt-4 flex justify-between mt-4">
        <Button variant="outline" onClick={onCancel} className="text-xs md:text-sm h-8 md:h-10">
          Cancel
        </Button>
      </div>
    </div>
  );
}; 