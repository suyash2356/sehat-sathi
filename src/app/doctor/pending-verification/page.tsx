'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from "@/hooks/use-firebase";

export default function PendingVerificationPage() {
    const router = useRouter();
    const auth = useAuth();

    const handleLogout = async () => {
        if(auth) {
            await auth.signOut();
        }
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md mx-auto shadow-xl text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Clock className="h-12 w-12 text-yellow-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-headline">Verification Pending</CardTitle>
                    <CardDescription>Your profile has been submitted for review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Thank you for your submission. Our team will review your credentials, and you will be notified via email once the process is complete. This usually takes 1-2 business days.
                    </p>
                    <Button onClick={handleLogout} variant="outline">Return to Homepage</Button>
                </CardContent>
            </Card>
        </div>
    );
}
