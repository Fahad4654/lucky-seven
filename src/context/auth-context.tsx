"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for a logged-in user in local storage or a cookie
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        // !! IMPORTANT !!
        // This is a placeholder for your actual API call.
        // Replace this with a fetch request to your login API.
        console.log("Attempting login with:", email, pass);
        
        // --- REPLACE THIS BLOCK ---
        if (email && pass) { // Basic check, replace with API call
            const loggedInUser: User = { id: '1', email, name: 'Test User' };
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            router.push('/slot-machine');
            return true;
        }
        // --- END REPLACE ---

        return false;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
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
