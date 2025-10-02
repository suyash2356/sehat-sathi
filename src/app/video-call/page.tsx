
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const doctorImage = PlaceHolderImages.find(p => p.id === 'tele-consultation');

export default function VideoCallPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].videoCall;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t.permissionDeniedTitle,
          description: t.permissionDeniedDescription,
        });
      }
    };

    getCameraPermission();

    return () => {
      // Cleanup: stop media tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast, t]);

  const toggleMic = () => {
     if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  };

  const endCall = () => {
    toast({
      title: t.callEndedTitle,
      description: t.callEndedDescription,
    });
    router.push('/map');
  };

  return (
    <div className="container py-8 h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Card className="w-full max-w-4xl h-full shadow-2xl flex flex-col">
        <CardContent className="p-4 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* Doctor's Video */}
          <div className="relative w-full h-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
            {doctorImage && (
                 <Image
                    src={doctorImage.imageUrl}
                    alt="Doctor"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-80"
                />
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {t.doctorName}
            </div>
          </div>
          
          {/* User's Video */}
          <div className="relative w-full h-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-sm">
                        <AlertTitle>{t.cameraRequiredTitle}</AlertTitle>
                        <AlertDescription>
                           {t.cameraRequiredDescription}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            {isCameraOff && hasCameraPermission && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <VideoOff className="h-16 w-16 text-white/50"/>
                </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg border">
              <Button variant={isMicMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14" onClick={toggleMic}>
                {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button variant={isCameraOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14" onClick={toggleCamera}>
                {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={endCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
