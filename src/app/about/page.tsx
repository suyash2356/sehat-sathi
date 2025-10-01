import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Target, Lightbulb, Users, HeartPulse } from 'lucide-react';

const aboutImage = PlaceHolderImages.find(p => p.id === 'about-us');

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">About Sehat Sathi</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          Bridging the healthcare gap in rural India with technology.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <Target className="h-6 w-6 text-destructive" />
                The Problem We Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                India faces an 80% shortfall of specialists in rural Community Health Centers.
              </p>
              <p className="mt-2 text-muted-foreground">
                This critical gap means millions lack access to timely and reliable medical advice, leading to preventable health complications. Distance, cost, and lack of information are major barriers to quality healthcare.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <Lightbulb className="h-6 w-6 text-primary" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                An AI-powered chatbot on a mobile-friendly website.
              </p>
              <p className="mt-2 text-muted-foreground">
                Sehat Sathi provides instant, accessible, and easy-to-understand health guidance. By leveraging AI and supporting local languages, we put a virtual health assistant in everyone's pocket, breaking down barriers to information.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="relative h-80 md:h-[450px] w-full rounded-lg overflow-hidden shadow-lg">
            {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                fill
                className="object-cover"
                data-ai-hint={aboutImage.imageHint}
              />
            )}
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-8 bg-card p-8 rounded-lg shadow-md">
        <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><Users className="text-accent"/> Our Mission</h2>
            <p className="text-muted-foreground">To empower individuals in rural communities with the knowledge and tools to make informed decisions about their health, ensuring no one is left behind due to a lack of access.</p>
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><HeartPulse className="text-accent"/> Our Vision</h2>
            <p className="text-muted-foreground">A future where every person in rural India has immediate access to primary healthcare guidance, leading to healthier communities and a stronger nation.</p>
        </div>
      </div>
    </div>
  );
}
