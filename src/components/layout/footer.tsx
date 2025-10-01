import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/chatbot', label: 'Chatbot' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">Sehat Sathi</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/80 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border pt-8">
          <p className="font-semibold">
            Disclaimer: This chatbot provides general health guidance. For emergencies, please visit a certified doctor or hospital.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Sehat Sathi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
