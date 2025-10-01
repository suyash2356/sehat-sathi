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
import { MapPin, Stethoscope, Video } from 'lucide-react';
import Link from 'next/link';

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  issue: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
});

const hospitals = [
    {
        name: 'Community Health Center, Ramgarh',
        address: 'Ramgarh, Sitapur District, Uttar Pradesh',
        mapLink: 'https://www.google.com/maps'
    },
    {
        name: 'District Hospital, Sitapur',
        address: 'NH 24, Sitapur, Uttar Pradesh',
        mapLink: 'https://www.google.com/maps'
    },
    {
        name: 'Primary Health Sub-center, Devipur',
        address: 'Devipur Village, Near Ramgarh, Uttar Pradesh',
        mapLink: 'https://www.google.com/maps'
    }
]

export default function ServicesPage() {
  const { toast } = useToast();
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
      title: 'Booking Confirmed!',
      description: "We've received your request. You'll get an SMS shortly.",
      variant: 'default',
    });
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Our Services</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Accessible healthcare solutions designed for you.
        </p>
      </div>

      <div className="grid gap-12">
        
        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">AI-Powered Health Guidance</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Have a health question? Get instant, reliable advice from our AI assistant. It's like having a health expert in your pocket, available 24/7.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Our chatbot can help with:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Understanding symptoms</li>
                <li>First-aid for minor injuries</li>
                <li>Information about common illnesses</li>
            </ul>
            <Button asChild className="mt-6">
              <Link href="/chatbot">Ask Our Chatbot</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Video className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">Book a Tele-Consultation</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Connect with a certified doctor from the comfort of your home. Fill out the form below to request an appointment.
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
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ramesh Kumar" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="10-digit mobile number" {...field} />
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
                      <FormLabel>Health Issue</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe your health concern..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Request Booking</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Hospital className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-headline">Hospital & Clinic Locator</CardTitle>
            </div>
             <CardDescription className="pt-2">
              Find government healthcare facilities near you.
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
                            View on Map
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
