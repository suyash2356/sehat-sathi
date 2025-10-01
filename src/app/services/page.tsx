'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Stethoscope, Video, Hospital } from 'lucide-react';
import Link from 'next/link';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';


const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  issue: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
});

export default function ServicesPage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].services;

  const hospitals = t.hospitals.map(h => ({
    ...h,
    mapLink: 'https://www.google.com/maps' 
  }));

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      phone: '',
      issue: '',
    },
  });

  function onSubmit(values: z.infer<typeof bookingSchema>) {
    console.log(values);
    form.reset();
    toast({
      title: t.bookingToastTitle,
      description: t.bookingToastDescription,
      variant: 'default',
    });
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid gap-12">
        
        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">{t.aiTitle}</CardTitle>
            </div>
            <CardDescription className="pt-2">
              {t.aiDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t.aiHelpTitle}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {t.aiHelpItems.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
            <Button asChild className="mt-6">
              <Link href="/chatbot">{t.aiButton}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Video className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">{t.bookingTitle}</CardTitle>
            </div>
            <CardDescription className="pt-2">
              {t.bookingDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.formNamePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formPhoneLabel}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t.formPhonePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formIssueLabel}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.formIssuePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{t.bookingButton}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Hospital className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">{t.locatorTitle}</CardTitle>
            </div>
             <CardDescription className="pt-2">
              {t.locatorDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {hospitals.map((hospital, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 justify-between items-start p-4 border rounded-lg bg-secondary/30">
                    <div>
                        <h4 className="font-semibold">{hospital.name}</h4>
                        <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    </div>
                    <Button asChild variant="outline" className="mt-2 sm:mt-0 shrink-0 bg-background">
                        <a href={hospital.mapLink} target="_blank" rel="noopener noreferrer">
                            <MapPin className="mr-2 h-4 w-4" />
                            {t.mapButton}
                        </a>
                    </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
