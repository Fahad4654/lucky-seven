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

export default function FortuneAppleCard() {
    const [gameState, setGameState] = useState<'ready' | 'loading' | 'revealed'>('ready');
    const [result, setResult] = useState<GenerateFortuneOutput | null>(null);
    const { toast } = useToast();

    const handlePlay = async () => {
        setGameState('loading');
        setResult(null);
        try {
            const fortuneResult = await generateFortune();
            setResult(fortuneResult);
            setGameState('revealed');
            toast({
                title: "Fortune Found!",
                description: `You won ${fortuneResult.prize} credits!`,
            });
        } catch (error) {
            console.error("Failed to generate fortune:", error);
            toast({
                title: "Something went wrong",
                description: "Could not fetch your fortune. Please try again.",
                variant: "destructive",
            });
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
                <CardDescription className="font-body">Take a bite and see what fortune awaits.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-full max-w-sm aspect-square">
                    <Image 
                        src="https://placehold.co/400x400.png"
                        alt="A shiny red apple"
                        width={400}
                        height={400}
                        className={`rounded-full transition-all duration-500 ${gameState === 'loading' ? 'animate-pulse' : ''}`}
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
                        <p className="text-2xl font-bold font-headline text-primary">You win {result.prize} credits!</p>
                    </div>
                )}

                {gameState === 'ready' ? (
                     <Button onClick={handlePlay} disabled={gameState === 'loading'} className="w-48 text-lg font-headline">
                        Take a Bite
                    </Button>
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
