import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthState, UserRole } from '@/types/chat';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'chat_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState({
          isAuthenticated: true,
          user: parsed,
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userRef = doc(db, 'users', username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userSnap.data();
      
      if (userData.password !== password) {
        return { success: false, error: 'Invalid password' };
      }

      const user = {
        username,
        role: userData.role as UserRole,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        user,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
