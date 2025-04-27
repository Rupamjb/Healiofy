import { useState, useEffect } from "react";
import { DoctorCard } from "./DoctorCard";
import { Button } from "@/components/ui/button";
import { Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Doctor,
  getDoctors, 
  searchDoctorsByName, 
  getDoctorsBySpecialty 
} from "../../services/doctorService";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface DoctorListProps {
  filters: {
    search: string;
    specialty: string;
    availability: string;
  };
}

export const DoctorList = ({ filters }: DoctorListProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const { subscriptionStatus } = useSubscription();
  const navigate = useNavigate();
  
  // Determine if we should show the subscription alert
  const showSubscriptionAlert = subscriptionStatus?.status === 'trial';
  const remainingConsultations = subscriptionStatus?.trialConsultationsRemaining || 0;
  const isLowConsultations = remainingConsultations <= 2;
  
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let result: Doctor[] = [];
        
        console.log("Fetching doctors with filters:", filters);
        
        // If we have a name search, use that
        if (filters.search) {
          result = await searchDoctorsByName(filters.search);
        } 
        // If we have a specialty filter, use that
        else if (filters.specialty) {
          result = await getDoctorsBySpecialty(filters.specialty);
        } 
        // Otherwise, get all doctors
        else {
          result = await getDoctors();
        }
        
        console.log("Doctors fetched:", result.length);
        console.log("First doctor sample:", result.length > 0 ? JSON.stringify(result[0]) : "No doctors");
        
        // Filter by availability if needed (frontend filtering)
        if (filters.availability && result.length > 0) {
          // Convert backend availability array to a frontend status
          const getAvailabilityStatus = (doctor: Doctor) => {
            if (doctor.isAvailableNow) {
              return "Available Now";
            } else if (doctor.availability && doctor.availability.length > 0) {
              if (doctor.availability[0].startsWith("Mon") || doctor.availability[0].startsWith("Tue")) {
                return "Available Today";
              } else {
                return "Next 3 Days";
              }
            } else {
              return "This Week";
            }
          };
          
          const beforeFilterCount = result.length;
          result = result.filter(doctor => {
            const status = getAvailabilityStatus(doctor);
            return status === filters.availability;
          });
          console.log(`Filtered by availability: ${beforeFilterCount} -> ${result.length}`);
        }
        
        setDoctors(result);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again later.');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Remove the delay that was causing multiple renders
    fetchDoctors();
    
    // Clean up function in case component unmounts during fetch
    return () => {
      // Nothing to clean up specifically
    };
  }, [filters.search, filters.specialty, filters.availability]);
  
  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, doctors.length));
  };

  const handleSubscribe = () => {
    const redirectPath = encodeURIComponent(window.location.pathname);
    navigate(`/subscription?redirect=${redirectPath}&service=doctor consultations`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="h-10 w-10 text-medical-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-red-600">Error</h3>
        <p className="text-gray-700 mt-2">{error}</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-gray-700">No doctors found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div>
      {showSubscriptionAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Alert className={`${isLowConsultations ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-300'}`}>
            <AlertCircle className={`h-4 w-4 ${isLowConsultations ? 'text-amber-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <AlertTitle className={isLowConsultations ? 'text-amber-700' : 'text-blue-700'}>
                {isLowConsultations ? 'Limited Consultations Remaining' : 'Free Trial Active'}
              </AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className={isLowConsultations ? 'text-amber-700' : 'text-blue-700'}>
                  {isLowConsultations 
                    ? `You have only ${remainingConsultations} free consultation${remainingConsultations === 1 ? '' : 's'} left in your trial.` 
                    : `You have ${remainingConsultations} free consultation${remainingConsultations === 1 ? '' : 's'} in your trial.`}
                </span>
                <Button 
                  size="sm" 
                  className={`mt-2 sm:mt-0 sm:ml-4 ${isLowConsultations 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`} 
                  onClick={handleSubscribe}
                >
                  Subscribe Now
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        </motion.div>
      )}

      <div className="space-y-6">
        {doctors.slice(0, visibleCount).map((doctor, index) => (
          <DoctorCard key={doctor._id} doctor={doctor} index={index} />
        ))}
      </div>
      
      {visibleCount < doctors.length && (
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={loadMore} 
            variant="outline" 
            className="px-8"
          >
            Load More
          </Button>
        </motion.div>
      )}
    </div>
  );
};
