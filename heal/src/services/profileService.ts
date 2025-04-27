import axios from 'axios';
import { User } from './authService';
import { authHeader, API_URL } from './authService';

export interface UserProfile extends User {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | '';
  emergencyContact?: string;
  allergies?: string;
  medicalConditions?: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | '';
  emergencyContact?: string;
  allergies?: string;
  medicalConditions?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}

// Get user profile 
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await axios.get<ProfileResponse>(
      `${API_URL}/auth/me`,
      { headers: authHeader() }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (profileData: ProfileUpdateData): Promise<UserProfile | null> => {
  try {
    const response = await axios.put<ProfileResponse>(
      `${API_URL}/auth/profile`,
      profileData,
      { headers: authHeader() }
    );
    
    // Update local storage with new user data if successful
    if (response.data.success) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.response?.data?.error || 'Failed to update profile');
  }
};

// Change user password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const response = await axios.put(
      `${API_URL}/auth/password`,
      { currentPassword, newPassword },
      { headers: authHeader() }
    );
    
    return response.data.success;
  } catch (error: any) {
    console.error('Error changing password:', error);
    throw new Error(error.response?.data?.error || 'Failed to change password');
  }
}; 