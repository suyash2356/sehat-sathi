'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
