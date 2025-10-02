
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signOut, type User } from 'firebase/auth';
import { Menu, X, BotMessageSquare, Globe, LogOut, User as UserIcon, ShieldPlus, Bell, Siren, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useChatLanguage, setChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-firebase';


const emergencySchema = z.object({
  location: z.string().min(10, { message: 'Please provide a detailed address or landmark.' }),
  reason: z.string().min(5, { message: 'Please briefly describe the emergency.' }),
  contact: z.string().regex(/^\d{10}$/, { message: 'A 10-digit contact number is required.' }),
});

type EmergencyFormValues = z.infer<typeof emergencySchema>;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const { language, setLanguage } = useChatLanguage();
  const { toast } = useToast();
  const [isEmergencyFormOpen, setIsEmergencyFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState<EmergencyFormValues | null>(null);

  const isLandingPage = pathname === '/';
  const t = translations[language];

  const form = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      location: '',
      reason: '',
      contact: '',
    },
  });

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({
      title: t.logout.title,
      description: t.logout.description,
    });
    router.push('/');
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setChatLanguage(lang);
    setLanguage(lang); 
  };

  const onEmergencySubmit = (values: EmergencyFormValues) => {
    setEmergencyDetails(values);
    setIsEmergencyFormOpen(false);
    setIsConfirmationOpen(true);
  }

  const confirmEmergencyCall = () => {
    console.log('Emergency Confirmed:', emergencyDetails);
    setIsConfirmationOpen(false);
    form.reset();
    toast({
      title: t.emergency.toastTitle,
      description: t.emergency.toastDescription,
    });
  }

  const navItems = [
    { href: '/health-guide', label: t.nav.home },
    { href: '/chatbot', label: t.nav.chatbot },
    { href: '/services', label: t.nav.services },
    { href: '/map', label: t.nav.map },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  const profileNavItem = { href: '/profile', label: t.nav.profile, icon: <UserIcon className="h-5 w-5" /> };
  const insuranceNavItem = { href: '/insurance', label: t.nav.insurance, icon: <ShieldPlus className="h-5 w-5" /> };
  
  const NavLink = ({ href, label, className, onClick, icon }: { href: string; label: string, className?: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void, icon?: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary flex items-center gap-3',
        pathname === href ? 'text-primary' : 'text-foreground/80',
        className
      )}
      onClick={(e) => {
        if(onClick) onClick(e);
        setIsOpen(false)
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
  
  const LanguageSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="gap-2">
          <Globe className="h-5 w-5" /> 
          <span className="sr-only">Select Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          {translations.en.menu.english}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('hi')}>
          {translations.hi.menu.hindi}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('mr')}>
          {translations.mr.menu.marathi}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-start">
          {!isLandingPage && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 flex flex-col">
                <SheetHeader>
                    <SheetTitle>
                        <VisuallyHidden>Navigation Menu</VisuallyHidden>
                    </SheetTitle>
                </SheetHeader>
                <Link
                  href="/"
                  className="flex items-center mb-8"
                  onClick={() => setIsOpen(false)}
                >
                  <BotMessageSquare className="h-6 w-6 mr-2 text-primary" />
                  <span className="font-bold font-headline">{t.appName}</span>
                </Link>
                <div className="flex flex-col space-y-6 flex-grow">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} className="text-lg" />
                  ))}
                </div>

                {(user) && (
                  <div className="mt-auto border-t pt-4 space-y-6">
                     <NavLink 
                      href={profileNavItem.href} 
                      label={profileNavItem.label} 
                      icon={profileNavItem.icon}
                      className="text-lg"
                    />
                     <NavLink 
                      href={insuranceNavItem.href} 
                      label={insuranceNavItem.label} 
                      icon={insuranceNavItem.icon}
                      className="text-lg"
                    />
                  </div>
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
              <BotMessageSquare className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold font-headline">{t.appName}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 md:gap-2">
            {!isLandingPage && (
              <>
                <Dialog open={isEmergencyFormOpen} onOpenChange={setIsEmergencyFormOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="rounded-full">
                      <Siren className="h-5 w-5" />
                      <span className="sr-only">{t.emergency.buttonText}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 font-headline text-destructive">
                        <Siren /> {t.emergency.formTitle}
                      </DialogTitle>
                      <DialogDescription>
                        {t.emergency.formDescription}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onEmergencySubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {t.emergency.locationLabel}</FormLabel>
                              <FormControl>
                                <Textarea placeholder={t.emergency.locationPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {t.emergency.reasonLabel}</FormLabel>
                              <FormControl>
                                <Input placeholder={t.emergency.reasonPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> {t.emergency.contactLabel}</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder={t.emergency.contactPlaceholder} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" variant="destructive" className="w-full">{t.emergency.submitButton}</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 font-headline">
                        <AlertTriangle className="text-destructive" /> {t.emergency.confirmTitle}
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div>
                          {t.emergency.confirmMessage}
                          <div className="my-4 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-center">
                              <div className="font-semibold text-destructive">{t.emergency.emergencyNumberText}</div>
                              <div className="text-2xl font-bold tracking-widest text-destructive">112</div>
                          </div>
                          {t.emergency.confirmSubtext}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.emergency.cancelButton}</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmEmergencyCall} className="bg-destructive hover:bg-destructive/90">
                        {t.emergency.confirmButton}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon" aria-label={t.notificationsAriaLabel}>
                  <Bell className="h-5 w-5" />
                </Button>
                <LanguageSelector />
              </>
            )}
            {user && !isLandingPage ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t.logout.ariaLabel}>
                  <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              pathname !== '/login' && (
                  <Button asChild variant="outline" size="sm">
                  <Link href="/login">{t.login.title}</Link>
                  </Button>
              )
            )}
        </div>
      </div>
    </header>
  );
}
