
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://express-ts-api-fhcn.onrender.com/v1/api';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        if (newEmail && !validateEmail(newEmail)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };
    
    const validatePhoneNumber = (phone: string) => {
        const regex = /^\d{11}$/;
        return regex.test(phone);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhoneNumber = e.target.value;
        setPhoneNumber(newPhoneNumber);
        if (newPhoneNumber && !validatePhoneNumber(newPhoneNumber)) {
            setPhoneNumberError('Phone number must be exactly 11 digits.');
        } else {
            setPhoneNumberError('');
        }
    };
    
    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long.";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain a lowercase letter.";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain an uppercase letter.";
        }
        if (!/\d/.test(password)) {
            return "Password must contain a digit.";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Password must contain a special character.";
        }
        return "";
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword) {
            setPasswordError(validatePassword(newPassword));
        } else {
            setPasswordError('');
        }
    };


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentPasswordError = validatePassword(password);
        if (currentPasswordError) {
            setPasswordError(currentPasswordError);
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        if (!validatePhoneNumber(phoneNumber)) {
            setPhoneNumberError('Phone number must be exactly 11 digits.');
            return;
        }
        if (emailError || phoneNumberError || passwordError) return;

        setEmailError('');
        setPhoneNumberError('');
        setPasswordError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Now we throw an error with the specific message from the API
                throw new Error(data.message || 'An unknown error occurred during registration.');
            }

            toast({
                title: "Registration Successful!",
                description: "You can now log in with your credentials.",
            });
            router.push('/login');

        } catch (error: any) {
            // The catch block will display the specific error message thrown above
            toast({
                title: "Registration Failed",
                description: error.message, // This now contains the specific API error
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
                    <CardDescription>Enter your information to create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="grid gap-4">
                         <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                disabled={loading}
                                className={cn(emailError && "border-destructive")}
                            />
                            {emailError && <p className="text-sm font-medium text-destructive">{emailError}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                placeholder="01711223344"
                                required
                                value={phoneNumber}
                                onChange={handlePhoneNumberChange}
                                disabled={loading}
                                className={cn(phoneNumberError && "border-destructive")}
                            />
                             {phoneNumberError && <p className="text-sm font-medium text-destructive">{phoneNumberError}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                disabled={loading}
                                className={cn(passwordError && "border-destructive")}
                            />
                            {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
                        </div>
                        <Button type="submit" className="w-full font-headline" disabled={loading || !!emailError || !!phoneNumberError || !!passwordError}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating Account...' : 'Create an account'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="underline">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
