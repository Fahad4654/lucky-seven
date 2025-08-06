"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CreditsContextType {
    credits: number;
    setCredits: React.Dispatch<React.SetStateAction<number>>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
    const [credits, setCredits] = useState(1000);
    
    return (
        <CreditsContext.Provider value={{ credits, setCredits }}>
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
