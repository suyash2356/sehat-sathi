'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/hooks/use-firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Schema for the profile details
const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  specialization: z.string().min(2, "Specialization must be at least 2 characters."),
  licenseNumber: z.string().min(5, "A valid medical license number is required."),
});

export default function CompleteProfilePage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      specialization: "",
      licenseNumber: "",
    },
  });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const user = auth?.currentUser;
    if (!user) {
      router.push('/doctor/login');
    }
  }, [auth, router]);

  // This function now updates the document instead of creating it
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth?.currentUser;
    if (!user || !db) {
      toast({ title: "Error", description: "Authentication context not available.", variant: "destructive" });
      return;
    }

    try {
      const doctorRef = doc(db, 'doctors', user.uid);

      // Use setDoc with { merge: true } to add new fields and update the flag
      await setDoc(doctorRef, {
        fullName: values.fullName,
        specialization: values.specialization,
        licenseNumber: values.licenseNumber,
        isProfileComplete: true, // This is the crucial flag
      }, { merge: true });

      toast({ title: "Profile Complete", description: "Your dashboard is now fully active." });
      router.push('/doctor/dashboard');

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: `Failed to save profile: ${error.message}`, variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Please provide your professional details to activate your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Dr. Jane Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl><Input placeholder="e.g., Pediatrics" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical License Number</FormLabel>
                    <FormControl><Input placeholder="Enter your license number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save and Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
