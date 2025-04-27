import axios from 'axios';
import { authHeader } from './authService';

// Define API URL with proper deployment support
export const API_URL = (() => {
  // Check if we have an environment variable
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) return envApiUrl;

  // Check the current URL to determine if we're on Vercel
  const isVercel = window.location.hostname.includes('vercel.app');
  const isProd = import.meta.env.PROD;
  
  if (isProd) {
    if (isVercel) {
      // If we're on Vercel, use the same domain for the API
      // This assumes your API is deployed on the same Vercel project
      const domain = window.location.hostname;
      return `https://${domain}/api`;
    }
    // Default production API URL
    return 'https://healiofy-server.vercel.app/api';
  }
  
  // Local development
  return 'http://localhost:5000/api';
})();

// Function to check if the API is reachable
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log(`Checking API connection to ${API_URL}`);
    // First try the dedicated health endpoint
    const response = await axios.get(`${API_URL}/health`);
    console.log('API health response:', response.status, response.data);
    return response.status === 200;
  } catch (error: any) {
    console.error('API health endpoint error:', error.message);
    
    // If health endpoint fails, try the doctors endpoint as a fallback
    try {
      console.log('Trying doctors endpoint as fallback');
      const doctorsResponse = await axios.get(`${API_URL}/doctors`);
      console.log('Doctors endpoint response:', doctorsResponse.status);
      return doctorsResponse.status === 200;
    } catch (secondError: any) {
      console.error('API connection error (both endpoints failed):', secondError.message);
      return false;
    }
  }
};

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  availability: string[];
  bio: string;
  imageUrl: string;
  rating: number;
  experience: string;
  reviews: number;
  price: number;
  isAvailableNow: boolean;
}

export interface DoctorsResponse {
  success: boolean;
  count: number;
  data: Doctor[];
}

export interface DoctorResponse {
  success: boolean;
  data: Doctor;
}

// Mock data for fallback when server is unavailable
const MOCK_DOCTORS: Doctor[] = [
  {
    _id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    availability: ["Monday 9-5", "Wednesday 10-6"],
    bio: "Board-certified cardiologist with 12 years of experience in treating heart conditions and preventive care.",
    imageUrl: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 4.9,
    experience: "12 years",
    reviews: 128,
    price: 1500,
    isAvailableNow: true
  },
  {
    _id: "2",
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    availability: ["Tuesday 8-4", "Thursday 9-5", "Friday 10-4"],
    bio: "Specializing in both medical and cosmetic dermatology. Focused on treating skin conditions and providing skincare advice.",
    imageUrl: "https://randomuser.me/api/portraits/men/36.jpg",
    rating: 4.7,
    experience: "8 years",
    reviews: 93,
    price: 1750,
    isAvailableNow: false
  },
  {
    _id: "3",
    name: "Dr. Rebecca Foster",
    specialty: "Pediatrics",
    availability: ["Monday 8-4", "Wednesday 8-4", "Friday 9-5"],
    bio: "Compassionate pediatrician dedicated to the health and development of children from infancy through adolescence.",
    imageUrl: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 4.8,
    experience: "10 years",
    reviews: 156,
    price: 1250,
    isAvailableNow: true
  }
];

// Get all doctors
export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    console.log(`Attempting to fetch doctors from ${API_URL}/doctors`);
    const response = await axios.get<DoctorsResponse>(`${API_URL}/doctors`);
    console.log('Doctors API response:', response.status, response.statusText);
    console.log('Doctors data:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching doctors:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received');
    }
    console.log('Using mock doctor data instead');
    return MOCK_DOCTORS;
  }
};

// Search doctors by name
export const searchDoctorsByName = async (name: string): Promise<Doctor[]> => {
  try {
    const response = await axios.get<DoctorsResponse>(`${API_URL}/doctors`, {
      params: { name }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error searching doctors by name:', error);
    // Return filtered mock data based on search
    console.log('Using filtered mock data for search');
    return MOCK_DOCTORS.filter(doctor => 
      doctor.name.toLowerCase().includes(name.toLowerCase())
    );
  }
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (specialty: string): Promise<Doctor[]> => {
  try {
    const response = await axios.get<DoctorsResponse>(`${API_URL}/doctors`, {
      params: { specialty }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    // Return filtered mock data based on specialty
    console.log('Using filtered mock data for specialty');
    return MOCK_DOCTORS.filter(doctor => 
      doctor.specialty.toLowerCase() === specialty.toLowerCase()
    );
  }
};

// Get doctor by ID
export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  try {
    const response = await axios.get<DoctorResponse>(`${API_URL}/doctors/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    // Return mock doctor with matching ID or null
    const mockDoctor = MOCK_DOCTORS.find(doctor => doctor._id === id);
    return mockDoctor || null;
  }
}; 