
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Star, Diamond, Bell, Cherry, Award, Clover } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useCredits } from '@/context/credits-context';

const symbols = [
  { icon: <Cherry className="h-16 w-16 text-red-500" />, value: 'cherry' },
  { icon: <Bell className="h-16 w-16 text-yellow-400" />, value: 'bell' },
  { icon: <Clover className="h-16 w-16 text-green-500" />, value: 'clover' },
  { icon: <Diamond className="h-16 w-16 text-blue-500" />, value: 'diamond' },
  { icon: <Star className="h-16 w-16 text-yellow-300" />, value: 'star' },
  { icon: <Award className="h-16 w-16 text-primary" />, value: 'seven' },
];

const Reel = ({ symbols, startSpinning, reelIndex }: { symbols: {icon: React.ReactNode, value: string}[], startSpinning: boolean, reelIndex: number }) => {
    const [localSymbols, setLocalSymbols] = useState(symbols);
    const [isSpinning, setIsSpinning] = useState(false);

    useEffect(() => {
        if (startSpinning) {
            setIsSpinning(true);
            const spinDuration = 1000 + reelIndex * 300; 
            const interval = setInterval(() => {
                setLocalSymbols(prev => [...prev.slice(1), prev[0]]);
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                const finalSymbols = [...symbols].sort(() => Math.random() - 0.5);
                const randomIndex = Math.floor(Math.random() * finalSymbols.length);
                const finalOrder = [...finalSymbols.slice(randomIndex), ...finalSymbols.slice(0, randomIndex)];
                setLocalSymbols(finalOrder);
                setIsSpinning(false);
            }, spinDuration);
        }
    }, [startSpinning, reelIndex, symbols]);

    return (
        <div className="h-48 w-32 bg-background/50 rounded-lg overflow-hidden relative border-2 border-primary/50 shadow-inner">
             <div 
                className={cn(
                    "flex flex-col items-center justify-start transition-transform duration-100 ease-linear",
                     isSpinning ? 'animate-none' : 'transform-none'
                )}
                style={{ transform: isSpinning ? `translateY(-${(localSymbols.length - 1) * 12}rem)`: 'translateY(0)'}}
             >
                {[...localSymbols, ...localSymbols].map((symbol, index) => (
                    <div key={index} className="h-48 w-full flex items-center justify-center shrink-0">
                        {symbol.icon}
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-48 border-y-4 border-primary/70 pointer-events-none" />
        </div>
    );
};


export default function SlotMachine() {
    const [reels, setReels] = useState< {icon: React.ReactNode, value: string}[][]>([]);
    const [spinning, setSpinning] = useState(false);
    const { credits, setCredits } = useCredits();
    const [lastWin, setLastWin] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
      // Initialize reels with random symbol order
      setReels([
        [...symbols].sort(() => Math.random() - 0.5),
        [...symbols].sort(() => Math.random() - 0.5),
        [...symbols].sort(() => Math.random() - 0.5),
      ]);
    }, []);

    const checkWin = (finalReels: {icon: React.ReactNode, value: string}[][]) => {
      const line = [finalReels[0][0], finalReels[1][0], finalReels[2][0]];
      const isWin = line.every(symbol => symbol.value === line[0].value);
      
      if (isWin) {
        let winAmount = 0;
        switch(line[0].value) {
            case 'cherry': winAmount = 10; break;
            case 'bell': winAmount = 20; break;
            case 'clover': winAmount = 50; break;
            case 'diamond': winAmount = 100; break;
            case 'star': winAmount = 200; break;
            case 'seven': winAmount = 500; break;
        }
        setCredits(prev => prev + winAmount);
        setLastWin(winAmount);
        toast({
            title: "You Won!",
            description: `You won ${winAmount} credits!`,
            variant: "default",
        });
      } else {
        setLastWin(0);
      }
    };

    const handleSpin = () => {
        if (credits < 10) {
            toast({
                title: "Insufficient Funds",
                description: "You need at least 10 credits to spin.",
                variant: "destructive",
            });
            return;
        }
        setCredits(prev => prev - 10);
        setSpinning(true);
        setLastWin(null);

        // This triggers the spin on each reel
        const newReels = [
            [...symbols].sort(() => Math.random() - 0.5),
            [...symbols].sort(() => Math.random() - 0.5),
            [...symbols].sort(() => Math.random() - 0.5),
        ];
        setReels(newReels);

        setTimeout(() => {
            setSpinning(false);
            checkWin(newReels);
        }, 1000 + 2 * 300 + 100); // Should be slightly longer than the longest reel spin
    };


    return (
        <Card className="w-full max-w-3xl bg-card/80 border-2 border-primary/50 shadow-2xl shadow-primary/20">
            <CardContent className="p-6 md:p-10">
                <div className="flex justify-center items-center gap-4 md:gap-8 mb-8">
                    {reels.map((reelSymbols, i) => (
                        <Reel key={i} symbols={reelSymbols} startSpinning={spinning} reelIndex={i} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                    <div className="bg-background/50 p-4 rounded-lg border border-primary/30">
                        <p className="text-sm font-body text-muted-foreground">Balance</p>
                        <p className="text-2xl font-headline text-primary font-bold">{credits.toLocaleString()}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-primary/30 col-span-1 md:col-span-1">
                        <p className="text-sm font-body text-muted-foreground">Last Win</p>
                        <p className={cn("text-2xl font-headline font-bold", lastWin && lastWin > 0 ? "text-green-400" : "text-primary")}>
                            {lastWin !== null ? lastWin : '-'}
                        </p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-primary/30">
                        <p className="text-sm font-body text-muted-foreground">Cost</p>
                        <p className="text-2xl font-headline text-primary font-bold">10</p>
                    </div>
                </div>

                <Button 
                    onClick={handleSpin} 
                    disabled={spinning}
                    className="w-full h-16 text-2xl font-headline tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                >
                    {spinning ? 'SPINNING...' : 'SPIN'}
                </Button>
            </CardContent>
        </Card>
    );
}
