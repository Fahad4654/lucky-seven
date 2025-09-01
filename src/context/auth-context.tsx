'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  initialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    }
    setInitialLoading(false);
  }, []);

  const login = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: loggedInUser, accessToken, refreshToken } = data;

      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `user=true; path=/; max-age=${60 * 60 * 24 * 7}`;

      setUser(loggedInUser);
      router.push('/home');
      return true;
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout API call failed', error);
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    setUser(null);
    router.push('/login');
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, initialLoading }}>
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
