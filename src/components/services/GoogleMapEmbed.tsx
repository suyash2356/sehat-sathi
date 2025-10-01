'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Stethoscope } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const center = {
  lat: 18.5204,
  lng: 73.8567
};

export type Hospital = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact: string;
  specialties: string;
  timing: string;
};

interface GoogleMapEmbedProps {
  hospitals: Hospital[];
  onBookAppointment: (hospital: Hospital) => void;
  translations: {
    specialties: string;
    timings: string;
    contact: string;
    bookAppointment: string;
  }
}

export function GoogleMapEmbed({ hospitals, onBookAppointment, translations }: GoogleMapEmbedProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });

  const [selectedHospital, setSelectedHospital] = React.useState<Hospital | null>(null);

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return <div className="text-destructive font-semibold p-4 bg-destructive/10 rounded-md">The Google Maps API key is missing. Please add the `GOOGLE_MAPS_API_KEY` to your .env file and restart the server.</div>;
  }
  
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
    >
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.name}
          position={{ lat: hospital.lat, lng: hospital.lng }}
          onClick={() => setSelectedHospital(hospital)}
        />
      ))}

      {selectedHospital && (
        <InfoWindow
          position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }}
          onCloseClick={() => setSelectedHospital(null)}
        >
          <div className="p-1 max-w-xs space-y-2">
            <h4 className="font-bold text-base">{selectedHospital.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedHospital.address}</p>
            <div className="text-sm space-y-1">
                <p className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> <strong>{translations.specialties}:</strong> {selectedHospital.specialties}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> <strong>{translations.timings}:</strong> {selectedHospital.timing}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <strong>{translations.contact}:</strong> {selectedHospital.contact}</p>
            </div>
            <Button size="sm" className="w-full mt-2" onClick={() => onBookAppointment(selectedHospital)}>{translations.bookAppointment}</Button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
