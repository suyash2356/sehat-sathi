'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const center = {
  lat: 18.5204,
  lng: 73.8567
};

type Hospital = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

interface GoogleMapEmbedProps {
  hospitals: Hospital[];
}

export function GoogleMapEmbed({ hospitals }: GoogleMapEmbedProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });

  const [selectedHospital, setSelectedHospital] = React.useState<Hospital | null>(null);

  if (!isLoaded) return <div>Loading map...</div>;
  if (!process.env.GOOGLE_MAPS_API_KEY) return <div className="text-destructive font-semibold">Google Maps API key is missing. Please add it to your .env file.</div>;

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
          <div className="p-1">
            <h4 className="font-bold text-base">{selectedHospital.name}</h4>
            <p className="text-sm text-muted-foreground">{selectedHospital.address}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
