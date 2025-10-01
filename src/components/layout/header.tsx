'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, BotMessageSquare, Languages, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useChatLanguage, setChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/chatbot', label: 'Chatbot' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useChatLanguage();

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setChatLanguage(lang);
    setLanguage(lang); 
  };

  const NavLink = ({ href, label, className }: { href: string; label: string, className?: string }) => (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-foreground/80',
        className
      )}
      onClick={() => setIsOpen(false)}
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
            <span>{translations[language].menu[language]}</span>
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
          <span className="font-bold font-headline">Sehat Sathi</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="flex-1 hidden md:flex justify-end">
            <LanguageSelector />
        </div>
        <div className="flex flex-1 items-center justify-end md:hidden">
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
                <span className="font-bold font-headline">Sehat Sathi</span>
              </Link>
              <div className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} className="text-lg" />
                ))}
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
