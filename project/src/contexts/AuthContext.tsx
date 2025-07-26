// project/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

// Defines the shape of the data and functions available in the context
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to easily use the AuthContext in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On initial load, check if a user is already logged in (data stored in localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('vehicleGuardUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('vehicleGuardUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Handles user login by calling the backend API
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      // On successful login, set user in state and save to local storage
      setUser(result.user);
      localStorage.setItem('vehicleGuardUser', JSON.stringify(result.user));
      
      setIsLoading(false);
      return { success: true };

    } catch (error: any) {
      console.error('Login API error:', error.message);
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Handles user registration by calling the backend API
  const register = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    console.log("Attempting to register user via backend:", { username });

    try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Registration failed from server');
        }
      
        setIsLoading(false);
        alert('Registration successful! Please log in.'); // Notify user to log in now
        return { success: true };

    } catch (error: any) {
        console.error('Registration API error:', error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
    }
  };


  // Logs the user out
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vehicleGuardUser');
  };

  // Updates the currently logged-in user's information in the app's state
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('vehicleGuardUser', JSON.stringify(updatedUser));
      // NOTE: A proper implementation would also send these changes to a backend endpoint.
    }
  };

  // Provide the auth data and functions to the rest of the app
  const value = {
    user,
    login,
    logout,
    isLoading,
    updateUser,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};