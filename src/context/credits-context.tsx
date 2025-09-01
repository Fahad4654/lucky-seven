
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreditsContextType {
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
    loading: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchCredits = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 1. Fetch account info
                const accountResponse = await api('/find/account', {
                    method: 'POST',
                    body: JSON.stringify({ userId: user.id }),
                });

                if (!accountResponse.ok) {
                    throw new Error('Failed to fetch account details.');
                }

                const accountData = await accountResponse.json();
                const accountId = accountData.account?.id;

                if (!accountId) {
                    throw new Error('Account ID not found in response.');
                }

                // 2. Fetch balance using accountId
                const balanceResponse = await api('/find/balance', {
                    method: 'POST',
                    body: JSON.stringify({ accountId }),
                });

                if (!balanceResponse.ok) {
                    throw new Error('Failed to fetch balance.');
                }

                const balanceData = await balanceResponse.json();
                const availableBalance = balanceData.balance?.availableBalance;

                if (availableBalance !== undefined) {
                    setCredits(parseFloat(availableBalance));
                } else {
                     throw new Error('Available balance not found in response.');
                }

            } catch (error: any) {
                console.error("Failed to fetch credits:", error);
                toast({
                    title: "Error Fetching Balance",
                    description: "Could not load your credit balance.",
                    variant: "destructive",
                });
                // Set a default/fallback value if fetching fails
                setCredits(0);
            } finally {
                setLoading(false);
            }
        };

        fetchCredits();
    }, [user, toast]);
    
    return (
        <CreditsContext.Provider value={{ credits, setCredits, loading }}>
            {children}
        </CreditsContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditsContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditsProvider');
    }
    return context;
}
