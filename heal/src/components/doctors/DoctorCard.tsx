import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Clock, ThumbsUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Doctor as ApiDoctor } from "../../services/doctorService";
import { AppointmentModal } from "../appointments/AppointmentModal";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/currencyFormatter";
import { useNavigate } from "react-router-dom";

export interface DoctorCardProps {
  doctor: ApiDoctor;
  index: number;
}

export const DoctorCard = ({ doctor, index }: DoctorCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const { subscriptionStatus, checkAccess } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Convert availability array to a display status
  const getAvailabilityStatus = (doctor: ApiDoctor) => {
    if (doctor.isAvailableNow) {
      return "Available Now";
    } else if (doctor.availability.length > 0) {
      if (doctor.availability[0].startsWith("Mon") || doctor.availability[0].startsWith("Tue")) {
        return "Available Today";
      } else {
        return "Next 3 Days";
      }
    } else {
      return "This Week";
    }
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book an appointment",
        variant: "destructive"
      });
      return;
    }

    // Check subscription status
    if (subscriptionStatus?.status === 'trial' && subscriptionStatus.trialConsultationsRemaining <= 0) {
      toast({
        title: "Trial limit reached",
        description: "You've used all your free consultations. Subscribe to book more appointments.",
        variant: "destructive"
      });
      
      // Redirect to subscription page with the doctors page as redirect
      const redirectPath = encodeURIComponent(window.location.pathname);
      navigate(`/subscription?redirect=${redirectPath}&service=doctor consultations`);
      return;
    }

    // Check if user has access to consultation service
    if (!checkAccess('consultation')) {
      toast({
        title: "Subscription required",
        description: "Please subscribe to book appointments",
        variant: "destructive"
      });
      
      // Redirect to subscription page with the doctors page as redirect
      const redirectPath = encodeURIComponent(window.location.pathname);
      navigate(`/subscription?redirect=${redirectPath}&service=doctor consultations`);
      return;
    }

    setShowAppointmentModal(true);
  };
  
  return (
    <>
      <motion.div 
        className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 card-hover"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 * index, ease: "easeOut" }}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img 
                src={doctor.imageUrl || "/images/default-doctor.jpg"} 
                alt={doctor.name || "Doctor"} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                onError={(e) => {
                  console.log(`Image load error for doctor: ${doctor.name}`);
                  e.currentTarget.src = "/images/default-doctor.jpg";
                }}
              />
              {doctor.rating >= 4.8 && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                  <Award size={14} />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="text-xl font-semibold">{doctor.name || "Unknown Doctor"}</h3>
                <div className="mt-2 sm:mt-0 flex items-center justify-center sm:justify-start">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{doctor.rating || "N/A"}</span>
                  <span className="text-sm text-gray-500 ml-1">({doctor.reviews || 0} reviews)</span>
                </div>
              </div>
              
              <p className="text-medical-primary font-medium mt-1">{doctor.specialty || "General Practice"}</p>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock size={12} className="mr-1" /> {doctor.experience || "N/A"} exp
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <ThumbsUp size={12} className="mr-1" /> {getAvailabilityStatus(doctor)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formatCurrency(doctor.price || 0)} / session
                </span>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 ${expanded ? 'block' : 'hidden sm:block'}`}>
            <p className="text-gray-600 text-sm line-clamp-2 sm:line-clamp-none">{doctor.bio || "No bio available."}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center mt-5 gap-3">
            <Button 
              className="btn-primary w-full sm:w-auto"
              onClick={handleBookAppointment}
            >
              <Calendar className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              View Profile
            </Button>
            <Button 
              variant="ghost" 
              className="text-xs sm:hidden w-full" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
          </div>
        </div>
      </motion.div>

      <AppointmentModal 
        isOpen={showAppointmentModal} 
        onClose={() => setShowAppointmentModal(false)} 
        doctor={doctor} 
      />
    </>
  );
};
