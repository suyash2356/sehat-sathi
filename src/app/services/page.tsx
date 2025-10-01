
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, ShieldCheck, Baby, ShieldPlus, Syringe, Activity } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const initiativeIcons = [
  <HeartPulse key="ayushman" className="h-12 w-12 text-primary" />,
  <ShieldCheck key="mission" className="h-12 w-12 text-primary" />,
  <Baby key="matru" className="h-12 w-12 text-primary" />,
  <ShieldPlus key="jssk" className="h-12 w-12 text-primary" />,
  <Syringe key="rbsk" className="h-12 w-12 text-primary" />,
  <Activity key="ntcp" className="h-12 w-12 text-primary" />,
];

export default function ServicesPage() {
  const { language } = useChatLanguage();
  const t = translations[language].services;

  const initiatives = t.initiatives.map((initiative, index) => ({
    ...initiative,
    icon: initiativeIcons[index],
  }));

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.initiativesTitle}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t.initiativesSubtitle}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col bg-card">
              <CardHeader className="items-center p-6">
                <div className="p-5 bg-primary/10 rounded-full mb-4">
                  {initiative.icon}
                </div>
                <CardTitle className="font-headline text-xl">{initiative.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{initiative.description}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
