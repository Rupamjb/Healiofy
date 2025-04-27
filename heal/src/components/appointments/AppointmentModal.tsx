import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Doctor } from "../../services/doctorService";
import { AppointmentForm } from "./AppointmentForm";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

export function AppointmentModal({ isOpen, onClose, doctor }: AppointmentModalProps) {
  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">Schedule Appointment</DialogTitle>
        </DialogHeader>
        <AppointmentForm 
          doctor={doctor} 
          onSuccess={onClose} 
          onCancel={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
} 