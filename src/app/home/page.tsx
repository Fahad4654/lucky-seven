
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Diamond, Spade, Heart, Dice5, Apple } from 'lucide-react';

const games = [
  { href: "/slot-machine", label: "Slot Machine", icon: Diamond, description: "Spin the reels for a chance to win big!" },
  { href: "/blackjack", label: "Blackjack", icon: Spade, description: "Get closer to 21 than the dealer." },
  { href: "/poker", label: "Poker", icon: Heart, description: "Play against the dealer and make the best hand." },
  { href: "/dice-roller", label: "Dice Roller", icon: Dice5, description: "Bet high or low in this classic game of chance." },
  { href: "/fortune-apple", label: "Fortune Apple", icon: Apple, description: "Pick good apples and climb the levels for huge multipliers." },
];

export default function HomePage() {
  return (
    <div className="w-full h-full flex flex-col items-center">
        <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-headline text-primary">Welcome to Lucky Sevens</h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2 font-body">Choose a game below to start playing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
            {games.map((game) => (
                <Link href={game.href} key={game.href} className="transform transition-transform hover:scale-105">
                    <Card className="h-full flex flex-col bg-card/80 hover:bg-card hover:border-primary/50 border-2 border-transparent transition-all">
                        <CardHeader className="flex-row items-center gap-4">
                           <div className="bg-primary/10 p-3 rounded-lg">
                             <game.icon className="w-8 h-8 text-primary" />
                           </div>
                           <div>
                            <CardTitle className="font-headline text-2xl">{game.label}</CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                             <CardDescription className="font-body text-base">{game.description}</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
