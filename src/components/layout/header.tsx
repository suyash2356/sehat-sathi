'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Menu, X, BotMessageSquare, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useChatLanguage, setChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';

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
    { href: '/', label: t.nav.home },
    { href: '/chatbot', label: t.nav.chatbot },
    { href: '/services', label: t.nav.services },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];
  
  const handleMapClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (pathname !== '/services') {
      router.push('/services#hospital-locator');
    } else {
      e.preventDefault();
      const mapElement = document.getElementById('hospital-locator');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const NavLink = ({ href, label, className, onClick }: { href: string; label: string, className?: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void }) => (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary',
        pathname === href && !onClick ? 'text-primary' : 'text-foreground/80',
        className
      )}
      onClick={(e) => {
        if(onClick) onClick(e);
        setIsOpen(false)
      }}
    >
      {label}
    </Link>
  );
  
  const LanguageSelector = ({ inSheet = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("gap-2", inSheet ? 'justify-start w-full px-0' : '')}>
          <Globe className="h-5 w-5" /> 
          {!inSheet && (
            <span>{t.menu[language]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={inSheet ? "start" : "end"}>
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
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">{t.appName}</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
           <NavLink href="/services#hospital-locator" label={t.nav.map} onClick={handleMapClick} />
        </nav>
        <div className="flex-1 flex justify-end items-center gap-2">
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
        <div className="flex items-center md:hidden">
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
            <SheetContent side="left" className="pr-0">
              <Link
                href="/"
                className="flex items-center mb-8"
                onClick={() => setIsOpen(false)}
              >
                <BotMessageSquare className="h-6 w-6 mr-2 text-primary" />
                <span className="font-bold font-headline">{t.appName}</span>
              </Link>
              <div className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} className="text-lg" />
                ))}
                 <NavLink href="/services#hospital-locator" label={t.nav.map} className="text-lg" onClick={handleMapClick} />
                <div className="text-lg font-medium text-foreground/80 pl-0">
                  <LanguageSelector inSheet={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
