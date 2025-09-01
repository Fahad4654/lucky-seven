
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ProfileData {
    id: string;
    userId: string;
    bio: string | null;
    avatarUrl: string | null;
    address: string | null;
    referralCode: string;
    referredCode: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const effectRan = useRef(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await api('/find/profile', {
                    method: 'POST',
                    body: JSON.stringify({ userId: user.id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data.');
                }
                const data = await response.json();
                setProfile(data.profile);

            } catch (error: any) {
                toast({
                    title: "Error fetching profile",
                    description: error.message || "Could not load profile details.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        
        if (process.env.NODE_ENV === 'development') {
            if (!effectRan.current) {
                if (user) {
                    fetchProfile();
                }
            }
            return () => {
                effectRan.current = true;
            };
        } else {
             if (user) {
                fetchProfile();
            }
        }


    }, [user, toast]);

    const pageLoading = authLoading || loading;

    if (pageLoading || !user) {
        return (
            <div className="w-full max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                           <Skeleton className="h-20 w-20 rounded-full" />
                           <div className="space-y-2">
                               <Skeleton className="h-6 w-48" />
                               <Skeleton className="h-4 w-64" />
                           </div>
                        </div>
                        <div className="space-y-4">
                             <Skeleton className="h-8 w-full" />
                             <Skeleton className="h-8 w-full" />
                             <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const avatarSrc = profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl sm:text-3xl">Profile</CardTitle>
                    <CardDescription>Your personal and account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarSrc} asChild>
                                <Image src={avatarSrc} alt={user.name} width={80} height={80} />
                            </AvatarImage>
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                             {profile?.bio && <p className="text-sm mt-1">{profile.bio}</p>}
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
                                <p className="text-muted-foreground">Address</p>
                                <p className="font-semibold">{profile?.address || 'Not set'}</p>
                            </div>
                            <div className="bg-background/50 p-3 rounded-md">
                                <p className="text-muted-foreground">Referral Code</p>
                                <p className="font-semibold">{profile?.referralCode || 'N/A'}</p>
                            </div>
                             <div className="bg-background/50 p-3 rounded-md">
                                <p className="text-muted-foreground">Referred Code</p>
                                <p className="font-semibold">{profile?.referredCode || 'N/A'}</p>
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
