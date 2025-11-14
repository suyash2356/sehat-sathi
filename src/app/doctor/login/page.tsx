'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/hooks/use-firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { LogIn, UserPlus, KeyRound, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signInSchema = authSchema.omit({ password: true }).extend({
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function DoctorLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useChatLanguage();
  const t = translations[language].login;
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authType === 'login' ? signInSchema : authSchema),
    defaultValues: { email: '', password: '' },
  });

  const toggleAuthType = () => {
    setAuthType(prev => prev === 'login' ? 'signup' : 'login');
    form.reset();
  };

  async function handleSignUp(values: z.infer<typeof authSchema>) {
    if (!auth) return;
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await sendEmailVerification(userCredential.user);

      toast({
        title: "Account Created!",
        description: "A verification email has been sent. Please complete your profile to continue.",
      });

      // On successful sign-up, Firebase automatically signs the user in.
      // Redirect them directly to the form to complete their profile.
      router.push('/doctor/complete-profile');

    } catch (error: any) {
      let description = t.signUpFailedDescription;
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Please log in instead.";
      }
      toast({
        title: t.signUpFailedTitle,
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn(values: z.infer<typeof authSchema>) {
    if (!auth || !db) return;
    setIsSubmitting(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        const doctorRef = doc(db, "doctors", user.uid);
        const doctorSnap = await getDoc(doctorRef);

        if (doctorSnap.exists()) {
            const doctorData = doctorSnap.data();
            if (doctorData.isVerified) {
                router.push('/doctor/dashboard');
            } else if (doctorData.profileStatus === 'pending') {
                router.push('/doctor/pending-verification');
            } else {
                router.push('/doctor/complete-profile');
            }
        } else {
            // This path handles users who signed up but somehow missed the profile creation step.
            // It ensures their profile is created and they can proceed.
            await setDoc(doc(db, "doctors", user.uid), { 
                isVerified: false, 
                profileSubmitted: false,
                email: values.email,
                profileStatus: 'new'
            });
            toast({ title: "Welcome!", description: "Let's get your profile set up.", });
            router.push('/doctor/complete-profile');
        }
    } catch (error: any) {
        toast({ title: t.signInFailedTitle, description: t.signInFailedDescription, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  const onSubmit = authType === 'login' ? handleSignIn : handleSignUp;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-headline flex items-center justify-center gap-2">
            {authType === 'login' ? <LogIn /> : <UserPlus />}
            {authType === 'login' ? "Doctor Login" : "Doctor Registration"}
          </CardTitle>
          <CardDescription>{"For medical professionals only"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4"/> {t.emailLabel}</FormLabel>
                      <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><KeyRound className="h-4 w-4"/> {t.passwordLabel}</FormLabel>
                      <FormControl>
                          <div className="relative">
                              <Input type={showPassword ? 'text' : 'password'} placeholder={authType === 'signup' ? t.passwordPlaceholderSignup : '••••••••'} {...field} />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                  {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                              </button>
                          </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? (authType === 'login' ? t.submittingLogin : t.submittingSignup)
                    : (authType === 'login' ? t.buttonLogin : t.buttonSignup)
                  }
                </Button>
              </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {authType === 'login'
              ? <>{t.promptSignup} <button onClick={toggleAuthType} className="underline">{t.linkSignup}</button></>
              : <>{t.promptLogin} <button onClick={toggleAuthType} className="underline">{t.linkLogin}</button></>
            }
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing up, you agree to our verification process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
