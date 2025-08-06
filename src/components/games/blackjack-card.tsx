"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Spade, Heart, Diamond, Club, Repeat, User, Bot } from "lucide-react";

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
        );
    }
    
    return (
        <Card className="w-24 h-36 p-2 flex flex-col justify-between items-center bg-white text-black shadow-lg">
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

export default function BlackjackCard() {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameState, setGameState] = useState<'betting' | 'playerTurn' | 'dealerTurn' | 'gameOver'>('betting');
    const [winner, setWinner] = useState<'Player' | 'Dealer' | 'Push' | null>(null);
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

    const dealCards = useCallback(() => {
        setGameState('betting');
        setWinner(null);
        let freshDeck = shuffleDeck(createDeck());
        
        const playerInitialHand = [freshDeck.pop()!, freshDeck.pop()!];
        const dealerInitialHand = [freshDeck.pop()!, freshDeck.pop()!];
        
        setPlayerHand(playerInitialHand);
        setDealerHand(dealerInitialHand);
        
        setPlayerScore(calculateScore(playerInitialHand));
        setDealerScore(calculateScore(dealerInitialHand));

        setDeck(freshDeck);
        setGameState('playerTurn');
    }, []);

    useEffect(() => {
        dealCards();
    }, [dealCards]);

    useEffect(() => {
        if (playerScore > 21) {
            setWinner('Dealer');
            setGameState('gameOver');
        } else if (playerScore === 21 && playerHand.length === 2) {
             // Blackjack
            setWinner('Player');
            setGameState('gameOver');
        }
    }, [playerScore, playerHand.length]);

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

    }, [dealerHand, deck, playerScore]);

    useEffect(() => {
        if (gameState === 'dealerTurn') {
            playerStand();
        }
    }, [gameState, playerStand]);
    
    useEffect(() => {
        if (winner) {
            toast({
                title: winner === 'Push' ? 'It\'s a Push!' : `Winner: ${winner}!`,
                description: winner === 'Player' ? 'You win!' : (winner === 'Dealer' ? 'Dealer wins.' : 'Tied game.'),
            });
        }
    }, [winner, toast]);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Blackjack</CardTitle>
                <CardDescription className="font-body">The classic card game of 21.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Dealer's Hand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-headline flex items-center gap-2">
                        <Bot /> Dealer's Hand ({gameState === 'playerTurn' ? '?' : dealerScore})
                    </h3>
                    <div className="flex space-x-2 h-40 items-center">
                        {dealerHand.map((card, index) => (
                            <PlayingCard key={index} card={card} hidden={gameState === 'playerTurn' && index === 1} />
                        ))}
                    </div>
                </div>

                {/* Player's Hand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-headline flex items-center gap-2">
                        <User /> Your Hand ({playerScore})
                    </h3>
                    <div className="flex space-x-2 h-40 items-center">
                        {playerHand.map((card, index) => (
                            <PlayingCard key={index} card={card} />
                        ))}
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex-col space-y-4">
                <div className="flex space-x-4">
                    <Button onClick={playerHit} disabled={gameState !== 'playerTurn'} className="w-32 text-lg font-headline">Hit</Button>
                    <Button onClick={() => setGameState('dealerTurn')} disabled={gameState !== 'playerTurn'} variant="outline" className="w-32 text-lg font-headline">Stand</Button>
                </div>
                 {gameState === 'gameOver' && (
                    <div className="text-center p-4 rounded-lg bg-background/50 w-full">
                        <h3 className="text-3xl font-bold font-headline mb-2">
                           {winner === 'Player' && <span className="text-green-400">You Win!</span>}
                           {winner === 'Dealer' && <span className="text-red-500">Dealer Wins!</span>}
                           {winner === 'Push' && <span className="text-yellow-400">It's a Push!</span>}
                        </h3>
                         <Button onClick={dealCards} variant="secondary" className="gap-2">
                             <Repeat/>
                             Play Again
                         </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
