
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                           <Skeleton className="h-16 w-16 rounded-full" />
                           <div className="space-y-2">
                               <Skeleton className="h-6 w-48" />
                               <Skeleton className="h-4 w-64" />
                           </div>
                        </div>
                         <Skeleton className="h-8 w-full" />
                         <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl sm:text-3xl">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-headline text-xl mb-2">Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="bg-background/50 p-3 rounded-md">
                                <p className="text-muted-foreground">Phone Number</p>
                                <p className="font-semibold">{user.phoneNumber}</p>
                            </div>
                            <div className="bg-background/50 p-3 rounded-md">
                                <p className="text-muted-foreground">Member Since</p>
                                <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
