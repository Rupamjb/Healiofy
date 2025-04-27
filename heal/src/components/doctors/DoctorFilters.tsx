import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useAnimeEffect } from "@/hooks/useAnimeEffect";
import { motion } from 'framer-motion';
import { getDoctors } from "../../services/doctorService";

interface DoctorFiltersProps {
  onFilterChange: (filters: {
    search: string;
    specialty: string;
    availability: string;
  }) => void;
}

export const DoctorFilters = ({ onFilterChange }: DoctorFiltersProps) => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availability, setAvailability] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([
    "All Specialties",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Psychiatry",
    "Orthopedics",
    "Gynecology",
    "Ophthalmology"
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const filterRef = useAnimeEffect<HTMLDivElement>();

  // List of availability options
  const availabilityOptions = [
    "Any Time",
    "Available Now",
    "Available Today",
    "Next 3 Days",
    "This Week"
  ];

  // Fetch all specialties from API
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoading(true);
      try {
        const doctors = await getDoctors();
        // Extract unique specialties
        const uniqueSpecialties = [...new Set(doctors.map(doctor => doctor.specialty))];
        // Sort alphabetically
        uniqueSpecialties.sort();
        // Add "All Specialties" at the beginning
        setSpecialties(["All Specialties", ...uniqueSpecialties]);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        // Keep default specialties on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    // Debounce the filter change to avoid excessive updates
    const handler = setTimeout(() => {
      onFilterChange({
        search,
        specialty: specialty === "All Specialties" ? "" : specialty,
        availability: availability === "Any Time" ? "" : availability,
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search, specialty, availability, onFilterChange]);

  return (
    <motion.div 
      ref={filterRef}
      className="bg-white shadow-md rounded-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Doctors
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-medical-primary focus:ring focus:ring-medical-primary/20 py-2 px-3"
            disabled={isLoading}
          >
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-medical-primary focus:ring focus:ring-medical-primary/20 py-2 px-3"
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Button 
            className="w-full md:w-auto btn-primary"
            onClick={() => onFilterChange({
              search,
              specialty: specialty === "All Specialties" ? "" : specialty,
              availability: availability === "Any Time" ? "" : availability,
            })}
          >
            <Filter size={18} className="mr-2" /> Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
