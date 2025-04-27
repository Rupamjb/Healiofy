import axios from 'axios';

// Define API base URL with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interfaces
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Setup axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 second timeout
});

// Setup auth header for authenticated requests
const setAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Export auth header function for other services
export const authHeader = () => {
  const token = localStorage.getItem('token');
  return token 
    ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } 
    : { 'Content-Type': 'application/json' };
};

// Save auth data to localStorage
const saveAuthData = (userData: User, token: string) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  setAuthHeader(token);
};

// Clear auth data from localStorage
const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  setAuthHeader(null);
};

// Load auth data from localStorage
export const loadAuthData = (): AuthState => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthHeader(token);
      return {
        token,
        user,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error loading auth data from localStorage:', error);
    clearAuthData();
  }
  
  return {
    token: null,
    user: null,
    isAuthenticated: false
  };
};

// Get current auth state
export const getCurrentAuth = (): AuthState => {
  return loadAuthData();
};

// Register a new user
export const register = async (email: string, password: string): Promise<AuthState> => {
  try {
    const response = await api.post('/auth/register', { email, password });
    
    if (response.data && response.data.token) {
      const userData = { 
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name
      };
      
      saveAuthData(userData, response.data.token);
      
      return {
        token: response.data.token,
        user: userData,
        isAuthenticated: true
      };
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error status
      const errorMsg = error.response.data?.error || 'Registration failed';
      console.error('Registration error:', errorMsg);
      throw new Error(errorMsg);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Registration error: No response received');
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something else caused the error
      const errorMsg = error.message || 'Registration failed';
      console.error('Registration error:', errorMsg);
      throw new Error(errorMsg);
    }
  }
};

// Login a user
export const login = async (email: string, password: string): Promise<AuthState> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data && response.data.token) {
      const userData = { 
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name
      };
      
      saveAuthData(userData, response.data.token);
      
      return {
        token: response.data.token,
        user: userData,
        isAuthenticated: true
      };
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error status
      const message = error.response.data?.error || 'Login failed';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something else caused the error
      throw new Error(error.message || 'Login failed');
    }
  }
};

// Logout a user
export const logout = (): void => {
  clearAuthData();
};

// Check auth status
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    setAuthHeader(token);
    const response = await api.get('/auth/me');
    return response.data.success;
  } catch (error: any) {
    console.error('Auth check error:', error.message);
    clearAuthData();
    return false;
  }
};

// Export the API instance for other services to use
export const authApi = api;
// Also export API_URL to avoid circular dependencies
export { API_URL }; 