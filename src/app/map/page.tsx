
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Video, Hospital, CalendarIcon, Clock, Zap } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { GoogleMapEmbed, type Hospital as HospitalType } from '@/components/services/GoogleMapEmbed';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVideoCall } from '@/hooks/use-video-call';

const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  issue: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
  appointmentType: z.enum(['hospital-visit', 'video-call'], {
    required_error: 'Please select an appointment type.',
  }),
  hospital: z.string().optional(),
  preferredDate: z.date().optional(),
  preferredTime: z.string().optional(),
  callNow: z.boolean().optional(),
}).refine(data => {
    if (data.appointmentType === 'hospital-visit' && !data.hospital) {
        return false;
    }
    return true;
}, {
    message: 'Please select a hospital from the map for a hospital visit.',
    path: ['hospital'],
}).refine(data => {
    if (data.appointmentType === 'video-call' && !data.callNow && (!data.preferredDate || !data.preferredTime)) {
        return false;
    }
    return true;
}, {
    message: 'Please select a preferred date and time for your video call.',
    path: ['preferredDate'],
});


type BookingFormValues = z.infer<typeof bookingSchema>;

export default function MapPage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].services;
  const bookingFormRef = React.useRef<HTMLDivElement>(null);
  const { createImmediateCall, createScheduledCall } = useVideoCall();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      phone: '',
      issue: '',
      hospital: '',
      appointmentType: 'video-call',
      callNow: false,
    },
  });
  
  const appointmentType = form.watch('appointmentType');
  const callNow = form.watch('callNow');

  React.useEffect(() => {
    if (callNow) {
      form.clearErrors(['preferredDate', 'preferredTime']);
      form.setValue('preferredDate', undefined);
      form.setValue('preferredTime', undefined);
    }
  }, [callNow, form]);

  async function onSubmit(values: BookingFormValues) {
    console.log(values);
    
    if (values.appointmentType === 'hospital-visit') {
        toast({
          title: t.bookingToastTitle,
          description: "Your request has been sent to the hospital. You will be notified upon confirmation.",
        });
    } else { // Video call
        const patientData = {
          patientId: `patient_${Date.now()}`,
          patientName: values.name,
          patientPhone: values.phone,
          issue: values.issue
        };

        if (values.callNow) {
            // Create immediate call
            await createImmediateCall(patientData);
        } else {
            // Create scheduled call
            const scheduledTime = new Date(values.preferredDate!);
            const timeSlot = values.preferredTime!;
            
            // Parse time slot like "09:00 AM - 09:30 AM"
            const [startTime] = timeSlot.split(' - ');
            const [timePart, ampm] = startTime.split(' ');
            const [hours, minutes] = timePart.split(':');
            
            let hour24 = parseInt(hours);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            
            scheduledTime.setHours(hour24, parseInt(minutes), 0, 0);
            
            await createScheduledCall({
              ...patientData,
              scheduledTime
            });
        }
    }
    form.reset();
  }
  
  const handleBookAppointment = (hospital: HospitalType) => {
    form.setValue('hospital', hospital.name);
    form.setValue('appointmentType', 'hospital-visit');
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const timeSlots = [
    "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM",
    "03:30 PM - 04:00 PM",
  ];

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.locatorTitle}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.locatorDescription}
        </p>
      </div>
      
      <div className="grid gap-12">
        <Card className="shadow-lg overflow-hidden" id="hospital-locator">
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
            <GoogleMapEmbed 
                hospitals={t.hospitals} 
                onBookAppointment={handleBookAppointment}
                translations={
                    {
                        specialties: t.mapSpecialties,
                        timings: t.mapTimings,
                        contact: t.mapContact,
                        bookAppointment: t.mapButton
                    }
                }
            />
          </CardContent>
        </Card>

        <div ref={bookingFormRef}>
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
                      name="appointmentType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t.formAppointmentTypeLabel}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="video-call" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t.formAppointmentTypeVideo}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="hospital-visit" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {t.formAppointmentTypeHospital}
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                    
                    {appointmentType === 'hospital-visit' && (
                        <FormField
                            control={form.control}
                            name="hospital"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t.formHospitalLabel}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.formHospitalPlaceholder} {...field} disabled={appointmentType !== 'hospital-visit'} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {appointmentType === 'video-call' && (
                      <div className="space-y-6 rounded-lg border p-4">
                        <FormField
                          control={form.control}
                          name="callNow"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-primary/10">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center gap-2"><Zap className="text-amber-500" /> {t.formCallNowLabel}</FormLabel>
                                <FormDescription>{t.formCallNowDescription}</FormDescription>
                              </div>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className={cn("space-y-6", callNow ? "opacity-50" : "")}>
                          <FormField
                            control={form.control}
                            name="preferredDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>{t.formDateLabel}</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                        disabled={callNow}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>{t.formDatePlaceholder}</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < new Date(new Date().setDate(new Date().getDate() - 1)) 
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="preferredTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.formTimeLabel}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={callNow}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t.formTimePlaceholder} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeSlots.map(slot => (
                                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
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
        </div>
      </div>
    </div>
  );
}
