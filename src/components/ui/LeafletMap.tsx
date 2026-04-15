import React, { useEffect, useRef } from 'react';

interface LeafletMapProps {
  location: string;
  lat?: number;
  lng?: number;
}

declare global {
  interface Window {
    L: any;
  }
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ location, lat = 12.9716, lng = 77.5946 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Use a unique ID for each map container to prevent reuse errors
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([lat, lng], 14);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([lat, lng], 14);
    }

    // Always clear existing markers before adding a new one
    mapInstance.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    window.L.marker([lat, lng])
      .addTo(mapInstance.current)
      .bindPopup(`<b>${location}</b><br>Pickup Point`)
      .openPopup();

    return () => {
      // We keep the instance for faster switching, but we could destroy it if needed
    };
  }, [lat, lng, location]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '200px', 
        borderRadius: '8px', 
        border: '1px solid rgba(0,0,0,0.1)',
        marginBottom: '16px',
        zIndex: 1
      }} 
    />
  );
};
