
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
    'One Pair': { value: 2, payout: 1 },
    'High Card': { value: 1, payout: 0 },
};

type HandRank = keyof typeof handRankConfig;

interface HandResult {
    rank: HandRank;
    value: number;
    hand: CardType[];
    tieBreakerRanks: number[];
}

export default function PokerCard() {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<boolean[]>(new Array(5).fill(false));
    const [gameState, setGameState] = useState<'betting' | 'draw' | 'showdown'>('betting');
    const [playerHandResult, setPlayerHandResult] = useState<HandResult | null>(null);
    const [dealerHandResult, setDealerHandResult] = useState<HandResult | null>(null);
    const [winner, setWinner] = useState<'Player' | 'Dealer' | 'Push' | null>(null);
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
        const rankToValue = (rank: Rank) => ranks.indexOf(rank);
        const handValues = hand.map(c => rankToValue(c.rank)).sort((a, b) => b - a);

        const rankCounts: { [key: number]: number } = {};
        handValues.forEach(value => {
            rankCounts[value] = (rankCounts[value] || 0) + 1;
        });
        
        const counts = Object.values(rankCounts);
        const pairs = Object.keys(rankCounts).filter(rank => rankCounts[parseInt(rank)] === 2).map(Number).sort((a,b) => b-a);
        const threes = Object.keys(rankCounts).filter(rank => rankCounts[parseInt(rank)] === 3).map(Number);
        const fours = Object.keys(rankCounts).filter(rank => rankCounts[parseInt(rank)] === 4).map(Number);
        const kickers = (ranksToExclude: number[]) => handValues.filter(v => !ranksToExclude.includes(v));

        const isFlush = hand.every(card => card.suit === hand[0].suit);
        const isStraight = (() => {
            const uniqueRanks = [...new Set(handValues)].sort((a,b) => a-b);
            if(uniqueRanks.length < 5) return false;
            // Ace-low straight
            const isAceLow = uniqueRanks.join() === "0,1,2,3,12";
            if (isAceLow) return true;
            for (let i = 0; i < 4; i++) {
                if (uniqueRanks[i+1] - uniqueRanks[i] !== 1) return false;
            }
            return true;
        })();
        
        const getStraightHighCard = () => (handValues.includes(12) && handValues.includes(3)) ? 3 : handValues[0];

        if (isStraight && isFlush) {
            const isRoyal = handValues[0] === rankToValue('A') && handValues[4] === rankToValue('10');
            return { rank: isRoyal ? 'Royal Flush' : 'Straight Flush', value: handRankConfig[isRoyal ? 'Royal Flush' : 'Straight Flush'].value, hand, tieBreakerRanks: [getStraightHighCard()] };
        }
        if (fours.length > 0) return { rank: 'Four of a Kind', value: handRankConfig['Four of a Kind'].value, hand, tieBreakerRanks: [fours[0], ...kickers(fours)] };
        if (threes.length > 0 && pairs.length > 0) return { rank: 'Full House', value: handRankConfig['Full House'].value, hand, tieBreakerRanks: [threes[0], pairs[0]] };
        if (isFlush) return { rank: 'Flush', value: handRankConfig['Flush'].value, hand, tieBreakerRanks: handValues };
        if (isStraight) return { rank: 'Straight', value: handRankConfig['Straight'].value, hand, tieBreakerRanks: [getStraightHighCard()] };
        if (threes.length > 0) return { rank: 'Three of a Kind', value: handRankConfig['Three of a Kind'].value, hand, tieBreakerRanks: [threes[0], ...kickers(threes)] };
        if (pairs.length === 2) return { rank: 'Two Pair', value: handRankConfig['Two Pair'].value, hand, tieBreakerRanks: [pairs[0], pairs[1], ...kickers(pairs)] };
        if (pairs.length === 1) return { rank: 'One Pair', value: handRankConfig['One Pair'].value, hand, tieBreakerRanks: [pairs[0], ...kickers(pairs)] };

        return { rank: 'High Card', value: handRankConfig['High Card'].value, hand, tieBreakerRanks: handValues };
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
        setDealerHandResult(null);

        let freshDeck = shuffleDeck(createDeck());
        const playerInitialHand = [];
        const dealerInitialHand = [];
        for(let i=0; i<5; i++){
            playerInitialHand.push(freshDeck.pop()!);
            dealerInitialHand.push(freshDeck.pop()!);
        }

        setPlayerHand(playerInitialHand);
        setDealerHand(dealerInitialHand);
        setDeck(freshDeck);
    };

    const startNewGame = useCallback(() => {
        setGameState('betting');
        setWinner(null);
        setSelectedCards(new Array(5).fill(false));
        setPlayerHandResult(null);
        setDealerHandResult(null);
        setPlayerHand([]);
        setDealerHand([]);
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
        
        // Player draws
        const newPlayerHand = [...playerHand];
        for(let i=0; i<5; i++) {
            if (!selectedCards[i]) { // Player HOLDS selected cards, discards unselected
                if(currentDeck.length > 0) {
                    newPlayerHand[i] = currentDeck.pop()!;
                }
            }
        }
        setPlayerHand(newPlayerHand);

        // Dealer's turn (simple AI: draw on anything less than a pair)
        const newDealerHand = [...dealerHand];
        const dealerInitialResult = getHandResult(newDealerHand);
        if (dealerInitialResult.value < handRankConfig['One Pair'].value) {
            // Draw 3 cards
            for(let i=0; i<3; i++) {
                if(currentDeck.length > 0) {
                     newDealerHand[i] = currentDeck.pop()!;
                }
            }
        }
        setDealerHand(newDealerHand);
        setDeck(currentDeck);
        setGameState('showdown');
    };
    
    useEffect(() => {
        if (gameState === 'showdown') {
            const pResult = getHandResult(playerHand);
            const dResult = getHandResult(dealerHand);
            setPlayerHandResult(pResult);
            setDealerHandResult(dResult);
            
            let finalWinner: 'Player' | 'Dealer' | 'Push' = 'Dealer';
            if (pResult.value > dResult.value) {
                finalWinner = 'Player';
            } else if (pResult.value < dResult.value) {
                finalWinner = 'Dealer';
            } else {
                // Tie-breaker logic
                let tieBroken = false;
                for (let i = 0; i < pResult.tieBreakerRanks.length; i++) {
                    if (pResult.tieBreakerRanks[i] > dResult.tieBreakerRanks[i]) {
                        finalWinner = 'Player';
                        tieBroken = true;
                        break;
                    }
                    if (pResult.tieBreakerRanks[i] < dResult.tieBreakerRanks[i]) {
                        finalWinner = 'Dealer';
                        tieBroken = true;
                        break;
                    }
                }
                if (!tieBroken) {
                    finalWinner = 'Push';
                }
            }
            setWinner(finalWinner);
            
            let winAmount = 0;
            let toastTitle = '';
            let toastDescription = '';
            let toastVariant: "default" | "destructive" = "default";
            
            if (finalWinner === 'Player') {
                winAmount = betAmount * 2;
                toastTitle = `You Win with a ${pResult.rank}!`;
                toastDescription = `You won ${winAmount.toLocaleString()} credits.`;
            } else if (finalWinner === 'Dealer') {
                toastTitle = `Dealer Wins with a ${dResult.rank}!`;
                toastDescription = `You lost ${betAmount.toLocaleString()} credits.`;
                toastVariant = 'destructive';
            } else { // Push
                winAmount = betAmount;
                toastTitle = "It's a Push!";
                toastDescription = `Both have a ${pResult.rank}. Your bet is returned.`;
            }

            setCredits(c => c + winAmount);
            toast({
                title: toastTitle,
                description: toastDescription,
                variant: toastVariant
            });
        }
    }, [gameState, playerHand, dealerHand, betAmount, setCredits, toast]);

    const cardsToHoldCount = selectedCards.filter(s => s).length;

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Versus Poker</CardTitle>
                <CardDescription className="font-body">Play against the dealer. Get a better hand to win.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex flex-col items-center">
                <div className="space-y-4 w-full">
                    <h3 className="text-2xl font-headline flex items-center justify-center gap-2">
                        <Bot /> Dealer's Hand
                        {dealerHandResult && <span className="text-lg text-primary font-body">({dealerHandResult.rank})</span>}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 h-44 items-center">
                        {dealerHand.length === 0 && Array(5).fill(0).map((_, i) => <div key={i} className="w-24 h-36 bg-muted rounded-lg" />)}
                        {dealerHand.map((card, index) => (
                            <PlayingCard 
                                key={index} 
                                card={card} 
                                hidden={gameState !== 'showdown'}
                            />
                        ))}
                    </div>
                </div>

                 <div className="space-y-4 w-full">
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
                     {gameState === 'draw' && (
                        <p className="text-center text-sm text-muted-foreground">Select cards to HOLD, then draw.</p>
                    )}
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
                           Draw (Hold {cardsToHoldCount})
                        </Button>
                    </div>
                )}
                 {gameState === 'showdown' && (
                    <div className="text-center p-4 rounded-lg bg-background/50 w-full">
                        <h3 className="text-3xl font-bold font-headline mb-2">
                           {winner === 'Player' && <span className="text-green-400">You Win!</span>}
                           {winner === 'Dealer' && <span className="text-red-500">Dealer Wins!</span>}
                           {winner === 'Push' && <span className="text-yellow-400">It's a Push!</span>}
                        </h3>
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
