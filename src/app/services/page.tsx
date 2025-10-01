
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HeartPulse, ShieldCheck, Baby, ShieldPlus, Syringe, Activity, Search } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const initiativeIcons = [
  <HeartPulse key="ayushman" className="h-8 w-8 text-primary" />,
  <ShieldCheck key="mission" className="h-8 w-8 text-primary" />,
  <Baby key="matru" className="h-8 w-8 text-primary" />,
  <ShieldPlus key="jssk" className="h-8 w-8 text-primary" />,
  <Syringe key="rbsk" className="h-8 w-8 text-primary" />,
  <Activity key="ntcp" className="h-8 w-8 text-primary" />,
];

const filterSchema = z.object({
  age: z.coerce.number().min(0, { message: 'Age must be a positive number.' }).max(120),
  gender: z.enum(['male', 'female', 'other']),
  state: z.string().min(1, { message: 'Please select your state.' }),
  district: z.string().min(1, { message: 'Please select your district.' }),
});

type FilterValues = z.infer<typeof filterSchema>;

type Initiative = (typeof translations.en.services.initiatives)[0];

export default function ServicesPage() {
  const { language } = useChatLanguage();
  const t = translations[language].services;
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allInitiatives = t.initiatives.map((initiative, index) => ({
    ...initiative,
    icon: initiativeIcons[index],
  }));

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      age: 18,
      gender: 'female',
      state: 'Maharashtra',
      district: 'Pune',
    },
  });

  function onSubmit(values: FilterValues) {
    const { age, gender } = values;
    
    const results = allInitiatives.filter(initiative => {
      const { minAge, maxAge, applicableGender } = initiative.criteria;
      
      const ageMatch = age >= minAge && age <= maxAge;
      const genderMatch = applicableGender === 'all' || applicableGender === gender;
      
      return ageMatch && genderMatch;
    });

    setFilteredInitiatives(results);
    setIsFilterActive(true);
    setIsDialogOpen(false);
    form.reset();
  }
  
  const handleReset = () => {
    setIsFilterActive(false);
    setFilteredInitiatives([]);
  }

  const displayedInitiatives = isFilterActive ? filteredInitiatives : allInitiatives;

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.initiativesTitle}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t.initiativesSubtitle}
        </p>
      </div>
      
      <Card className="mb-12 shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Search className="h-6 w-6 text-primary"/>
            {t.myServicesTitle}
          </CardTitle>
          <CardDescription>
            {t.myServicesDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t.myServicesButton}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t.myServicesFormTitle}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.myServicesFormAge}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Your age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.myServicesFormGender}</FormLabel>
                        <FormControl>
                           <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="female" /></FormControl>
                              <FormLabel className="font-normal">{t.myServicesFormGenderFemale}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="male" /></FormControl>
                              <FormLabel className="font-normal">{t.myServicesFormGenderMale}</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2">
                              <FormControl><RadioGroupItem value="other" /></FormControl>
                              <FormLabel className="font-normal">{t.myServicesFormGenderOther}</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.myServicesFormState}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                              <SelectItem value="Delhi">Delhi</SelectItem>
                              <SelectItem value="Karnataka">Karnataka</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.myServicesFormDistrict}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your district" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pune">Pune</SelectItem>
                              <SelectItem value="Mumbai">Mumbai</SelectItem>
                              <SelectItem value="Nagpur">Nagpur</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <Button type="submit">{t.myServicesFormSubmit}</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      
      {isFilterActive && (
        <div className="mb-8 flex justify-between items-center">
            <h2 className="text-xl font-bold font-headline">{t.myServicesResultsTitle}</h2>
            <Button variant="outline" onClick={handleReset}>{t.myServicesResetButton}</Button>
        </div>
      )}

      <div className="space-y-6">
          {displayedInitiatives.map((initiative, index) => (
            <Card key={index} className="flex flex-col md:flex-row items-start shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="p-4 md:p-6 flex-shrink-0">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        {initiative.icon}
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-6">
                    <h3 className="font-headline text-lg font-semibold">{initiative.title}</h3>
                    <p className="text-muted-foreground mt-1">{initiative.description}</p>
                </CardContent>
            </Card>
          ))}
          {isFilterActive && displayedInitiatives.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t.myServicesNoResults}</p>
          )}
      </div>
    </div>
  );
}
