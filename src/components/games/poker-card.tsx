import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function PokerCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Poker</CardTitle>
                <CardDescription className="font-body">Test your skills and luck at the poker table.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Poker game placeholder"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="poker chips"
                />
                <h3 className="text-2xl font-headline">Coming Soon!</h3>
                <p className="text-muted-foreground">The virtual poker room is under construction.</p>
            </CardContent>
        </Card>
    );
}
