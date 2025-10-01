import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, Users, Hospital, Languages } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const featureCards = [
  {
    icon: <Stethoscope className="h-8 w-8 text-primary" />,
    title: 'Basic First Aid Guidance',
    description: 'Get instant advice for common injuries and health issues.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Free Tele-Consultation Booking',
    description: 'Easily schedule a virtual appointment with a qualified doctor.',
  },
  {
    icon: <Hospital className="h-8 w-8 text-primary" />,
    title: 'Nearby Hospitals & Clinics Info',
    description: 'Find contact details and locations of healthcare centers near you.',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Supports Local Languages',
    description: 'Accessible in multiple languages for wider reach and understanding.',
  },
];

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

export default function Home() {
  return (
    <>
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center">
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
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-md font-headline">
            Your Health Assistant, Anytime, Anywhere
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90 drop-shadow">
            Providing rural India with instant, reliable healthcare guidance.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full px-8 py-6 text-lg">
            <Link href="/chatbot">Start Chatting</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="items-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                  <CardDescription className="pt-2">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
