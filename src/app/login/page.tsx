
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { useAuth, googleProvider } from '@/hooks/use-firebase';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signInSchema = authSchema.omit({ password: true }).extend({
  password: z.string().min(1, { message: 'Password is required.' }),
});


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const { language } = useChatLanguage();
  const t = translations[language].login;
  const auth = useAuth();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authType === 'login' ? signInSchema : authSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleGoogleSignIn = async () => {
    if(!auth) return;
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: t.googleSignInSuccessTitle,
        description: t.googleSignInSuccessDescription,
      });
      router.push('/chatbot');
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: t.googleSignInFailedTitle,
        description: t.googleSignInFailedDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleAuthTypeChange = (type: 'login' | 'signup') => {
    setAuthType(type);
    form.reset(); 
    // We need to change the resolver dynamically
    // The easiest way is to trigger a re-render with the new authType
  };

  async function onSubmit(values: z.infer<typeof authSchema>) {
    if(!auth) return;
    setIsSubmitting(true);
    if (authType === 'signup') {
      try {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: t.signUpSuccessTitle,
          description: t.signUpSuccessDescription,
        });
        router.push('/chatbot');
      } catch (error: any) {
        let description = t.signUpFailedDescription;
        if (error.code === 'auth/email-already-in-use') {
          description = t.signUpFailedEmailInUse;
        }
        toast({
          title: t.signUpFailedTitle,
          description,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else { // Sign-in
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: t.signInSuccessTitle,
          description: t.signInSuccessDescription,
        });
        router.push('/chatbot');
      } catch (error: any) {
        toast({
          title: t.signInFailedTitle,
          description: t.signInFailedDescription,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }


  return (
    <div className="container py-12 md:py-24 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold font-headline">
            {authType === 'login' ? t.titleLogin : t.titleSignup}
          </CardTitle>
          <CardDescription>
            {authType === 'login' ? t.subtitleLogin : t.subtitleSignup}
          </CardDescription>
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
                        <Input type="password" placeholder={authType === 'signup' ? t.passwordPlaceholderSignup : '••••••••'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? authType === 'login' ? t.submittingLogin : t.submittingSignup
                  : authType === 'login' ? t.buttonLogin : t.buttonSignup
                }
              </Button>
            </form>
          </Form>

          <Separator className="my-6" />
          
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 121.3 109.8 8 244 8c66.8 0 126 25.4 169.2 67.2L347.5 151C318.8 123.5 284.3 108 244 108c-88.3 0-160 71.7-160 160s71.7 160 160 160c97.2 0 132.3-70.2 135-108.3H244v-64h244z"></path></svg>
                {t.googleButton}
            </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {authType === 'login' ? t.promptSignup : t.promptLogin}
              <Button variant="link" size="sm" onClick={() => handleAuthTypeChange(authType === 'login' ? 'signup' : 'login')}>
                {authType === 'login' ? t.linkSignup : t.linkLogin}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
