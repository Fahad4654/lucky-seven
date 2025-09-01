
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCredits } from "@/context/credits-context";
import { Banknote, History, Landmark, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";

export default function WalletPage() {
    const { user } = useAuth();
    const { credits, accountId, balanceId, loading: creditsLoading } = useCredits();
    const [amount, setAmount] = useState(100);
    const [trxId, setTrxId] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    const handleAddFunds = async () => {
        if (!user || !accountId || !balanceId) {
            toast({
                title: "Error",
                description: "User, account, or balance information is missing.",
                variant: "destructive",
            });
            return;
        }

        if (!trxId) {
             toast({
                title: "Transaction ID Required",
                description: "Please enter the transaction ID.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await api('/transaction', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    accountId: accountId,
                    balanceId: balanceId,
                    type: "deposit",
                    direction: "credit",
                    amount: amount.toString(),
                    currency: "BDT",
                    description: "Deposit request from website",
                    trxId: trxId,
                    status: "pending"
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create transaction.');
            }

            toast({
                title: "Request Submitted",
                description: `Your request to add ${amount.toLocaleString()} credits is pending approval.`,
            });
            setAmount(100);
            setTrxId("");

        } catch (error: any) {
             toast({
                title: "Failed to Submit Request",
                description: error.message || 'An unknown error occurred.',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
                        <p className="text-4xl sm:text-5xl font-bold font-headline text-primary">
                             {creditsLoading ? <Loader2 className="h-10 w-10 animate-spin"/> : credits.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Available Credits</p>
                    </CardContent>
                </Card>

                {/* Add Funds Card */}
                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-2">
                           <Banknote/> Add Funds
                        </CardTitle>
                        <CardDescription>Request a top-up. Your balance will be updated after admin approval.</CardDescription>
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
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trxId">Transaction ID</Label>
                            <Input 
                                id="trxId" 
                                type="text" 
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                                placeholder="Enter your transaction ID"
                                disabled={loading}
                            />
                        </div>
                        <Button onClick={handleAddFunds} className="w-full font-headline" disabled={loading || creditsLoading}>
                           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {loading ? "Submitting..." : `Request ${amount.toLocaleString()} Credits`}
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
