import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function BlackjackCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Blackjack</CardTitle>
                <CardDescription className="font-body">The classic card game of 21.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Blackjack game placeholder"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="casino blackjack"
                />
                <h3 className="text-2xl font-headline">Coming Soon!</h3>
                <p className="text-muted-foreground">Get ready to hit, stand, and win big.</p>
            </CardContent>
        </Card>
    );
}
