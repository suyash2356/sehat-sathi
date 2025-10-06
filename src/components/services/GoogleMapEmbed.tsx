"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapPin } from "lucide-react";

// Export the Hospital interface to be used in other files
export interface Hospital {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact?: string;
  specialties?: string;
  timing?: string;
}

// Define props for the GoogleMapEmbed component, including the new props
interface GoogleMapEmbedProps {
  hospitals: Hospital[];
  onBookAppointment: (hospital: Hospital) => void;
  translations: {
    specialties: string;
    timings: string;
    contact: string;
    bookAppointment: string;
  };
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ hospitals, onBookAppointment, translations }) => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]); // Ref to hold marker instances for cleanup

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const center = useMemo(() => {
    if (hospitals.length > 0) {
      const totalLat = hospitals.reduce((sum, h) => sum + h.lat, 0);
      const totalLng = hospitals.reduce((sum, h) => sum + h.lng, 0);
      return { lat: totalLat / hospitals.length, lng: totalLng / hospitals.length };
    }
    return { lat: 20.5937, lng: 78.9629 }; // Default center of India
  }, [hospitals]);


  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!(window as any).google && googleMapsApiKey && googleMapsApiKey !== "AIzaSyCHeB5PCutbQyh1-LGq1IJOCa4zYHsPIdE") {
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap`;
            script.onerror = () => console.error("Google Maps script failed to load.");
            script.async = true;
            script.defer = true;
            (window as any).initMap = () => setMapLoaded(true);
            document.head.appendChild(script);
        } else if ((window as any).google) {
            setMapLoaded(true);
        }
      } else if ((window as any).google) {
        setMapLoaded(true);
      } else {
        setMapLoaded(true); // API key missing, render demo mode
      }
    };

    loadGoogleMapsScript();

    return () => {
      if ((window as any).initMap) {
        (window as any).initMap = null;
      }
    };
  }, [googleMapsApiKey]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && (window as any).google) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: center,
        zoom: hospitals.length > 1 ? 8 : 12,
      });
      setMapInstance(map);
    }
  }, [mapLoaded]); // Only runs when mapLoaded changes

  useEffect(() => {
    if (mapInstance) {
        if(hospitals.length > 0) {
            const bounds = new (window as any).google.maps.LatLngBounds();
            hospitals.forEach(hospital => {
                bounds.extend(new (window as any).google.maps.LatLng(hospital.lat, hospital.lng));
            });
            mapInstance.fitBounds(bounds);
            if (hospitals.length === 1) {
                const listener = (window as any).google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
                   if (mapInstance.getZoom() > 14) mapInstance.setZoom(14);
                });
                return () => {
                    (window as any).google.maps.event.removeListener(listener);
                };
            }
        } else {
             mapInstance.setCenter({ lat: 20.5937, lng: 78.9629 });
             mapInstance.setZoom(5);
        }

      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      const infoWindow = new (window as any).google.maps.InfoWindow();

      hospitals.forEach((hospital) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: hospital.lat, lng: hospital.lng },
          map: mapInstance,
          title: hospital.name,
        });

        const content = `
          <div style="color: #333; font-family: Arial, sans-serif; padding: 5px">
            <h4 style="margin: 0 0 5px 0; font-weight: bold;">${hospital.name}</h4>
            <p style="margin: 0 0 5px 0;">${hospital.address}</p>
            ${hospital.specialties ? `<p style="margin: 0 0 5px 0;"><strong>${translations.specialties}:</strong> ${hospital.specialties}</p>` : ''}
            ${hospital.timing ? `<p style="margin: 0 0 5px 0;"><strong>${translations.timings}:</strong> ${hospital.timing}</p>` : ''}
            ${hospital.contact ? `<p style="margin: 0 0 10px 0;"><strong>${translations.contact}:</strong> ${hospital.contact}</p>` : ''}
            <button id="book-appointment-btn-${hospital.id}" class="map-book-button">${translations.bookAppointment}</button>
          </div>
        `;
        
        marker.addListener('click', () => {
          infoWindow.setContent(content);
          infoWindow.open(mapInstance, marker);
          
          (window as any).google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            const btn = document.getElementById(`book-appointment-btn-${hospital.id}`);
            if (btn) {
              btn.addEventListener('click', () => {
                onBookAppointment(hospital);
              });
            }
          });
        });

        markersRef.current.push(marker);
      });
    }
  }, [mapInstance, hospitals, translations, onBookAppointment]);

  return (
    <div className="relative">
      {!googleMapsApiKey || googleMapsApiKey === "AIzaSyCHeB5PCutbQyh1-LGq1IJOCa4zYHsPIdE" ? (
        <div className="w-full h-full min-h-[400px] rounded-lg border bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Interactive Map Unavailable
            </h3>
            <p className="text-sm text-gray-600">
              A valid Google Maps API key is required to display the live map. Please configure it in your environment variables.
            </p>
          </div>
        </div>
      ) : mapLoaded ? (
        <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg border" />
      ) : (
        <div className="w-full h-full min-h-[400px] rounded-lg border bg-gray-100 flex items-center justify-center">
          Loading Map...
        </div>
      )}
       <style jsx global>{`
        .map-book-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .map-book-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default GoogleMapEmbed;
