
'use client';

import { useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { useVideoCall } from '@/hooks/use-video-call';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const doctorImage = PlaceHolderImages.find(p => p.id === 'tele-consultation');

export default function VideoCallPage() {
  const { language } = useChatLanguage();
  const t = translations[language].videoCall;
  
  const {
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    localStream,
    remoteStream,
    callData,
    error,
    toggleMute,
    toggleVideo,
    endCall
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Show error state
  if (error) {
    return (
      <div className="container py-8 h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTitle>Call Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Card className="w-full max-w-4xl h-full shadow-2xl flex flex-col">
        <CardContent className="p-4 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* Doctor's Video */}
          <div className="relative w-full h-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
            {remoteStream ? (
              <video 
                ref={remoteVideoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline 
              />
            ) : (
              <>
                {doctorImage && (
                  <Image
                    src={doctorImage.imageUrl}
                    alt="Doctor"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-80"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  {isConnecting ? (
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Connecting to doctor...</p>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <p>Waiting for doctor to join...</p>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {t.doctorName}
            </div>
          </div>
          
          {/* User's Video */}
          <div className="relative w-full h-full bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
            {localStream ? (
              <video 
                ref={localVideoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                playsInline 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
            
            {isVideoOff && localStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <VideoOff className="h-16 w-16 text-white/50"/>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              You
            </div>
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm p-3 rounded-full shadow-lg border">
              <Button 
                variant={isMuted ? 'destructive' : 'secondary'} 
                size="icon" 
                className="rounded-full h-14 w-14" 
                onClick={toggleMute}
                disabled={!localStream}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <Button 
                variant={isVideoOff ? 'destructive' : 'secondary'} 
                size="icon" 
                className="rounded-full h-14 w-14" 
                onClick={toggleVideo}
                disabled={!localStream}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="rounded-full h-14 w-14" 
                onClick={endCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          {isConnecting && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
              Connecting...
            </div>
          )}
          
          {isConnected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm">
              Connected
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
