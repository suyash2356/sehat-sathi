'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Stethoscope, MapPin } from 'lucide-react';

export type Hospital = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact: string;
  specialties: string;
  timing: string;
};

interface GeoapifyMapEmbedProps {
  hospitals: Hospital[];
  onBookAppointment: (hospital: Hospital) => void;
  translations: {
    specialties: string;
    timings: string;
    contact: string;
    bookAppointment: string;
  }
}

export function GoogleMapEmbed({ hospitals, onBookAppointment, translations }: GeoapifyMapEmbedProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const center = [18.5204, 73.8567]; // Pune coordinates [lat, lng]

  useEffect(() => {
    // Always show demo mode for now to avoid loading issues
    setMapLoaded(true);
    return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      // Initialize map after Leaflet is loaded
      const L = (window as any).L;
      if (L) {
        const map = L.map('map-container').setView(center, 10);

        // Add Geoapify tile layer
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyApiKey}`, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20
        }).addTo(map);

        // Add hospital markers
        hospitals.forEach((hospital) => {
          const marker = L.marker([hospital.lat, hospital.lng]).addTo(map);
          
          marker.bindPopup(`
            <div class="p-2 max-w-xs space-y-2">
              <h4 class="font-bold text-base">${hospital.name}</h4>
              <p class="text-sm text-gray-600">${hospital.address}</p>
              <div class="text-sm space-y-1">
                <p class="flex items-center gap-2">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <strong>${translations.specialties}:</strong> ${hospital.specialties}
                </p>
                <p class="flex items-center gap-2">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <strong>${translations.timings}:</strong> ${hospital.timing}
                </p>
                <p class="flex items-center gap-2">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <strong>${translations.contact}:</strong> ${hospital.contact}
                </p>
              </div>
              <button 
                onclick="window.bookHospital('${hospital.name}')" 
                class="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                ${translations.bookAppointment}
              </button>
            </div>
          `);
        });

        // Make bookHospital function globally available
        (window as any).bookHospital = (hospitalName: string) => {
          const hospital = hospitals.find(h => h.name === hospitalName);
          if (hospital) {
            onBookAppointment(hospital);
          }
        };

        setMapLoaded(true);
      }
    };
    script.onerror = () => {
      setMapError('Failed to load map library. Please check your internet connection.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    };
  }, [geoapifyApiKey, hospitals, translations, onBookAppointment]);

  if (mapError) {
    return (
      <div className="text-destructive font-semibold p-4 bg-destructive/10 rounded-md">
        {mapError}
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Demo mode - show static map placeholder
  if (!geoapifyApiKey || geoapifyApiKey === 'your_geoapify_api_key_here') {
    return (
      <div className="relative">
        <div className="w-full h-96 rounded-lg border bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
            <p className="text-sm text-gray-600 mb-4">Add your Geoapify API key to see the live map</p>
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <p className="text-xs text-gray-500">Demo Mode Active</p>
            </div>
          </div>
        </div>
        
        {/* Hospital List */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-lg mb-3">Nearby Hospitals</h3>
          {hospitals.map((hospital) => (
            <div 
              key={hospital.name}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedHospital(hospital)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{hospital.name}</h4>
                  <p className="text-xs text-gray-600 mb-1">{hospital.address}</p>
                  <div className="text-xs space-y-1">
                    <p className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-primary" />
                      <strong>{translations.specialties}:</strong> {hospital.specialties}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      <strong>{translations.timings}:</strong> {hospital.timing}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-primary" />
                      <strong>{translations.contact}:</strong> {hospital.contact}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-2 text-xs" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookAppointment(hospital);
                    }}
                  >
                    {translations.bookAppointment}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div id="map-container" className="w-full h-96 rounded-lg border"></div>
      
      {/* Hospital List */}
      <div className="mt-4 space-y-2">
        <h3 className="font-semibold text-lg mb-3">Nearby Hospitals</h3>
        {hospitals.map((hospital) => (
          <div 
            key={hospital.name}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => setSelectedHospital(hospital)}
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{hospital.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{hospital.address}</p>
                <div className="text-xs space-y-1">
                  <p className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3 text-primary" />
                    <strong>{translations.specialties}:</strong> {hospital.specialties}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <strong>{translations.timings}:</strong> {hospital.timing}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-primary" />
                    <strong>{translations.contact}:</strong> {hospital.contact}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookAppointment(hospital);
                  }}
                >
                  {translations.bookAppointment}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
