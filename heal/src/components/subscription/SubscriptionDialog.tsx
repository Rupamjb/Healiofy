import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StellarPayment } from "./StellarPayment";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionDialog = ({ open, onOpenChange }: SubscriptionDialogProps) => {
  const { refreshSubscriptionStatus } = useSubscription();

  const handleSuccess = async () => {
    await refreshSubscriptionStatus();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to Healiofy</DialogTitle>
          <DialogDescription>
            Unlock unlimited access to all premium features.
          </DialogDescription>
        </DialogHeader>
        <StellarPayment onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}; 