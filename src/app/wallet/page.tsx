
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCredits } from "@/context/credits-context";
import { Banknote, History, Landmark } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
    const { credits, setCredits } = useCredits();
    const [amount, setAmount] = useState(100);
    const { toast } = useToast();
    
    const handleAddFunds = () => {
        setCredits(c => c + amount);
        toast({
            title: "Funds Added",
            description: `${amount.toLocaleString()} credits have been added to your balance.`,
        });
    }

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                {/* Balance Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl sm:text-3xl">Your Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl sm:text-5xl font-bold font-headline text-primary">{credits.toLocaleString()}</p>
                        <p className="text-muted-foreground">Available Credits</p>
                    </CardContent>
                </Card>

                {/* Add Funds Card */}
                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
                           <Banknote/> Add Funds
                        </CardTitle>
                        <CardDescription>Top up your balance to keep playing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                            />
                        </div>
                        <Button onClick={handleAddFunds} className="w-full font-headline">
                            Add {amount.toLocaleString()} Credits
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History Card */}
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
                           <History/> History
                        </CardTitle>
                         <CardDescription>Your recent transactions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                       <div className="flex justify-between items-center">
                           <div>
                               <p className="font-semibold">Won Blackjack</p>
                               <p className="text-muted-foreground text-xs">Today</p>
                           </div>
                           <p className="text-green-400 font-bold">+ 200</p>
                       </div>
                        <div className="flex justify-between items-center">
                           <div>
                               <p className="font-semibold">Slot Machine Bet</p>
                               <p className="text-muted-foreground text-xs">Today</p>
                           </div>
                           <p className="text-red-500 font-bold">- 50</p>
                       </div>
                       <div className="flex justify-between items-center">
                           <div>
                               <p className="font-semibold">Added Funds</p>
                               <p className="text-muted-foreground text-xs">Yesterday</p>
                           </div>
                           <p className="text-green-400 font-bold">+ 1,000</p>
                       </div>
                        <div className="flex justify-between items-center">
                           <div>
                               <p className="font-semibold">Poker Loss</p>
                               <p className="text-muted-foreground text-xs">Yesterday</p>
                           </div>
                           <p className="text-red-500 font-bold">- 100</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
