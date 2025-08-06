
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

const PlayingCard = ({ card, hidden }: { card: CardType, hidden?: boolean }) => {
    const suitIcons = {
        Spades: <Spade className="h-4 w-4 md:h-5 md:w-5 fill-current" />,
        Hearts: <Heart className="h-4 w-4 md:h-5 md:w-5 fill-current text-red-500" />,
        Diamonds: <Diamond className="h-4 w-4 md:h-5 md:w-5 fill-current text-red-500" />,
        Clubs: <Club className="h-4 w-4 md:h-5 md:w-5 fill-current" />,
    };

    if (hidden) {
        return (
            <div className="w-16 h-24 md:w-24 md:h-36 bg-blue-700 rounded-lg border-2 border-blue-900 flex items-center justify-center">
                <div className="w-14 h-20 md:w-20 md:h-32 bg-blue-500 rounded-md" />
            </div>
        );
    }
    
    return (
        <Card className="w-16 h-24 md:w-24 md:h-36 p-1 md:p-2 flex flex-col justify-between items-center bg-white text-black shadow-lg">
            <div className="self-start">
                <p className="font-bold text-lg md:text-xl">{card.rank}</p>
                {suitIcons[card.suit]}
            </div>
            <div className="transform rotate-180 self-end">
                <p className="font-bold text-lg md:text-xl">{card.rank}</p>
                {suitIcons[card.suit]}
            </div>
        </Card>
    );
};

export default function BlackjackCard() {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameState, setGameState] = useState<'betting' | 'playerTurn' | 'dealerTurn' | 'gameOver'>('betting');
    const [winner, setWinner] = useState<'Player' | 'Dealer' | 'Push' | null>(null);
    const [betAmount, setBetAmount] = useState(10);
    const { credits, setCredits } = useCredits();
    const { toast } = useToast();

    const createDeck = () => {
        const newDeck = suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
        return newDeck;
    };
    
    const shuffleDeck = (deck: CardType[]) => {
        let shuffledDeck = [...deck];
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }
        return shuffledDeck;
    };

    const getCardValue = (card: CardType, currentScore: number) => {
        if (ranks.indexOf(card.rank) >= 9 && ranks.indexOf(card.rank) <= 11) return 10; // J, Q, K
        if (card.rank === 'A') return currentScore + 11 > 21 ? 1 : 11;
        return parseInt(card.rank);
    };

    const calculateScore = (hand: CardType[]) => {
        let score = 0;
        let aces = 0;
        hand.forEach(card => {
            if (card.rank === 'A') {
                aces++;
            }
            score += getCardValue(card, score);
        });
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
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
        setGameState('playerTurn');
        setWinner(null);
        let freshDeck = shuffleDeck(createDeck());
        
        const playerInitialHand = [freshDeck.pop()!, freshDeck.pop()!];
        const dealerInitialHand = [freshDeck.pop()!, freshDeck.pop()!];
        
        setPlayerHand(playerInitialHand);
        setDealerHand(dealerInitialHand);
        
        setPlayerScore(calculateScore(playerInitialHand));
        setDealerScore(calculateScore(dealerInitialHand));

        setDeck(freshDeck);
    };

    const startNewGame = useCallback(() => {
        setGameState('betting');
        setWinner(null);
        setPlayerHand([]);
        setDealerHand([]);
    }, []);

    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    useEffect(() => {
        if (gameState !== 'playerTurn') return;
        if (playerScore > 21) {
            setWinner('Dealer');
            setGameState('gameOver');
        } else if (playerScore === 21 && playerHand.length === 2) {
            // Blackjack
            setWinner('Player');
            setGameState('gameOver');
        }
    }, [playerScore, playerHand.length, gameState]);

    const playerHit = () => {
        if (gameState !== 'playerTurn' || !deck.length) return;
        const newCard = deck.pop()!;
        const newHand = [...playerHand, newCard];
        setPlayerHand(newHand);
        setPlayerScore(calculateScore(newHand));
        setDeck(deck);
    };

    const playerStand = useCallback(() => {
        setGameState('dealerTurn');
    }, []);

    useEffect(() => {
        if (gameState === 'dealerTurn') {
            let currentDealerHand = [...dealerHand];
            let currentDeck = [...deck];
            let score = calculateScore(currentDealerHand);

            while(score < 17 && currentDeck.length > 0) {
                const newCard = currentDeck.pop()!;
                currentDealerHand.push(newCard);
                score = calculateScore(currentDealerHand);
            }

            setDealerHand(currentDealerHand);
            setDealerScore(score);
            setDeck(currentDeck);
            
            // Determine winner
            if (score > 21 || playerScore > score) {
                setWinner('Player');
            } else if (playerScore < score) {
                setWinner('Dealer');
            } else {
                setWinner('Push');
            }
            setGameState('gameOver');
        }
    }, [gameState, dealerHand, deck, playerScore]);
    
    useEffect(() => {
        if (winner) {
            let winAmount = 0;
            let title = '';
            let description = '';

            if (winner === 'Player') {
                winAmount = playerScore === 21 && playerHand.length === 2 ? betAmount * 2.5 : betAmount * 2;
                title = 'You Win!';
                description = `You won ${winAmount.toLocaleString()} credits!`;
            } else if (winner === 'Dealer') {
                winAmount = 0; // Loss is already handled
                title = 'Dealer Wins!';
                description = `You lost ${betAmount.toLocaleString()} credits.`;
            } else { // Push
                winAmount = betAmount;
                title = "It's a Push!";
                description = "Your bet has been returned.";
            }

            setCredits(c => c + winAmount);
            toast({ title, description });
        }
    }, [winner, toast, betAmount, setCredits, playerScore, playerHand.length]);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-3xl md:text-4xl text-primary">Blackjack</CardTitle>
                <CardDescription className="font-body">Get closer to 21 than the dealer to win!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 md:space-y-8">
                {/* Dealer's Hand */}
                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-headline flex items-center gap-2">
                        <Bot /> Dealer's Hand ({gameState === 'playerTurn' || gameState === 'betting' ? '?' : dealerScore})
                    </h3>
                    <div className="flex flex-wrap gap-2 min-h-[104px] md:min-h-[152px] items-center">
                        {dealerHand.length === 0 && Array(2).fill(0).map((_, i) => <div key={i} className="w-16 h-24 md:w-24 md:h-36 bg-muted rounded-lg" />)}
                        {dealerHand.map((card, index) => (
                            <PlayingCard key={index} card={card} hidden={(gameState === 'playerTurn' || gameState === 'betting') && index === 1} />
                        ))}
                    </div>
                </div>

                {/* Player's Hand */}
                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-headline flex items-center gap-2">
                        <User /> Your Hand ({playerScore})
                    </h3>
                    <div className="flex flex-wrap gap-2 min-h-[104px] md:min-h-[152px] items-center">
                        {playerHand.length === 0 && Array(2).fill(0).map((_, i) => <div key={i} className="w-16 h-24 md:w-24 md:h-36 bg-muted rounded-lg" />)}
                        {playerHand.map((card, index) => (
                            <PlayingCard key={index} card={card} />
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
                {gameState === 'playerTurn' && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button onClick={playerHit} className="w-full sm:w-32 text-lg font-headline">Hit</Button>
                        <Button onClick={playerStand} variant="outline" className="w-full sm:w-32 text-lg font-headline">Stand</Button>
                    </div>
                )}
                 {gameState === 'gameOver' && (
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
