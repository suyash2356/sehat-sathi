'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Phone, KeyRound } from 'lucide-react';

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
});

const otpSchema = z.object({
    otp: z.string().min(6, { message: 'OTP must be 6 digits.' }),
});

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: any;
    }
}

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });
  
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("Recaptcha verified");
        },
      });
    }
  };

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setIsSubmitting(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = `+91${values.phoneNumber}`;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${phoneNumber}.`,
      });
    } catch (error: any) {
      console.error("Error sending OTP: ", error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'The phone number you entered is not valid.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    setIsSubmitting(true);
    try {
      await window.confirmationResult.confirm(values.otp);
      toast({
        title: 'Sign-in Successful',
        description: 'You have been successfully logged in.',
      });
      router.push('/chatbot');
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      toast({
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-12 md:py-24 flex items-center justify-center">
        <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold font-headline">
            {step === 'phone' ? 'Sign In / Sign Up' : 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' ? 'Enter your phone number to continue.' : 'Check your phone for the 6-digit code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4"/> Mobile Number</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                            <Input type="tel" placeholder="10-digit mobile number" {...field} className="rounded-l-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending OTP...' : 'Get OTP'}
                </Button>
              </form>
            </Form>
          ) : (
             <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><KeyRound className="h-4 w-4" />One-Time Password</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter 6-digit OTP" {...field} maxLength={6} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                 <Button variant="link" size="sm" onClick={() => { setStep('phone'); phoneForm.reset(); otpForm.reset(); }} className="w-full">
                    Use a different number
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
