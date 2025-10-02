
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, FileText, Users, Edit, Trash2, PlusCircle, Heart } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';

const memberSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  relationship: z.string().min(2, { message: 'Relationship is required.' }),
  bio: z.string().max(200, { message: 'Bio cannot exceed 200 characters.' }).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

type UserProfile = MemberFormValues & {
  id: string;
  email?: string;
  isPrimary: boolean;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].profile;
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const user = auth.currentUser;
  
  const primaryProfile = useMemo(() => profiles.find(p => p.isPrimary), [profiles]);
  const familyMembers = useMemo(() => profiles.filter(p => !p.isPrimary), [profiles]);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', relationship: '', bio: '', bloodGroup: '', allergies: '', chronicDiseases: '' },
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const familyColRef = collection(db, 'users', user.uid, 'familyMembers');

    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      let userProfile: UserProfile;
      if (docSnap.exists()) {
        const data = docSnap.data();
        userProfile = { id: user.uid, isPrimary: true, email: user.email!, ...data } as UserProfile;
      } else {
        userProfile = { id: user.uid, isPrimary: true, name: user.displayName || 'New User', email: user.email!, relationship: 'Self' };
      }
      setProfiles(prev => [userProfile, ...prev.filter(p => !p.isPrimary)]);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      toast({ title: 'Error', description: 'Could not fetch your profile data.', variant: 'destructive'});
      setIsLoading(false);
    });

    const unsubFamily = onSnapshot(familyColRef, (snapshot) => {
      const familyData = snapshot.docs.map(doc => ({ id: doc.id, isPrimary: false, ...doc.data() } as UserProfile));
      setProfiles(prev => [prev.find(p => p.isPrimary)!, ...familyData]);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching family members:", error);
        toast({ title: 'Error', description: 'Could not fetch family member data.', variant: 'destructive'});
        setIsLoading(false);
    });

    return () => {
      unsubUser();
      unsubFamily();
    };
  }, [user, toast]);
  
  const handleOpenForm = (profile: UserProfile | null = null) => {
    setEditingProfile(profile);
    if (profile) {
      form.reset({
          name: profile.name || '',
          relationship: profile.relationship || '',
          bio: profile.bio || '',
          bloodGroup: profile.bloodGroup || '',
          allergies: profile.allergies || '',
          chronicDiseases: profile.chronicDiseases || '',
      });
    } else {
      form.reset({ name: '', relationship: '', bio: '', bloodGroup: '', allergies: '', chronicDiseases: '' });
    }
    setIsFormOpen(true);
  };

  async function onSubmit(values: MemberFormValues) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    
    try {
      if (editingProfile) { // Editing existing profile
        const docRef = editingProfile.isPrimary 
          ? doc(db, 'users', editingProfile.id)
          : doc(db, 'users', user.uid, 'familyMembers', editingProfile.id);
        
        await setDoc(docRef, values, { merge: true });
        toast({ title: 'Profile Updated', description: `${values.name}'s details have been saved.` });
      } else { // Adding new family member
        const colRef = collection(db, 'users', user.uid, 'familyMembers');
        await addDoc(colRef, values);
        toast({ title: 'Member Added', description: `${values.name} has been added to your family.` });
      }
      setIsFormOpen(false);
      setEditingProfile(null);
    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({ title: 'Save Failed', description: 'Could not save the profile. Please try again.', variant: 'destructive' });
    }
  }

  async function handleDelete(profile: UserProfile) {
    if (!user || profile.isPrimary) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'familyMembers', profile.id);
      await deleteDoc(docRef);
      toast({ title: 'Member Deleted', description: `${profile.name} has been removed.` });
    } catch (error) {
       console.error("Error deleting member: ", error);
       toast({ title: 'Delete Failed', description: 'Could not delete member. Please try again.', variant: 'destructive' });
    }
  }

  const HealthDetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div>
        <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
        <p className="text-base">{value || 'Not provided'}</p>
    </div>
  );

  const ProfileCard = ({ profile }: { profile: UserProfile }) => (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {profile.isPrimary ? <User className="h-6 w-6 text-primary" /> : <Heart className="h-6 w-6 text-accent" />}
          <CardTitle className="font-headline">{profile.name}</CardTitle>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(profile)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit {profile.name}</span>
            </Button>
            {!profile.isPrimary && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {profile.name}</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete {profile.name}'s profile. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(profile)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <p className="text-sm font-bold text-muted-foreground">{profile.relationship}</p>
            {profile.isPrimary && <p className="text-muted-foreground">{profile.email}</p>}
            {profile.bio && <p className="mt-2 text-foreground/80">{profile.bio}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <HealthDetailItem label="Blood Group" value={profile.bloodGroup} />
            <HealthDetailItem label="Allergies" value={profile.allergies} />
            <div className="md:col-span-2">
              <HealthDetailItem label="Chronic Diseases" value={profile.chronicDiseases} />
            </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user && !isLoading) {
    return (
      <div className="container py-12 md:py-16 text-center">
         <h1 className="text-3xl md:text-4xl font-bold font-headline">Access Denied</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You must be logged in to view your profile.
        </p>
         <Button onClick={() => window.location.href='/login'} className="mt-6">Login</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingProfile ? `Edit ${editingProfile.isPrimary ? 'Your' : `${editingProfile.name}'s`} Profile` : 'Add a Family Member'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="relationship" render={({ field }) => (
                          <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="e.g., Spouse, Son, Mother" {...field} disabled={editingProfile?.isPrimary} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="bio" render={({ field }) => (
                          <FormItem><FormLabel>Short Bio</FormLabel><FormControl><Textarea placeholder="A little about them" {...field} /></FormControl><FormMessage /></FormItem>
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
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              Family & Health Details
            </h2>
             <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
          </div>
          
          {isLoading ? (
             <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
             </div>
          ) : (
            <>
              {primaryProfile && <ProfileCard profile={primaryProfile} />}
              {familyMembers.map(member => <ProfileCard key={member.id} profile={member} />)}
              {profiles.length === 0 && (
                 <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't added any profiles yet.</p>
                    </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

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
        </div>
      </div>
    </div>
  );
}
