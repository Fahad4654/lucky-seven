
"use client";

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
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
    initialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false); // For login/logout actions
    const [initialLoading, setInitialLoading] = useState(true); // For initial page load
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
        }
        setInitialLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: pass }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const { user: loggedInUser, accessToken, refreshToken } = data;

            localStorage.setItem('user', JSON.stringify(loggedInUser));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            // Set a cookie for middleware to read
            document.cookie = `user=true; path=/; max-age=${60 * 60 * 24 * 7}`;
            setUser(loggedInUser);
            router.push('/home'); // Redirect to home page
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
                console.error("Logout API call failed", error);
                // We still proceed to log out the user on the client side
            }
        }

        // Clear local storage and cookies
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Update state and redirect
        setUser(null);
        router.push('/login');
    };

    if (initialLoading) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background">
                {children}
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
