
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

const PlayingCard = ({ card, isSelected, onClick }: { card: CardType, isSelected?: boolean, onClick?: () => void }) => {
    const suitIcons = {
        Spades: <Spade className="h-5 w-5 fill-current" />,
        Hearts: <Heart className="h-5 w-5 fill-current text-red-500" />,
        Diamonds: <Diamond className="h-5 w-5 fill-current text-red-500" />,
        Clubs: <Club className="h-5 w-5 fill-current" />,
    };
    
    return (
        <Card 
            className={`w-24 h-36 p-2 flex flex-col justify-between items-center bg-white text-black shadow-lg cursor-pointer transition-all duration-200 ${isSelected ? 'transform -translate-y-2 ring-4 ring-primary' : 'hover:-translate-y-1'}`}
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

const handRanks = {
    'Royal Flush': 10,
    'Straight Flush': 9,
    'Four of a Kind': 8,
    'Full House': 7,
    'Flush': 6,
    'Straight': 5,
    'Three of a Kind': 4,
    'Two Pair': 3,
    'One Pair': 2,
    'High Card': 1,
};

type HandRank = keyof typeof handRanks;

interface HandResult {
    rank: HandRank;
    value: number;
    hand: CardType[];
}

export default function PokerCard() {
    const [deck, setDeck] = useState<CardType[]>([]);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<boolean[]>(new Array(5).fill(false));
    const [gameState, setGameState] = useState<'deal' | 'draw' | 'showdown'>('deal');
    const [playerHandResult, setPlayerHandResult] = useState<HandResult | null>(null);
    const [dealerHandResult, setDealerHandResult] = useState<HandResult | null>(null);
    const [winner, setWinner] = useState<'Player' | 'Dealer' | 'Push' | null>(null);
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
        const rankCounts: { [key in Rank]: number } = { '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0 };
        const suitCounts: { [key in Suit]: number } = { Spades: 0, Hearts: 0, Diamonds: 0, Clubs: 0 };
        
        hand.forEach(card => {
            rankCounts[card.rank]++;
            suitCounts[card.suit]++;
        });

        const sortedRanks = hand.map(c => ranks.indexOf(c.rank)).sort((a,b) => a - b);
        const isFlush = Object.values(suitCounts).some(count => count === 5);
        const isStraight = sortedRanks.every((rank, i) => i === 0 || rank === sortedRanks[i-1] + 1) ||
                           (JSON.stringify(sortedRanks) === JSON.stringify([0, 9, 10, 11, 12])); // Ace-low straight A,2,3,4,5
        
        const rankValues = Object.entries(rankCounts).filter(([, count]) => count > 0).map(([rank]) => ranks.indexOf(rank));

        if (isStraight && isFlush) {
            const isRoyal = sortedRanks[0] === 9; // 10, J, Q, K, A
            return { rank: isRoyal ? 'Royal Flush' : 'Straight Flush', value: handRanks[isRoyal ? 'Royal Flush' : 'Straight Flush'], hand };
        }

        const pairs = Object.values(rankCounts).filter(count => count === 2).length;
        const threes = Object.values(rankCounts).filter(count => count === 3).length;
        const fours = Object.values(rankCounts).filter(count => count === 4).length;

        if (fours === 1) return { rank: 'Four of a Kind', value: handRanks['Four of a Kind'], hand };
        if (threes === 1 && pairs === 1) return { rank: 'Full House', value: handRanks['Full House'], hand };
        if (isFlush) return { rank: 'Flush', value: handRanks['Flush'], hand };
        if (isStraight) return { rank: 'Straight', value: handRanks['Straight'], hand };
        if (threes === 1) return { rank: 'Three of a Kind', value: handRanks['Three of a Kind'], hand };
        if (pairs === 2) return { rank: 'Two Pair', value: handRanks['Two Pair'], hand };
        if (pairs === 1) return { rank: 'One Pair', value: handRanks['One Pair'], hand };

        return { rank: 'High Card', value: handRanks['High Card'], hand };
    };

    const startNewGame = useCallback(() => {
        setGameState('deal');
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
        setGameState('draw');
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
        
        // Player's draw
        const newPlayerHand = [...playerHand];
        selectedCards.forEach((isSelected, index) => {
            if (isSelected) {
                newPlayerHand[index] = currentDeck.pop()!;
            }
        });

        // Dealer's draw logic (simple: draw on less than a pair)
        const initialDealerResult = getHandResult(dealerHand);
        let newDealerHand = [...dealerHand];
        if (initialDealerResult.value < handRanks['One Pair']) {
             // Draw 3 cards
             for(let i=0; i<3; i++){
                newDealerHand[i] = currentDeck.pop()!;
             }
        }
        
        setPlayerHand(newPlayerHand);
        setDealerHand(newDealerHand);
        setDeck(currentDeck);
        setGameState('showdown');
    };
    
    const determineWinner = useCallback((playerRes: HandResult, dealerRes: HandResult) => {
        if (playerRes.value > dealerRes.value) {
            setWinner('Player');
        } else if (dealerRes.value > playerRes.value) {
            setWinner('Dealer');
        } else {
            // Handle ties with high card - simplified for now
            setWinner('Push');
        }
    }, []);

    useEffect(() => {
        if (gameState === 'showdown') {
            const pResult = getHandResult(playerHand);
            const dResult = getHandResult(dealerHand);
            setPlayerHandResult(pResult);
            setDealerHandResult(dResult);
            determineWinner(pResult, dResult);
        }
    }, [gameState, playerHand, dealerHand, determineWinner]);

    useEffect(() => {
        if (winner) {
            toast({
                title: winner === 'Push' ? 'It\'s a Push!' : `Winner: ${winner}!`,
                description: `You ${winner === 'Player' ? 'win' : 'lose'} with a ${playerHandResult?.rank}. Dealer had a ${dealerHandResult?.rank}.`,
            });
        }
    }, [winner, toast, playerHandResult, dealerHandResult]);

    const renderHand = (hand: CardType[], result: HandResult | null, title: string, owner: 'player' | 'dealer') => (
        <div className="space-y-4">
            <h3 className="text-2xl font-headline flex items-center gap-2">
                {owner === 'player' ? <User /> : <Bot />} {title}
                {result && <span className="text-lg text-primary font-body">({result.rank})</span>}
            </h3>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 h-44 items-center">
                {hand.length === 0 && Array(5).fill(0).map((_, i) => <div key={i} className="w-24 h-36 bg-muted rounded-lg" />)}
                {hand.map((card, index) => (
                    <PlayingCard 
                        key={index} 
                        card={card} 
                        isSelected={owner === 'player' && selectedCards[index]}
                        onClick={owner === 'player' ? () => toggleCardSelection(index) : undefined}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Five Card Draw</CardTitle>
                <CardDescription className="font-body">Make the best five-card hand to win.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {renderHand(dealerHand, gameState === 'showdown' ? dealerHandResult : null, "Dealer's Hand", 'dealer')}
                {renderHand(playerHand, playerHandResult, "Your Hand", 'player')}
            </CardContent>
            <CardFooter className="flex-col space-y-4">
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
