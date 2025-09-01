
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCredits } from "@/context/credits-context";
import { Banknote, History, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import HistoryItem, { type HistoryEntry } from "@/components/shared/history-item";

export default function WalletPage() {
    const { user } = useAuth();
    const { credits, accountId, balanceId, loading: creditsLoading, setCredits } = useCredits();
    const [amount, setAmount] = useState(100);
    const [trxId, setTrxId] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setHistoryLoading(true);

            try {
                const [transactionRes, gameHistoryRes] = await Promise.all([
                    api('/find/transaction', { method: 'POST', body: JSON.stringify({ userId: user.id }) }),
                    api('/find/game-history', { method: 'POST', body: JSON.stringify({ userId: user.id }) })
                ]);
                
                const transactionData = await transactionRes.json();
                const gameHistoryData = await gameHistoryRes.json();

                const combinedHistory: HistoryEntry[] = [];

                if (transactionRes.ok && transactionData.balancetransaction) {
                    combinedHistory.push(...(Array.isArray(transactionData.balancetransaction) ? transactionData.balancetransaction : [transactionData.balancetransaction]));
                }

                if (gameHistoryRes.ok && gameHistoryData.gamehistory) {
                     combinedHistory.push(...(Array.isArray(gameHistoryData.gamehistory) ? gameHistoryData.gamehistory : [gameHistoryData.gamehistory]));
                }

                combinedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setHistory(combinedHistory);

            } catch (error) {
                toast({
                    title: "Error fetching history",
                    description: "Could not load transaction or game history.",
                    variant: "destructive"
                });
            } finally {
                setHistoryLoading(false);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user, toast]);
    
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
                         <CardDescription>Your recent transactions and game results.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm max-h-96 overflow-y-auto pr-2">
                      {historyLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                      ) : history.length > 0 ? (
                        history.map((item) => <HistoryItem key={item.id} item={item} />)
                      ) : (
                        <p className="text-muted-foreground text-center">No history found.</p>
                      )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
