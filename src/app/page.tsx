'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Stethoscope, Users, Hospital, ShieldCheck, HeartPulse, Baby } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const initiativeIcons = [
  <HeartPulse key="ayushman" className="h-10 w-10 text-primary" />,
  <ShieldCheck key="mission" className="h-10 w-10 text-primary" />,
  <Baby key="matru" className="h-10 w-10 text-primary" />,
];

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

export default function Home() {
  const { language } = useChatLanguage();
  const t = translations[language];

  const initiatives = [
    {
      title: "Ayushman Bharat",
      description: "A flagship scheme of Government of India to achieve the vision of Universal Health Coverage (UHC).",
      icon: initiativeIcons[0]
    },
    {
      title: "National Health Mission",
      description: "Aims to provide universal access to equitable, affordable, and quality health care services.",
      icon: initiativeIcons[1]
    },
    {
      title: "Pradhan Mantri Matru Vandana Yojana",
      description: "A maternity benefit program run by the government of India.",
      icon: initiativeIcons[2]
    },
  ]

  return (
    <>
      <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover object-center"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4 text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-md font-headline">
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
            {t.home.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/login">{t.home.signIn}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/chatbot">{t.home.startChatting}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="initiatives" className="py-16 md:py-24 bg-background">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Government Health Initiatives</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Learn about key programs aimed at improving public health across the nation.
                </p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initiatives.map((initiative, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <CardHeader className="items-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {initiative.icon}
                  </div>
                  <CardTitle className="font-headline">{initiative.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{initiative.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
