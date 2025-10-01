
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Menu, X, BotMessageSquare, Globe, LogOut, User as UserIcon, ShieldPlus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useChatLanguage, setChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Separator } from '../ui/separator';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { language, setLanguage } = useChatLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
    router.push('/');
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setChatLanguage(lang);
    setLanguage(lang); 
  };
  
  const t = translations[language];

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
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
              <BotMessageSquare className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold font-headline">{t.appName}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <LanguageSelector />
            {user ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
            </Button>
            ) : (
            pathname !== '/login' && (
                <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
                </Button>
            )
            )}
        </div>
      </div>
    </header>
  );
}
