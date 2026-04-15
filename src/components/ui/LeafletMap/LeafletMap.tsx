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

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    // Initialize map
    mapInstance.current = window.L.map(mapRef.current).setView([lat, lng], 14);

    // Google Maps Style Tile Layer (Leaflet compatible)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance.current);

    // Add Marker
    window.L.marker([lat, lng])
      .addTo(mapInstance.current)
      .bindPopup(`<b>${location}</b><br>Pickup Point`)
      .openPopup();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
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
