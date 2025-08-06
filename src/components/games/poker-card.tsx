
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Spade, Heart, Diamond, Club, Repeat, User, Bot } from "lucide-react";
import { useCredits } from "@/context/credits-context";

type Suit = 'Spades' | 'Hearts' | 'Diamonds' | 'Clubs';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface CardType {
    suit: Suit;
    rank: Rank;
}

const suits: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const PlayingCard = ({ card, isSelected, onClick, hidden }: { card: CardType, isSelected?: boolean, onClick?: () => void, hidden?: boolean }) => {
    const suitIcons = {
        Spades: <Spade className="h-5 w-5 fill-current" />,
        Hearts: <Heart className="h-5 w-5 fill-current text-red-500" />,
        Diamonds: <Diamond className="h-5 w-5 fill-current text-red-500" />,
        Clubs: <Club className="h-5 w-5 fill-current" />,
    };

    if (hidden) {
        return (
             <div className="w-24 h-36 bg-blue-700 rounded-lg border-2 border-blue-900 flex items-center justify-center">
                <div className="w-20 h-32 bg-blue-500 rounded-md" />
            </div>
        )
    }
    
    return (
        <Card 
            className={`w-24 h-36 p-2 flex flex-col justify-between items-center bg-white text-black shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${isSelected ? 'transform -translate-y-2 ring-4 ring-primary' : (onClick ? 'hover:-translate-y-1' : '')}`}
            onClick={onClick}
        >
            <div className="self-start">
                <p className="font-bold text-xl">{card.rank}</p>
                {suitIcons[card.suit]}
            </div>
            <div className="transform rotate-180 self-end">
                <p className="font-bold text-xl">{card.rank}</p>
                {suitIcons[card.suit]}
            </div>
        </Card>
    );
};

const handRankConfig = {
    'Royal Flush': { value: 10, payout: 250 },
    'Straight Flush': { value: 9, payout: 50 },
    'Four of a Kind': { value: 8, payout: 25 },
    'Full House': { value: 7, payout: 9 },
    'Flush': { value: 6, payout: 6 },
    'Straight': { value: 5, payout: 4 },
    'Three of a Kind': { value: 4, payout: 3 },
    'Two Pair': { value: 3, payout: 2 },
    'One Pair': { value: 2, payout: 1 }, // Jacks or Better
    'High Card': { value: 1, payout: 0 },
};

type HandRank = keyof typeof handRankConfig;

interface HandResult {
    rank: HandRank;
    value: number;
    hand: CardType[];
}

export default function PokerCard() {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<boolean[]>(new Array(5).fill(false));
    const [gameState, setGameState] = useState<'betting' | 'draw' | 'showdown'>('betting');
    const [playerHandResult, setPlayerHandResult] = useState<HandResult | null>(null);
    const [winner, setWinner] = useState<'Player' | 'Dealer' | null>(null);
    const [betAmount, setBetAmount] = useState(10);
    const { credits, setCredits } = useCredits();
    const { toast } = useToast();

    const createDeck = () => suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));

    const shuffleDeck = (deck: CardType[]) => {
        let shuffledDeck = [...deck];
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }
        return shuffledDeck;
    };

    const getHandResult = (hand: CardType[]): HandResult => {
        const rankCounts: { [key in Rank]?: number } = {};
        const suitCounts: { [key in Suit]?: number } = {};
        
        hand.forEach(card => {
            rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
        });

        const sortedRanks = hand.map(c => ranks.indexOf(c.rank)).sort((a,b) => a - b);
        const isFlush = Object.values(suitCounts).some(count => count === 5);
        
        const isStraight = (() => {
            const uniqueRanks = [...new Set(sortedRanks)];
            if(uniqueRanks.length < 5) return false;
            const isAceLow = JSON.stringify(uniqueRanks) === JSON.stringify([0, 9, 10, 11, 12]); // A, 10, J, Q, K -> A,2,3,4,5
            if(isAceLow) {
                 // Re-order for ace-low straight check
                 sortedRanks[sortedRanks.indexOf(12)] = -1;
                 sortedRanks.sort((a,b) => a-b);
            }
            for (let i = 0; i < 4; i++) {
                if(sortedRanks[i+1] - sortedRanks[i] !== 1) return false;
            }
            return true;
        })();
        
        if (isStraight && isFlush) {
            const isRoyal = sortedRanks[0] === 9; // 10, J, Q, K, A
            return { rank: isRoyal ? 'Royal Flush' : 'Straight Flush', value: handRankConfig[isRoyal ? 'Royal Flush' : 'Straight Flush'].value, hand };
        }

        const counts = Object.values(rankCounts);
        const fours = counts.some(c => c === 4);
        const threes = counts.some(c => c === 3);
        const pairs = counts.filter(c => c === 2).length;

        if (fours) return { rank: 'Four of a Kind', value: handRankConfig['Four of a Kind'].value, hand };
        if (threes && pairs === 1) return { rank: 'Full House', value: handRankConfig['Full House'].value, hand };
        if (isFlush) return { rank: 'Flush', value: handRankConfig['Flush'].value, hand };
        if (isStraight) return { rank: 'Straight', value: handRankConfig['Straight'].value, hand };
        if (threes) return { rank: 'Three of a Kind', value: handRankConfig['Three of a Kind'].value, hand };
        if (pairs === 2) return { rank: 'Two Pair', value: handRankConfig['Two Pair'].value, hand };
        if (pairs === 1) {
            const pairRankIndex = ranks.indexOf(Object.keys(rankCounts).find(r => rankCounts[r as Rank] === 2) as Rank);
            // Jacks or better
            if (pairRankIndex >= 9) {
                 return { rank: 'One Pair', value: handRankConfig['One Pair'].value, hand };
            }
        }

        return { rank: 'High Card', value: handRankConfig['High Card'].value, hand };
    };

    const handleDeal = () => {
        if(credits < betAmount) {
            toast({
                title: "Insufficient Credits",
                description: `You need at least ${betAmount} credits to play.`,
                variant: "destructive"
            });
            return;
        }

        setCredits(c => c - betAmount);
        setGameState('draw');
        setWinner(null);
        setSelectedCards(new Array(5).fill(false));
        setPlayerHandResult(null);

        let freshDeck = shuffleDeck(createDeck());
        const playerInitialHand = [];
        for(let i=0; i<5; i++){
            playerInitialHand.push(freshDeck.pop()!);
        }

        setPlayerHand(playerInitialHand);
        setDeck(freshDeck);
    };

    const startNewGame = useCallback(() => {
        setGameState('betting');
        setWinner(null);
        setSelectedCards(new Array(5).fill(false));
        setPlayerHandResult(null);
        setPlayerHand([]);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const toggleCardSelection = (index: number) => {
        if (gameState !== 'draw') return;
        const newSelectedCards = [...selectedCards];
        newSelectedCards[index] = !newSelectedCards[index];
        setSelectedCards(newSelectedCards);
    };

    const handleDraw = () => {
        if (gameState !== 'draw') return;

        let currentDeck = [...deck];
        
        const newPlayerHand = [...playerHand];
        selectedCards.forEach((isSelected, index) => {
            if (isSelected) {
                newPlayerHand[index] = currentDeck.pop()!;
            }
        });
        
        setPlayerHand(newPlayerHand);
        setDeck(currentDeck);
        setGameState('showdown');
    };
    
    useEffect(() => {
        if (gameState === 'showdown') {
            const pResult = getHandResult(playerHand);
            setPlayerHandResult(pResult);
            
            const payout = handRankConfig[pResult.rank].payout;
            if(payout > 0) {
                const winnings = betAmount * payout;
                setCredits(c => c + winnings);
                setWinner('Player');
                toast({
                    title: `You Win with a ${pResult.rank}!`,
                    description: `You won ${winnings.toLocaleString()} credits.`,
                });
            } else {
                setWinner('Dealer');
                toast({
                    title: `You Lose with a ${pResult.rank}.`,
                    description: `You lost ${betAmount.toLocaleString()} credits.`,
                    variant: 'destructive'
                });
            }
        }
    }, [gameState, playerHand, betAmount, setCredits, toast]);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Video Poker</CardTitle>
                <CardDescription className="font-body">Make the best five-card hand to win. Jacks or Better to win.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex flex-col items-center">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-headline flex items-center justify-center gap-2">
                        <User /> Your Hand
                        {playerHandResult && <span className="text-lg text-primary font-body">({playerHandResult.rank})</span>}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 h-44 items-center">
                        {playerHand.length === 0 && Array(5).fill(0).map((_, i) => <div key={i} className="w-24 h-36 bg-muted rounded-lg" />)}
                        {playerHand.map((card, index) => (
                            <PlayingCard 
                                key={index} 
                                card={card} 
                                isSelected={selectedCards[index]}
                                onClick={gameState === 'draw' ? () => toggleCardSelection(index) : undefined}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
                 {gameState === 'betting' && (
                     <div className="flex flex-col items-center space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bet-amount">Bet Amount</Label>
                            <Input 
                                id="bet-amount" 
                                type="number" 
                                value={betAmount} 
                                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                                className="w-48 text-center"
                            />
                        </div>
                        <Button onClick={handleDeal} className="w-48 text-lg font-headline">Deal</Button>
                    </div>
                )}
                {gameState === 'draw' && (
                    <div className="flex space-x-4">
                        <Button onClick={handleDraw} className="w-48 text-lg font-headline">
                           Draw ({selectedCards.filter(s => s).length} Cards)
                        </Button>
                    </div>
                )}
                 {gameState === 'showdown' && (
                    <div className="text-center p-4 rounded-lg bg-background/50 w-full">
                        <h3 className="text-3xl font-bold font-headline mb-2">
                           {winner === 'Player' && <span className="text-green-400">You Win!</span>}
                           {winner === 'Dealer' && <span className="text-red-500">You Lose!</span>}
                        </h3>
                        <p className="text-muted-foreground mb-4">You had a {playerHandResult?.rank}.</p>
                         <Button onClick={startNewGame} variant="secondary" className="gap-2">
                             <Repeat/>
                             Play Again
                         </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
