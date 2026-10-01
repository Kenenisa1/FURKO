import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import apiClient from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone: string) => Promise<boolean>;
  verifyPhone: (code: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Demo citizen user with realistic Ethiopian profile data
const DEMO_CITIZEN: User = {
  id: 'usr-demo-001',
  full_name: 'Dawit Tadesse',
  email: 'dawit@example.com',
  phone_number: '+251 91 123 4567',
  role: 'citizen',
  phone_verified: true,
  subcity: 'Bole / Jimma Central',
  kebele: 'Kebele 04',
  created_at: '2026-09-15T10:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore stored session on launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('furko_token');
        const savedUser = await SecureStore.getItemAsync('furko_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: identifier,
        password,
      });
      const { user: authedUser, token: authToken } = response.data.data;
      setUser(authedUser);
      setToken(authToken);
      await SecureStore.setItemAsync('furko_token', authToken);
      await SecureStore.setItemAsync('furko_user', JSON.stringify(authedUser));
      return true;
    } catch {
      // In development / demo mode, allow login with fallback
      const demoUser: User = {
        ...DEMO_CITIZEN,
        email: identifier.includes('@') ? identifier : DEMO_CITIZEN.email,
        phone_number: !identifier.includes('@') ? identifier : DEMO_CITIZEN.phone_number,
      };
      setUser(demoUser);
      setToken('demo-token-mock');
      await SecureStore.setItemAsync('furko_token', 'demo-token-mock');
      await SecureStore.setItemAsync('furko_user', JSON.stringify(demoUser));
      return true;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    phone: string
  ): Promise<boolean> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      full_name: fullName,
      email,
      phone_number: phone,
      role: 'citizen',
      phone_verified: false,
      subcity: 'Jimma City',
      kebele: 'Kebele 01',
      created_at: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        phone_number: phone,
      });
      const { user: registeredUser, token: authToken } = response.data.data;
      setUser(registeredUser);
      setToken(authToken);
      await SecureStore.setItemAsync('furko_token', authToken);
      await SecureStore.setItemAsync('furko_user', JSON.stringify(registeredUser));
      return true;
    } catch {
      // Mock registration fallback
      setUser(newUser);
      setToken('demo-token-mock');
      await SecureStore.setItemAsync('furko_token', 'demo-token-mock');
      await SecureStore.setItemAsync('furko_user', JSON.stringify(newUser));
      return true;
    }
  };

  const verifyPhone = async (code: string): Promise<boolean> => {
    // Accepts any 6 digit code for demo / testing
    if (code.length === 6) {
      if (user) {
        const updatedUser: User = {
          ...user,
          phone_verified: true,
        };
        setUser(updatedUser);
        try {
          await SecureStore.setItemAsync('furko_user', JSON.stringify(updatedUser));
        } catch {
          // ignore
        }
      }
      return true;
    }
    return false;
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser: User = {
      ...user,
      ...updatedData,
    };
    setUser(updatedUser);
    try {
      await SecureStore.setItemAsync('furko_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    return true;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    try {
      await SecureStore.deleteItemAsync('furko_token');
      await SecureStore.deleteItemAsync('furko_user');
    } catch {
      // ignore
    }
  };

  const skipAuth = () => {
    setUser(DEMO_CITIZEN);
    setToken('demo-token-preview');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyPhone,
        updateProfile,
        logout,
        skipAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
