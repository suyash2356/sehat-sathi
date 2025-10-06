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
import { Video, Hospital, CalendarIcon, Clock, Zap, MapPin } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import GoogleMapEmbed, { type Hospital as HospitalType } from '@/components/services/GoogleMapEmbed';
import React, { useState, useMemo, Suspense } from 'react';
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
    message: 'Please select a hospital for a hospital visit.',
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

const allHospitals: (HospitalType & { state: string; district: string; village: string; })[] = [
    { id: 1, name: 'Community Health Centre, Ranka', address: 'Ranka, Garhwa, Jharkhand', lat: 23.97, lng: 83.75, specialties: 'General Medicine', timing: '24/7 Emergency', contact: '104', state: 'Jharkhand', district: 'Garhwa', village: 'Ranka' },
    { id: 2, name: 'Community Health Centre, Bhandaria', address: 'Bhandaria, Garhwa, Jharkhand', lat: 23.73, lng: 83.98, specialties: 'Primary Care', timing: '9 AM - 5 PM', contact: '104', state: 'Jharkhand', district: 'Garhwa', village: 'Bhandaria' },
    { id: 3, name: 'Community Health Center, Itkhori', address: 'Itkhori, Chatra, Jharkhand', lat: 24.30, lng: 84.82, specialties: 'General Medicine', timing: '24/7 Emergency', contact: '104', state: 'Jharkhand', district: 'Chatra', village: 'Itkhori' },
    { id: 4, name: 'Community Health Center, Hunterganj', address: 'Hunterganj, Chatra, Jharkhand', lat: 24.40, lng: 84.58, specialties: 'Primary Care', timing: '9 AM - 5 PM', contact: '104', state: 'Jharkhand', district: 'Chatra', village: 'Hunterganj' },
    { id: 5, name: 'Rural Hospital, Akkalkuwa', address: 'Akkalkuwa, Nandurbar, Maharashtra', lat: 21.56, lng: 74.05, specialties: 'General Medicine', timing: '24/7 Emergency', contact: '104', state: 'Maharashtra', district: 'Nandurbar', village: 'Akkalkuwa' },
    { id: 6, name: 'Rural Hospital, Dhadgaon', address: 'Dhadgaon, Nandurbar, Maharashtra', lat: 21.78, lng: 74.32, specialties: 'Primary Care', timing: '9 AM - 5 PM', contact: '104', state: 'Maharashtra', district: 'Nandurbar', village: 'Dhadgaon' },
    { id: 7, name: 'Sub-District Hospital, Bhamragad', address: 'Bhamragad, Gadchiroli, Maharashtra', lat: 19.25, lng: 80.35, specialties: 'General Medicine', timing: '24/7 Emergency', contact: '104', state: 'Maharashtra', district: 'Gadchiroli', village: 'Bhamragad' },
    { id: 8, name: 'Community Health Center, Etapalli', address: 'Etapalli, Gadchiroli, Maharashtra', lat: 19.41, lng: 80.29, specialties: 'Primary Care', timing: '9 AM - 5 PM', contact: '104', state: 'Maharashtra', district: 'Gadchiroli', village: 'Etapalli' },
];

const locationData = {
    'Jharkhand': {
        'Garhwa': ['Ranka', 'Bhandaria'],
        'Chatra': ['Itkhori', 'Hunterganj']
    },
    'Maharashtra': {
        'Nandurbar': ['Akkalkuwa', 'Dhadgaon'],
        'Gadchiroli': ['Bhamragad', 'Etapalli']
    }
};

function MapPageContent() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].services;
  const bookingFormRef = React.useRef<HTMLDivElement>(null);
  const { createImmediateCall, createScheduledCall } = useVideoCall();

  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const districts = selectedState ? Object.keys(locationData[selectedState as keyof typeof locationData] || {}) : [];
  const villages = selectedState && selectedDistrict ? locationData[selectedState as keyof typeof locationData][selectedDistrict as keyof typeof locationData[keyof typeof locationData]] || [] : [];

  const filteredHospitals = useMemo(() => {
    if (!selectedState && !selectedDistrict && !selectedVillage) {
      return allHospitals;
    }
    return allHospitals.filter(h => 
      (!selectedState || h.state === selectedState) &&
      (!selectedDistrict || h.district === selectedDistrict) &&
      (!selectedVillage || h.village === selectedVillage)
    );
  }, [selectedState, selectedDistrict, selectedVillage]);

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
    if (values.appointmentType === 'hospital-visit') {
        toast({
          title: t.bookingToastTitle,
          description: "Your request has been sent to the hospital. You will be notified upon confirmation.",
        });
    } else { 
        const patientData = { patientId: `patient_${Date.now()}`, patientName: values.name, patientPhone: values.phone, issue: values.issue };
        if (values.callNow) {
            await createImmediateCall(patientData);
        } else {
            const scheduledTime = new Date(values.preferredDate!);
            const [startTime] = values.preferredTime!.split(' - ');
            const [timePart, ampm] = startTime.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            scheduledTime.setHours(hour24, parseInt(minutes), 0, 0);
            await createScheduledCall({ ...patientData, scheduledTime });
        }
    }
    form.reset();
  }
  
  const handleBookAppointment = (hospital: HospitalType) => {
    form.setValue('hospital', hospital.name);
    form.setValue('appointmentType', 'hospital-visit');
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    toast({ title: "Hospital Selected", description: `Scroll down to fill the booking form for ${hospital.name}.` });
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
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t.locatorDescription}
        </p>
      </div>
      
      <div className="grid gap-12">
        <Card className="shadow-lg">
          <CardHeader>
              <div className="flex items-center gap-4">
                <MapPin className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-headline">Find Hospitals Near You</CardTitle>
              </div>
              <CardDescription className="pt-2">
                Select your location to see nearby hospitals on the map and in a list below.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Select onValueChange={value => { setSelectedState(value); setSelectedDistrict(''); setSelectedVillage(''); }} value={selectedState}>
                  <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                  <SelectContent>{Object.keys(locationData).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={value => { setSelectedDistrict(value); setSelectedVillage(''); }} value={selectedDistrict} disabled={!selectedState}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={setSelectedVillage} value={selectedVillage} disabled={!selectedDistrict}>
                  <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
                  <SelectContent>{villages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-sm text-center text-muted-foreground -mt-2">More states will be added soon.</p>
            <div className="aspect-[16/9] rounded-lg overflow-hidden border">
                <GoogleMapEmbed 
                    hospitals={filteredHospitals} 
                    onBookAppointment={handleBookAppointment}
                    translations={{ specialties: t.mapSpecialties, timings: t.mapTimings, contact: t.mapContact, bookAppointment: t.mapButton }}
                />
            </div>
          </CardContent>
        </Card>

        {filteredHospitals.length > 0 && (selectedState || selectedDistrict || selectedVillage) && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Nearby Hospitals</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {filteredHospitals.map(hospital => (
                        <div key={hospital.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-bold text-lg">{hospital.name}</h3>
                                <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                <p className="text-sm">Specialties: {hospital.specialties}</p>
                            </div>
                            <Button onClick={() => handleBookAppointment(hospital)}>Book Appointment</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        <div ref={bookingFormRef}>
            <Card className="shadow-lg overflow-hidden">
            <CardHeader>
                <div className="flex items-center gap-4">
                <Video className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-headline">{t.bookingTitle}</CardTitle>
                </div>
                <CardDescription className="pt-2">{t.bookingDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="appointmentType" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t.formAppointmentTypeLabel}</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="video-call" /></FormControl><FormLabel className="font-normal">{t.formAppointmentTypeVideo}</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="hospital-visit" /></FormControl><FormLabel className="font-normal">{t.formAppointmentTypeHospital}</FormLabel></FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t.formNameLabel}</FormLabel><FormControl><Input placeholder={t.formNamePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t.formPhoneLabel}</FormLabel><FormControl><Input type="tel" placeholder={t.formPhonePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    {appointmentType === 'hospital-visit' && (<FormField control={form.control} name="hospital" render={({ field }) => (<FormItem><FormLabel>{t.formHospitalLabel}</FormLabel><FormControl><Input placeholder={t.formHospitalPlaceholder} {...field} disabled /></FormControl><FormMessage /></FormItem>)}/>)}
                    {appointmentType === 'video-call' && (
                      <div className="space-y-6 rounded-lg border p-4">
                        <FormField control={form.control} name="callNow" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-primary/10"><div className="space-y-0.5"><FormLabel className="text-base flex items-center gap-2"><Zap className="text-amber-500" /> {t.formCallNowLabel}</FormLabel><FormDescription>{t.formCallNowDescription}</FormDescription></div><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                        <div className={cn("space-y-6", callNow ? "opacity-50" : "")}>
                          <FormField control={form.control} name="preferredDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t.formDateLabel}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={callNow}>{field.value ? format(field.value, "PPP") : <span>{t.formDatePlaceholder}</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                          <FormField control={form.control} name="preferredTime" render={({ field }) => (<FormItem><FormLabel>{t.formTimeLabel}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={callNow}><FormControl><SelectTrigger><SelectValue placeholder={t.formTimePlaceholder} /></SelectTrigger></FormControl><SelectContent>{timeSlots.map(slot => (<SelectItem key={slot} value={slot}>{slot}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
                        </div>
                      </div>
                    )}
                    <FormField control={form.control} name="issue" render={({ field }) => (<FormItem><FormLabel>{t.formIssueLabel}</FormLabel><FormControl><Textarea placeholder={t.formIssuePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <Button type="submit">{appointmentType === 'hospital-visit' ? t.bookingButton : (callNow ? 'Start Immediate Call' : 'Schedule Video Call')}</Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MapPageContent />
        </Suspense>
    )
}
