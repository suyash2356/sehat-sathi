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
    { href: '/map', label: t.nav.map },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];
  
  const NavLink = ({ href, label, className, onClick }: { href: string; label: string, className?: string, onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void }) => (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-foreground/80',
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
  
  const SheetLanguageSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full text-left text-lg font-medium text-foreground/80 flex items-center gap-2">
          <Globe className="h-5 w-5" /> 
          <span>{t.menu[language]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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
                <div className="text-lg font-medium text-foreground/80 pl-0">
                  <SheetLanguageSelector />
                </div>
              </div>
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
