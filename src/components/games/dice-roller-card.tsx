
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/context/credits-context";


const DieFace = ({ face }: { face: number }) => {
    const dotPatterns: { [key: number]: number[] } = {
        1: [5],
        2: [1, 9],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9],
    };

    const getFaceStyles = (face: number): React.CSSProperties => {
        switch (face) {
            case 1: return { transform: 'rotateY(0deg) translateZ(40px)' };
            case 2: return { transform: 'rotateY(180deg) translateZ(40px)' };
            case 3: return { transform: 'rotateY(-90deg) translateZ(40px)' };
            case 4: return { transform: 'rotateY(90deg) translateZ(40px)' };
            case 5: return { transform: 'rotateX(90deg) translateZ(40px)' };
            case 6: return { transform: 'rotateX(-90deg) translateZ(40px)' };
            default: return {};
        }
    };
    
    const faceStyle: React.CSSProperties = {
        position: 'absolute',
        width: '80px',
        height: '80px',
        background: 'hsl(var(--primary))',
        border: '2px solid hsl(var(--primary-foreground))',
        borderRadius: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        padding: '8px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
        ...getFaceStyles(face)
    };

    const dotStyle: React.CSSProperties = {
        width: '16px',
        height: '16px',
        backgroundColor: 'black',
        borderRadius: '50%',
        alignSelf: 'center',
        justifySelf: 'center',
        boxShadow: 'inset 0 0 3px rgba(0,0,0,0.7)',
    };
    
    return (
         <div style={faceStyle}>
            {dotPatterns[face].map((gridPos, i) => (
                <div key={i} style={{...dotStyle, gridArea: `${Math.ceil(gridPos / 3)} / ${((gridPos - 1) % 3) + 1}`}}></div>
            ))}
        </div>
    );
};


const Die = ({ result, isRolling, index }: { result: number; isRolling: boolean; index: number }) => {
    const [finalResult, setFinalResult] = useState(result);

    useEffect(() => {
        if (isRolling) {
            // Let it roll
        } else {
            setFinalResult(result);
        }
    }, [isRolling, result]);
    
     const getFinalRotation = (result: number) => {
        switch (result) {
            case 1: return 'rotateY(0deg)';
            case 2: return 'rotateY(-180deg)';
            case 3: return 'rotateY(90deg)';
            case 4: return 'rotateY(-90deg)';
            case 5: return 'rotateX(-90deg)';
            case 6: return 'rotateX(90deg)';
            default: return '';
        }
    };

    return (
        <div style={{ perspective: '1500px', perspectiveOrigin: 'center' }}>
            <div
                style={{
                    transformStyle: 'preserve-3d',
                    width: '80px',
                    height: '80px',
                    position: 'relative',
                    transform: isRolling ? `rotateX(1800deg) rotateY(1800deg) rotateZ(1800deg)` : getFinalRotation(finalResult),
                    transition: `transform 2s ease-out`,
                    animationDelay: `${index * 0.1}s`
                }}
            >
                <DieFace face={1} />
                <DieFace face={2} />
                <DieFace face={3} />
                <DieFace face={4} />
                <DieFace face={5} />
                <DieFace face={6} />
            </div>
        </div>
    );
};

export default function DiceRollerCard() {
    const [numDice, setNumDice] = useState(3);
    const [results, setResults] = useState<number[]>([1, 1, 1]);
    const [total, setTotal] = useState<number | null>(null);
    const [winStatus, setWinStatus] = useState<'win' | 'loss' | null>(null);
    const [betType, setBetType] = useState<'high' | 'low' | 'eleven' | null>(null);
    const [betAmount, setBetAmount] = useState(10);
    const { credits, setCredits } = useCredits();
    const { toast } = useToast();
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = () => {
        if (!betType) {
            toast({
                title: "No Bet Placed",
                description: "Please select 'High', 'Low', or 'Exactly 11' before rolling.",
                variant: "destructive",
            });
            return;
        }

        if (credits < betAmount) {
            toast({
                title: "Insufficient Credits",
                description: `You need at least ${betAmount} credits to play.`,
                variant: "destructive",
            });
            return;
        }

        setIsRolling(true);
        setWinStatus(null);
        setTotal(null);
        setCredits(c => c - betAmount);
        
        setTimeout(() => {
            const newResults = Array.from({ length: numDice }, () => Math.floor(Math.random() * 6) + 1);
            const newTotal = newResults.reduce((sum, current) => sum + current, 0);

            setResults(newResults);
            setTotal(newTotal);

            let win = false;
            let payoutMultiplier = 1;
            if (betType === 'high') {
                win = newTotal > 11;
            } else if (betType === 'low') {
                win = newTotal < 11;
            } else if (betType === 'eleven') {
                win = newTotal === 11;
                payoutMultiplier = 5;
            }

            if(win) {
                const winnings = betAmount * payoutMultiplier;
                setCredits(c => c + winnings);
                setWinStatus('win');
                toast({
                    title: "You Win!",
                    description: `You won ${winnings.toLocaleString()} credits!`,
                });
            } else {
                setWinStatus('loss');
                toast({
                    title: "You Lose!",
                    description: `You lost ${betAmount.toLocaleString()} credits.`,
                    variant: "destructive",
                });
            }
            setIsRolling(false);
        }, 2100);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary flex items-center gap-2">
                    <Dices className="w-10 h-10" />
                    Dice Roller
                </CardTitle>
                <CardDescription className="font-body">Bet High, Low, or Exactly 11 and roll the dice!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="num-dice">Number of Dice</Label>
                        <Input 
                            id="num-dice" 
                            type="number" 
                            value={numDice} 
                            onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value)))}
                            min="1"
                            disabled={isRolling}
                        />
                    </div>
                </div>

                <RadioGroup onValueChange={(value) => setBetType(value as 'high' | 'low' | 'eleven')} className="flex justify-center gap-4" disabled={isRolling}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="text-lg">Low (&lt; 11)</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eleven" id="eleven" />
                        <Label htmlFor="eleven" className="text-lg">Exactly 11</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="text-lg">High (&gt; 11)</Label>
                    </div>
                </RadioGroup>

                <div className="space-y-2">
                    <Label htmlFor="bet-amount">Bet Amount</Label>
                    <Input 
                        id="bet-amount" 
                        type="number" 
                        value={betAmount} 
                        onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        min="1"
                        disabled={isRolling}
                    />
                </div>

                <Button onClick={handleRoll} className="w-full text-lg font-headline bg-accent hover:bg-accent/90" disabled={isRolling}>
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                </Button>
                
                <div className="pt-4 border-t">
                    <div className="flex flex-wrap gap-4 justify-center items-center min-h-[120px]">
                        {results.map((result, index) => (
                           <Die key={index} result={result} isRolling={isRolling} index={index} />
                        ))}
                    </div>

                    {!isRolling && total !== null && (
                         <div className="text-center mt-4">
                             {winStatus && (
                                 <div className="text-center p-4 rounded-lg bg-background/50 w-full mb-4">
                                    <h3 className={cn(
                                        "text-3xl font-bold font-headline",
                                        winStatus === 'win' ? 'text-green-400' : 'text-red-500'
                                    )}>
                                       {winStatus === 'win' ? 'You Win!' : 'You Lose!'}
                                    </h3>
                                </div>
                            )}
                            <div className="text-center bg-background/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-4xl font-bold font-headline text-primary">{total}</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
