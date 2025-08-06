
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dices, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/context/credits-context";

const diceIcons = [
    <Dice1 key="1" className="w-12 h-12" />,
    <Dice2 key="2" className="w-12 h-12" />,
    <Dice3 key="3" className="w-12 h-12" />,
    <Dice4 key="4" className="w-12 h-12" />,
    <Dice5 key="5" className="w-12 h-12" />,
    <Dice6 key="6" className="w-12 h-12" />,
];

export default function DiceRollerCard() {
    const [numDice, setNumDice] = useState(3);
    const numSides = 6;
    const [results, setResults] = useState<number[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [winStatus, setWinStatus] = useState<'win' | 'loss' | null>(null);
    const [betType, setBetType] = useState<'high' | 'low' | 'eleven' | null>(null);
    const [betAmount, setBetAmount] = useState(10);
    const { credits, setCredits } = useCredits();
    const { toast } = useToast();

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

        setCredits(c => c - betAmount);
        
        const newResults = [];
        let newTotal = 0;
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            newResults.push(roll);
            newTotal += roll;
        }
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
            payoutMultiplier = 5; // Higher payout for specific number
        }
        
        if(win) {
            const winnings = betAmount * payoutMultiplier;
            setCredits(c => c + winnings);
            setWinStatus('win');
            toast({
                title: "You Win!",
                description: `You won ${winnings} credits!`,
            });
        } else {
            setWinStatus('loss');
            toast({
                title: "You Lose!",
                description: `You lost ${betAmount} credits.`,
                variant: "destructive",
            });
        }
    };

    const getDieIcon = (result: number) => {
        if (result >= 1 && result <= 6) {
            return diceIcons[result - 1];
        }
        return <Dice5 className="w-12 h-12" />; // Fallback
    }

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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="num-dice">Number of Dice</Label>
                        <Input 
                            id="num-dice" 
                            type="number" 
                            value={numDice} 
                            onChange={(e) => setNumDice(Math.max(3, parseInt(e.target.value)))}
                            min="3"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bet-amount">Bet Amount</Label>
                        <Input 
                            id="bet-amount" 
                            type="number" 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            min="1"
                        />
                    </div>
                </div>

                <RadioGroup onValueChange={(value) => setBetType(value as 'high' | 'low' | 'eleven')} className="flex justify-center gap-4">
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

                <Button onClick={handleRoll} className="w-full text-lg font-headline bg-accent hover:bg-accent/90">
                    Roll Dice
                </Button>
                
                {results.length > 0 && (
                    <div className="pt-4 border-t">
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
                        <h3 className="text-center font-headline text-2xl mb-4">Results</h3>
                        <div className="flex flex-wrap gap-4 justify-center mb-4">
                            {results.map((result, index) => (
                                <div key={index} className="flex items-center justify-center flex-col text-primary">
                                    {getDieIcon(result)}
                                    <span className="text-2xl font-bold">{result}</span>
                                </div>
                            ))}
                        </div>
                        {total !== null && (
                            <div className="text-center bg-background/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-4xl font-bold font-headline text-primary">{total}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
