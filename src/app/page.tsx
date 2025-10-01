'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Zap, Sun, Utensils, Waves, PersonStanding } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

const precautionIcons = [
  <Waves key="water" className="h-10 w-10 text-primary" />,
  <Utensils key="food" className="h-10 w-10 text-primary" />,
  <PersonStanding key="hygiene" className="h-10 w-10 text-primary" />,
]

const healthyHabitIcons = [
  <Utensils key="diet" className="h-10 w-10 text-primary" />,
  <Zap key="exercise" className="h-10 w-10 text-primary" />,
  <Sun key="sleep" className="h-10 w-10 text-primary" />,
]

export default function Home() {
  const { language } = useChatLanguage();
  const t = translations[language].home;

  const precautions = [
    {
      title: t.precautions[0].title,
      description: t.precautions[0].description,
      icon: precautionIcons[0]
    },
    {
      title: t.precautions[1].title,
      description: t.precautions[1].description,
      icon: precautionIcons[1]
    },
    {
      title: t.precautions[2].title,
      description: t.precautions[2].description,
      icon: precautionIcons[2]
    },
  ];

  const healthyHabits = [
    {
      title: t.healthyHabits[0].title,
      description: t.healthyHabits[0].description,
      icon: healthyHabitIcons[0]
    },
    {
      title: t.healthyHabits[1].title,
      description: t.healthyHabits[1].description,
      icon: healthyHabitIcons[1]
    },
    {
      title: t.healthyHabits[2].title,
      description: t.healthyHabits[2].description,
      icon: healthyHabitIcons[2]
    },
  ];


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
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/login">{t.signIn}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/chatbot">{t.startChatting}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="precautions" className="py-16 md:py-24 bg-background">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.precautionsTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.precautionsSubtitle}
                </p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {precautions.map((item, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <CardHeader className="items-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {item.icon}
                  </div>
                  <CardTitle className="font-headline">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section id="healthy-habits" className="py-16 md:py-24 bg-card">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.healthyHabitsTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.healthyHabitsSubtitle}
                </p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {healthyHabits.map((item, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <CardHeader className="items-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {item.icon}
                  </div>
                  <CardTitle className="font-headline">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="guidelines" className="py-16 md:py-24 bg-background">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.guidelinesTitle}</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.guidelinesSubtitle}
            </p>
            <Button asChild className="mt-8" size="lg">
                <a href="https://www.mohfw.gov.in/" target="_blank" rel="noopener noreferrer">{t.guidelinesButton}</a>
            </Button>
          </div>
      </section>
    </>
  );
}
