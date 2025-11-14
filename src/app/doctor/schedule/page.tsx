'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';

// --- Zod Schema for Schedule ---
const daySchema = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean(),
});

const scheduleSchema = z.object({
  schedule: z.array(daySchema),
});

// --- Default Schedule Data ---
const defaultSchedule = [
  { day: 'Sunday', startTime: '', endTime: '', enabled: false },
  { day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', enabled: true },
  { day: 'Saturday', startTime: '', endTime: '', enabled: false },
];

// --- Schedule Management Page ---
export default function SchedulePage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { schedule: defaultSchedule },
  });

  const { fields } = useFieldArray({ control: form.control, name: "schedule" });

  // Fetch existing schedule on component mount
  useEffect(() => {
    const user = auth?.currentUser;
    if (!user || !db) {
      // If no user, no need to fetch, stop loading.
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      const scheduleRef = doc(db, 'doctors', user.uid, 'availability', 'default');
      const docSnap = await getDoc(scheduleRef);
      if (docSnap.exists()) {
        form.reset({ schedule: docSnap.data().schedule });
      }
      setLoading(false);
    };

    fetchSchedule();
  }, [auth, db, form]);

  // --- OnSubmit Handler ---
  async function onSubmit(values: z.infer<typeof scheduleSchema>) {
    const user = auth?.currentUser;
    if (!user || !db) {
      toast({ title: "Authentication Error", description: "You must be logged in to save your schedule.", variant: "destructive" });
      return;
    }

    try {
      const scheduleRef = doc(db, 'doctors', user.uid, 'availability', 'default');
      await setDoc(scheduleRef, values);
      toast({ title: "Success", description: "Your weekly availability has been updated." });
      router.push('/doctor/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: `Could not save schedule: ${error.message}`, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
       <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/doctor/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'><Clock className="mr-2"/> Manage Your Weekly Schedule</CardTitle>
            <CardDescription>Define your standard working hours for each day. Patients will only be able to book appointments during these times.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
                <p>Loading your schedule...</p>
             ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                            <input type="checkbox" {...form.register(`schedule.${index}.enabled`)} className="h-5 w-5"/>
                            <span className={`font-semibold ${form.watch(`schedule.${index}.enabled`) ? '' : 'text-gray-400'}`}>{field.day}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input type="time" {...form.register(`schedule.${index}.startTime`)} disabled={!form.watch(`schedule.${index}.enabled`)} className="w-32"/>
                            <span>-</span>
                            <Input type="time" {...form.register(`schedule.${index}.endTime`)} disabled={!form.watch(`schedule.${index}.enabled`)} className="w-32"/>
                        </div>
                      </div>
                    ))}
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save Schedule'}
                    </Button>
                  </form>
                </Form>
             )}
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
