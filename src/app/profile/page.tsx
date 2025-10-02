
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, FileText, Users, Edit } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  bio: z.string().max(200, { message: 'Bio cannot exceed 200 characters.' }).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UserProfile = {
  name: string;
  email: string;
  bio?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicDiseases?: string;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].profile;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const user = auth.currentUser;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      bloodGroup: '',
      allergies: '',
      chronicDiseases: '',
    },
  });

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setUserProfile(data);
          form.reset({
            name: data.name || user.displayName || '',
            bio: data.bio || '',
            bloodGroup: data.bloodGroup || '',
            allergies: data.allergies || '',
            chronicDiseases: data.chronicDiseases || '',
          });
        } else {
          // Prefill from auth if no profile exists
          form.reset({
            name: user.displayName || '',
          });
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
        setIsLoading(false);
    }
  }, [user, form]);
  
  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    const docRef = doc(db, 'users', user.uid);
    try {
      await setDoc(docRef, {
        ...values,
        email: user.email,
      }, { merge: true });
      toast({
        title: 'Profile Updated',
        description: 'Your health details have been saved.',
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const HealthDetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div>
        <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
        <p className="text-base">{value || 'Not provided'}</p>
    </div>
  );

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* My Health Details Card */}
        <Card className="md:col-span-3 lg:col-span-2 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">{t.healthDetailsTitle}</CardTitle>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Your Health Details</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="bio" render={({ field }) => (
                                <FormItem><FormLabel>Short Bio</FormLabel><FormControl><Textarea placeholder="A little about yourself" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                                <FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="e.g., A+, O-" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="allergies" render={({ field }) => (
                                <FormItem><FormLabel>Allergies</FormLabel><FormControl><Textarea placeholder="e.g., Peanuts, Pollen" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="chronicDiseases" render={({ field }) => (
                                <FormItem><FormLabel>Chronic Diseases</FormLabel><FormControl><Textarea placeholder="e.g., Diabetes, Hypertension" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ) : userProfile ? (
                 <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                        <p className="text-muted-foreground">{userProfile.email}</p>
                        {userProfile.bio && <p className="mt-2 text-foreground/80">{userProfile.bio}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <HealthDetailItem label="Blood Group" value={userProfile.bloodGroup} />
                        <HealthDetailItem label="Allergies" value={userProfile.allergies} />
                        <HealthDetailItem label="Chronic Diseases" value={userProfile.chronicDiseases} />
                    </div>
                </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added your health details yet.</p>
                <Button onClick={() => setIsFormOpen(true)}>Add My Details</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Cards */}
        <div className="space-y-8">
          <Card className="text-center shadow-lg bg-secondary/50 cursor-not-allowed">
            <CardHeader className="items-center p-6 opacity-50">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline">{t.documentsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="opacity-50">
              <p className="text-muted-foreground">{t.documentsDescription}</p>
               <p className="text-xs font-semibold text-primary mt-2">(Coming Soon)</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg bg-secondary/50 cursor-not-allowed">
            <CardHeader className="items-center p-6 opacity-50">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline">{t.familyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="opacity-50">
              <p className="text-muted-foreground">{t.familyDescription}</p>
              <p className="text-xs font-semibold text-primary mt-2">(Coming Soon)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
