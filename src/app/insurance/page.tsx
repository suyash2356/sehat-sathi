
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldPlus, PlusCircle, List } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

export default function InsurancePage() {
  const { language } = useChatLanguage();
  const t = translations[language].insurance;

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-3">
            <ShieldPlus className="h-8 w-8 text-primary"/>
            {t.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Feature Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t.description}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button disabled className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t.addPolicy}
            </Button>
            <Button disabled variant="secondary" className="w-full sm:w-auto">
                <List className="mr-2 h-4 w-4" />
              {t.viewPolicies}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
