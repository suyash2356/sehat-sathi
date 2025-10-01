
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, FileText, Users } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

export default function ProfilePage() {
  const { language } = useChatLanguage();
  const t = translations[language].profile;

  const profileSections = [
    {
      title: t.healthDetailsTitle,
      description: t.healthDetailsDescription,
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      title: t.documentsTitle,
      description: t.documentsDescription,
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      title: t.familyTitle,
      description: t.familyDescription,
      icon: <Users className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {profileSections.map((section, index) => (
          <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
            <CardHeader className="items-center p-6">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                {section.icon}
              </div>
              <CardTitle className="font-headline">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
