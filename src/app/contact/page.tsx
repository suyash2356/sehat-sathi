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
import { Mail, Phone, MessageSquare } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    console.log(values);
    form.reset();
    toast({
      title: 'Message Sent!',
      description: 'Thank you for contacting us. We will get back to you shortly.',
    });
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Get In Touch</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline">
              <MessageSquare className="h-6 w-6 text-primary" />
              Send us a Message
            </CardTitle>
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
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="How can we help you?" {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Send Message</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8 mt-4 md:mt-0">
            <h3 className="text-xl font-semibold font-headline">Contact Information</h3>
            <p className="text-muted-foreground">
              For direct support, you can reach out to us via email. Please note, for medical emergencies, contact a hospital directly.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary"/>
                </div>
                <div>
                  <h4 className="font-semibold">Support Email</h4>
                  <a href="mailto:support@sehatsathi.example.com" className="text-muted-foreground hover:text-primary transition-colors">support@sehatsathi.example.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Phone className="h-6 w-6 text-primary"/>
                </div>
                <div>
                  <h4 className="font-semibold">Emergency Helpline (Dummy)</h4>
                  <p className="text-muted-foreground">+91-123-456-7890 (Please use official emergency numbers)</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
