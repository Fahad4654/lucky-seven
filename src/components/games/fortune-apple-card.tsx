import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function FortuneAppleCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-4xl text-primary">Fortune Apple</CardTitle>
                <CardDescription className="font-body">Take a bite and see what fortune awaits.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Image 
                    src="https://placehold.co/600x400.png"
                    alt="Fortune Apple game placeholder"
                    width={600}
                    height={400}
                    className="rounded-lg"
                    data-ai-hint="golden apple"
                />
                <h3 className="text-2xl font-headline">Coming Soon!</h3>
                <p className="text-muted-foreground">The juiciest game in the casino is ripening.</p>
            </CardContent>
        </Card>
    );
}
