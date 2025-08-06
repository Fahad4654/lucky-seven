"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dice5, Dices } from "lucide-react";

export default function DiceRollerCard() {
    const [numDice, setNumDice] = useState(2);
    const [numSides, setNumSides] = useState(6);
    const [results, setResults] = useState<number[]>([]);
    const [total, setTotal] = useState<number | null>(null);

    const handleRoll = () => {
        const newResults = [];
        let newTotal = 0;
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            newResults.push(roll);
            newTotal += roll;
        }
        setResults(newResults);
        setTotal(newTotal);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary flex items-center gap-2">
                    <Dices className="w-10 h-10" />
                    Dice Roller
                </CardTitle>
                <CardDescription className="font-body">Roll the dice and test your luck.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="num-dice">Number of Dice</Label>
                        <Input 
                            id="num-dice" 
                            type="number" 
                            value={numDice} 
                            onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value)))}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="num-sides">Number of Sides</Label>
                        <Input 
                            id="num-sides" 
                            type="number" 
                            value={numSides} 
                            onChange={(e) => setNumSides(Math.max(2, parseInt(e.target.value)))}
                            min="2"
                        />
                    </div>
                </div>

                <Button onClick={handleRoll} className="w-full text-lg font-headline bg-accent hover:bg-accent/90">
                    Roll Dice
                </Button>
                
                {results.length > 0 && (
                    <div className="pt-4 border-t">
                        <h3 className="text-center font-headline text-2xl mb-4">Results</h3>
                        <div className="flex flex-wrap gap-4 justify-center mb-4">
                            {results.map((result, index) => (
                                <div key={index} className="flex items-center justify-center flex-col text-primary">
                                    <Dice5 className="w-12 h-12" />
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
