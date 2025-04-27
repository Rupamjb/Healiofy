import { useState, useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { DoctorHeader } from '../components/doctors/DoctorHeader';
import { DoctorFilters } from '../components/doctors/DoctorFilters';
import { DoctorList } from '../components/doctors/DoctorList';
import { checkApiConnection, API_URL } from '../services/doctorService';
import { useToast } from '@/components/ui/use-toast';

const Doctors = () => {
  const [filters, setFilters] = useState({
    search: "",
    specialty: "",
    availability: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check API connection on component mount
    const checkApi = async () => {
      try {
        console.log("Starting API connection check to:", API_URL);
        const isConnected = await checkApiConnection();
        if (!isConnected) {
          console.error(`Could not connect to API at ${API_URL}`);
          // Only show toast if the connection fails completely
          toast({
            title: "Connection notice",
            description: "Having trouble connecting to the server. Some features may be limited.",
            variant: "destructive",
            duration: 5000
          });
        } else {
          console.log("Successfully connected to API");
        }
      } catch (error) {
        console.error("Error checking API connection:", error);
      }
    };
    
    // Set a short delay to avoid race conditions with other initialization
    const timer = setTimeout(() => {
      checkApi();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);

  const handleFilterChange = (newFilters: {
    search: string;
    specialty: string;
    availability: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Find a Doctor - Healiofy</title>
        <meta name="description" content="Connect with board-certified specialists who provide personalized care through secure video consultations." />
      </Helmet>
      
      <main className="flex-grow">
        <DoctorHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DoctorFilters onFilterChange={handleFilterChange} />
          <DoctorList filters={filters} />
        </div>
      </main>
    </MainLayout>
  );
};

export default Doctors;
