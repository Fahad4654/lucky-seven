
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Star, Diamond, Bell, Cherry, Award, Clover } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useCredits } from '@/context/credits-context';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const symbols = [
  { icon: <Cherry className="h-16 w-16 text-red-500" />, value: 'cherry', multiplier: 5 },
  { icon: <Bell className="h-16 w-16 text-yellow-400" />, value: 'bell', multiplier: 10 },
  { icon: <Clover className="h-16 w-16 text-green-500" />, value: 'clover', multiplier: 20 },
  { icon: <Diamond className="h-16 w-16 text-blue-500" />, value: 'diamond', multiplier: 50 },
  { icon: <Star className="h-16 w-16 text-yellow-300" />, value: 'star', multiplier: 100 },
  { icon: <Award className="h-16 w-16 text-primary" />, value: 'seven', multiplier: 250 },
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
    const [reels, setReels] = useState< {icon: React.ReactNode, value: string, multiplier: number}[][]>([]);
    const [spinning, setSpinning] = useState(false);
    const { credits, setCredits } = useCredits();
    const [betAmount, setBetAmount] = useState(10);
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

    const checkWin = (finalReels: {icon: React.ReactNode, value: string, multiplier: number}[][]) => {
      const line = [finalReels[0][0], finalReels[1][0], finalReels[2][0]];
      const isWin = line.every(symbol => symbol.value === line[0].value);
      
      if (isWin) {
        let winAmount = betAmount * line[0].multiplier;
        setCredits(prev => prev + winAmount);
        setLastWin(winAmount);
        toast({
            title: "You Won!",
            description: `You won ${winAmount.toLocaleString()} credits!`,
            variant: "default",
        });
      } else {
        setLastWin(0);
        toast({
            title: "You Lose!",
            description: `You lost ${betAmount.toLocaleString()} credits.`,
            variant: "destructive",
        });
      }
    };

    const handleSpin = () => {
        if (credits < betAmount) {
            toast({
                title: "Insufficient Funds",
                description: "You need at least 10 credits to spin.",
                variant: "destructive",
            });
            return;
        }
        setCredits(prev => prev - betAmount);
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
                    <div className="bg-background/50 p-4 rounded-lg border border-primary/30">
                        <p className="text-sm font-body text-muted-foreground">Balance</p>
                        <p className="text-2xl font-headline text-primary font-bold">{credits.toLocaleString()}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border border-primary/30">
                        <p className="text-sm font-body text-muted-foreground">Last Win</p>
                        <p className={cn("text-2xl font-headline font-bold", lastWin && lastWin > 0 ? "text-green-400" : "text-primary")}>
                            {lastWin !== null ? lastWin.toLocaleString() : '-'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                     <div className="space-y-2">
                        <Label htmlFor="bet-amount" className="text-center block">Bet Amount</Label>
                        <Input 
                            id="bet-amount" 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            min="1"
                            className="max-w-xs mx-auto text-center text-lg"
                        />
                    </div>
                </div>

                <Button 
                    onClick={handleSpin} 
                    disabled={spinning}
                    className="w-full h-16 text-2xl font-headline tracking-widest bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                >
                    {spinning ? 'SPINNING...' : `SPIN FOR ${betAmount.toLocaleString()}`}
                </Button>
            </CardContent>
        </Card>
    );
}
