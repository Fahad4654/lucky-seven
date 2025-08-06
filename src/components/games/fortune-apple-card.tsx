
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { generateFortune } from "@/ai/flows/fortune-flow";
import type { GenerateFortuneOutput } from "@/ai/schemas/fortune-schema";
import { useToast } from "@/hooks/use-toast";
import { Repeat } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useCredits } from "@/context/credits-context";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function FortuneAppleCard() {
    const [gameState, setGameState] = useState<'ready' | 'loading' | 'revealed'>('ready');
    const [result, setResult] = useState<GenerateFortuneOutput | null>(null);
    const { credits, setCredits } = useCredits();
    const [betAmount, setBetAmount] = useState(1);
    const { toast } = useToast();

    const handlePlay = async () => {
        if(credits < betAmount) {
             toast({
                title: "Insufficient Credits",
                description: `You need at least ${betAmount} credits to play.`,
                variant: "destructive",
            });
            return;
        }

        setCredits(c => c - betAmount);
        setGameState('loading');
        setResult(null);
        try {
            const fortuneResult = await generateFortune();
            const prize = fortuneResult.prize * betAmount;
            const finalResult = {...fortuneResult, prize};

            setResult(finalResult);
            setCredits(c => c + prize);
            setGameState('revealed');
            toast({
                title: "Fortune Found!",
                description: `You won ${prize.toLocaleString()} credits!`,
            });
        } catch (error) {
            console.error("Failed to generate fortune:", error);
            toast({
                title: "Something went wrong",
                description: "Could not fetch your fortune. Please try again.",
                variant: "destructive",
            });
            setCredits(c => c + betAmount); // Refund
            setGameState('ready');
        }
    };

    const handlePlayAgain = () => {
        setGameState('ready');
        setResult(null);
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Fortune Apple</CardTitle>
                <CardDescription className="font-body">Take a bite and see what fortune awaits. Your prize is multiplied by your bet!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-full max-w-sm aspect-square">
                    <Image 
                        src="https://placehold.co/600.png"
                        alt="A shiny red apple"
                        fill
                        className={`rounded-full object-cover transition-all duration-500 ${gameState === 'loading' ? 'animate-pulse' : ''}`}
                        data-ai-hint="red apple"
                    />
                </div>

                {gameState === 'loading' && (
                    <div className="text-center p-4 rounded-lg bg-background/50 w-full min-h-[120px]">
                        <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                    </div>
                )}

                {gameState === 'revealed' && result && (
                    <div className="text-center p-4 rounded-lg bg-background/50 w-full min-h-[120px]">
                        <p className="text-lg font-body italic text-muted-foreground mb-2">"{result.fortune}"</p>
                        <p className="text-2xl font-bold font-headline text-primary">You win {result.prize.toLocaleString()} credits!</p>
                    </div>
                )}

                {gameState === 'ready' ? (
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
                        <Button onClick={handlePlay} disabled={gameState === 'loading'} className="w-48 text-lg font-headline">
                            Take a Bite
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handlePlayAgain} variant="secondary" className="gap-2 w-48 text-lg font-headline">
                        <Repeat />
                        Play Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
