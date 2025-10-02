
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldPlus, PlusCircle, CalendarIcon, User, Users, Landmark, FileText, IndianRupee } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const policySchema = z.object({
  policyName: z.string().min(3, { message: "Policy name is required." }),
  policyNumber: z.string().min(5, { message: "A valid policy number is required." }),
  provider: z.string().min(2, { message: "Insurance provider is required." }),
  policyType: z.enum(['Life', 'Health', 'Jivan Bima', 'Other'], { required_error: 'Please select a policy type.' }),
  issueDate: z.date({ required_error: 'Issue date is required.' }),
  maturityDate: z.date({ required_error: 'Maturity date is required.' }),
  premiumAmount: z.coerce.number().positive({ message: "Premium must be a positive number."}),
  nomineeName: z.string().min(2, { message: 'Nominee name is required.' }),
  nomineeRelationship: z.string().min(2, { message: 'Nominee relationship is required.' }),
});

type PolicyFormValues = z.infer<typeof policySchema>;

type Policy = PolicyFormValues & {
  id: string;
  issueDate: Timestamp;
  maturityDate: Timestamp;
};

export default function InsurancePage() {
  const { language } = useChatLanguage();
  const t = translations[language].insurance;
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const user = auth.currentUser;

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
  });

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const policiesColRef = query(collection(db, 'users', user.uid, 'insurancePolicies'), orderBy('issueDate', 'desc'));

    const unsubscribe = onSnapshot(policiesColRef, (snapshot) => {
      const policiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Policy));
      setPolicies(policiesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching policies:", error);
      toast({ title: 'Error', description: 'Could not fetch insurance policies.', variant: 'destructive'});
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  async function onSubmit(values: PolicyFormValues) {
    if (!user) return;
    try {
      const colRef = collection(db, 'users', user.uid, 'insurancePolicies');
      await addDoc(colRef, values);
      toast({ title: t.addSuccessToastTitle, description: t.addSuccessToastDescription });
      setIsFormOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding policy: ", error);
      toast({ title: 'Save Failed', description: 'Could not save the policy.', variant: 'destructive' });
    }
  }

  const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | number }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
  );

  if (!user && !isLoading) {
    return (
      <div className="container py-12 md:py-16 text-center">
         <h1 className="text-3xl md:text-4xl font-bold font-headline">Access Denied</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You must be logged in to view your insurance policies.
        </p>
         <Button onClick={() => window.location.href='/login'} className="mt-6">Login</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md md:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>{t.formTitle}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <FormField control={form.control} name="policyName" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.policyName}</FormLabel><FormControl><Input placeholder={t.form.policyNamePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="policyNumber" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.policyNumber}</FormLabel><FormControl><Input placeholder={t.form.policyNumberPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="provider" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.provider}</FormLabel><FormControl><Input placeholder={t.form.providerPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="policyType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.form.policyType}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={t.form.policyTypePlaceholder} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Life">{t.form.types.life}</SelectItem>
                                        <SelectItem value="Health">{t.form.types.health}</SelectItem>
                                        <SelectItem value="Jivan Bima">{t.form.types.jivanBima}</SelectItem>
                                        <SelectItem value="Other">{t.form.types.other}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="issueDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>{t.form.issueDate}</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>{t.form.datePlaceholder}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="maturityDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>{t.form.maturityDate}</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>{t.form.datePlaceholder}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="premiumAmount" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.premiumAmount}</FormLabel><FormControl><Input type="number" placeholder="e.g. 5000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="nomineeName" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.nomineeName}</FormLabel><FormControl><Input placeholder={t.form.nomineeNamePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="nomineeRelationship" render={({ field }) => (
                            <FormItem><FormLabel>{t.form.nomineeRelationship}</FormLabel><FormControl><Input placeholder={t.form.nomineeRelationshipPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <DialogFooter className="pt-4">
                            <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
                            <Button type="submit">{t.addButton}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-3">
            <ShieldPlus className="h-8 w-8 text-primary"/>
            {t.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t.viewPolicies}</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t.addPolicy}
            </Button>
          </div>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : policies.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {policies.map((policy) => (
                <AccordionItem key={policy.id} value={policy.id}>
                  <AccordionTrigger className="text-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="font-semibold">{policy.policyName}</div>
                            <div className="text-sm text-muted-foreground font-normal">{policy.provider} - #{policy.policyNumber}</div>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pl-4 pt-4 border-l-2 ml-6 border-primary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <DetailItem icon={<Landmark />} label={t.form.provider} value={policy.provider} />
                        <DetailItem icon={<FileText />} label={t.form.policyNumber} value={policy.policyNumber} />
                        <DetailItem icon={<ShieldPlus />} label={t.form.policyType} value={policy.policyType} />
                        <DetailItem icon={<IndianRupee />} label={t.form.premiumAmount} value={policy.premiumAmount.toLocaleString('en-IN')} />
                        <DetailItem icon={<CalendarIcon />} label={t.form.issueDate} value={format(policy.issueDate.toDate(), 'PPP')} />
                        <DetailItem icon={<CalendarIcon />} label={t.form.maturityDate} value={format(policy.maturityDate.toDate(), 'PPP')} />
                        <DetailItem icon={<User />} label={t.form.nomineeName} value={policy.nomineeName} />
                        <DetailItem icon={<Users />} label={t.form.nomineeRelationship} value={policy.nomineeRelationship} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="text-center py-12">
                <p className="text-muted-foreground">{t.noPolicies}</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
