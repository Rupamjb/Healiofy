import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as authService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import { useLoading } from "./LoadingContext";
import { usePrescription } from "./PrescriptionContext";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the hook separately to maintain HMR compatibility
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const prescription = usePrescription();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const currentAuth = authService.getCurrentAuth();
    setAuthState(currentAuth);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    // Show global loading indicator for login
    startLoading();
    
    try {
      const authState = await authService.login(email, password);
      setAuthState(authState);
      handleRedirectAfterAuth();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    // Show global loading indicator for registration
    startLoading();
    
    try {
      const authState = await authService.register(email, password);
      setAuthState(authState);
      handleRedirectAfterAuth();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const logout = () => {
    // Show a short loading indicator on logout
    startLoading();
    
    // Reset prescription state
    prescription.clearPrescriptionState();
    
    // Clear all application-related localStorage items
    localStorage.removeItem('healiofy_chat_messages');
    localStorage.removeItem('healiofy_chat_history');
    localStorage.removeItem('healiofy_chat_context');
    localStorage.removeItem('pendingAppointmentOperations');
    localStorage.removeItem('cachedAppointments');
    localStorage.removeItem('successfulAppointmentEndpoint');
    
    // Call the auth service logout to clear user and token
    authService.logout();
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    // Hide the loading indicator after a short delay
    setTimeout(() => {
      stopLoading();
    }, 500);
  };

  const handleRedirectAfterAuth = () => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath);
    }
  };

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export both the provider and hook
export { useAuth }; 