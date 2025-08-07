
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Repeat, Apple, Award, ArrowRight, Banknote } from "lucide-react";
import { useCredits } from "@/context/credits-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

const TOTAL_LEVELS = 10;
const APPLES_PER_LEVEL = 5;

// Multipliers for each level (1-indexed)
const levelMultipliers: { [key: number]: number } = {
    1: 1.2,
    2: 1.5,
    3: 2,
    4: 3,
    5: 5,
    6: 7,
    7: 10,
    8: 15,
    9: 25,
    10: 50,
};

interface Level {
    apples: { state: 'hidden' | 'good' | 'bad' }[];
    badAppleIndex: number;
}

export default function FortuneAppleCard() {
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'gameOver'>('betting');
    const [betAmount, setBetAmount] = useState(10);
    const { credits, setCredits } = useCredits();
    const { toast } = useToast();
    const [currentLevel, setCurrentLevel] = useState(0);
    const [levels, setLevels] = useState<Level[]>([]);
    const [potentialWinnings, setPotentialWinnings] = useState(0);

    const generateLevels = () => {
        const newLevels = Array.from({ length: TOTAL_LEVELS }, () => ({
            apples: Array.from({ length: APPLES_PER_LEVEL }, () => ({ state: 'hidden' as 'hidden' })),
            badAppleIndex: Math.floor(Math.random() * APPLES_PER_LEVEL),
        }));
        setLevels(newLevels);
    };

    const handleStartGame = () => {
        if(credits < betAmount) {
             toast({
                title: "Insufficient Credits",
                description: `You need at least ${betAmount} credits to play.`,
                variant: "destructive",
            });
            return;
        }

        setCredits(c => c - betAmount);
        generateLevels();
        setCurrentLevel(1);
        setPotentialWinnings(betAmount);
        setGameState('playing');
    };
    
    const handleApplePick = (levelIndex: number, appleIndex: number) => {
        if (gameState !== 'playing' || levelIndex + 1 !== currentLevel) return;

        const newLevels = [...levels];
        const pickedLevel = newLevels[levelIndex];

        if (appleIndex === pickedLevel.badAppleIndex) {
            // Picked bad apple
            pickedLevel.apples.forEach((apple, i) => {
                apple.state = i === pickedLevel.badAppleIndex ? 'bad' : 'good';
            });
            // The picked apple is bad, but we want to show it as bad
            pickedLevel.apples[appleIndex].state = 'bad';
            
            setGameState('gameOver');
            toast({
                title: "Game Over!",
                description: `You picked a rotten apple and lost your ${betAmount.toLocaleString()} credit bet.`,
                variant: "destructive",
            });
        } else {
            // Picked good apple
            pickedLevel.apples[appleIndex].state = 'good';
            const newWinnings = potentialWinnings * levelMultipliers[currentLevel];
            setPotentialWinnings(newWinnings);

            if (currentLevel === TOTAL_LEVELS) {
                // Won the final level
                setCredits(c => c + newWinnings);
                setGameState('gameOver');
                toast({
                    title: "Congratulations!",
                    description: `You completed all levels and won ${newWinnings.toLocaleString()} credits!`,
                });
            } else {
                // Move to next level
                setCurrentLevel(c => c + 1);
            }
        }
        setLevels(newLevels);
    };

    const handleCashOut = () => {
        if (gameState !== 'playing' || currentLevel <= 1) return;
        
        const lastLevelMultiplier = levelMultipliers[currentLevel - 1];
        const winnings = betAmount * lastLevelMultiplier;
        
        setCredits(c => c + winnings);
        setGameState('gameOver');
        toast({
            title: "You Cashed Out!",
            description: `You secured ${winnings.toLocaleString()} credits!`,
        });
    };

    const handlePlayAgain = () => {
        setGameState('betting');
        setCurrentLevel(0);
        setLevels([]);
    };
    
    const getWinningsForLevel = (level: number) => {
        return betAmount * (levelMultipliers[level] || 1);
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center gap-2">
                    <Apple /> Apple of Fortune
                </CardTitle>
                <CardDescription className="font-body">Pick a good apple to advance. Cash out anytime or risk it all!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {gameState !== 'betting' && (
                     <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                        {levels.slice(0).reverse().map((level, i) => {
                            const levelIndex = TOTAL_LEVELS - 1 - i;
                            return (
                                <div key={levelIndex} className={cn("p-3 rounded-lg transition-all duration-300", currentLevel === levelIndex + 1 && gameState === 'playing' ? 'bg-primary/10 border-2 border-primary' : 'bg-background/50 opacity-50')}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-headline text-lg">Level {levelIndex + 1}</h3>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{getWinningsForLevel(levelIndex + 1).toLocaleString()} Credits</p>
                                            <p className="text-xs text-muted-foreground">x{levelMultipliers[levelIndex+1]} Multiplier</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-around items-center h-16 sm:h-20">
                                        {level.apples.map((apple, appleIndex) => (
                                            <button
                                                key={appleIndex}
                                                onClick={() => handleApplePick(levelIndex, appleIndex)}
                                                disabled={gameState !== 'playing' || currentLevel !== levelIndex + 1}
                                                className="disabled:cursor-not-allowed transition-transform hover:scale-110"
                                            >
                                                <Apple className={cn(
                                                    "w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg",
                                                    apple.state === 'hidden' && 'text-yellow-900/50 opacity-50',
                                                    apple.state === 'good' && 'text-green-500',
                                                    apple.state === 'bad' && 'text-red-800 animate-pulse',
                                                    (gameState !== 'playing' || currentLevel !== levelIndex + 1) ? '' : 'text-yellow-400 hover:text-yellow-300'
                                                )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                           )
                        })}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col space-y-4">
                 {gameState === 'betting' && (
                     <div className="flex flex-col items-center space-y-4 w-full">
                        <div className="space-y-2">
                            <Label htmlFor="bet-amount">Bet Amount (Cost)</Label>
                            <Input 
                                id="bet-amount" 
                                type="number" 
                                value={betAmount} 
                                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                                className="w-48 text-center"
                            />
                        </div>
                        <Button onClick={handleStartGame} className="w-48 text-lg font-headline">
                           Place Bet
                        </Button>
                    </div>
                )}

                {gameState === 'playing' && (
                     <Button 
                        onClick={handleCashOut} 
                        disabled={currentLevel <= 1}
                        variant="secondary"
                        className="w-48 text-lg font-headline gap-2"
                     >
                        <Banknote />
                        Cash Out
                    </Button>
                )}

                {gameState === 'gameOver' && (
                    <Button onClick={handlePlayAgain} variant="secondary" className="gap-2 w-48 text-lg font-headline">
                        <Repeat />
                        Play Again
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
