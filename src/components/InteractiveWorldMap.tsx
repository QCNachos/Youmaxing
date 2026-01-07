'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { MapPin, Plus, Star } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface VisitedPlace {
  id: string;
  country: string;
  city?: string;
  year: number;
  emoji: string;
  coordinates: { x: number; y: number };
  notes?: string;
  rating?: number;
}

interface InteractiveWorldMapProps {
  visitedPlaces: VisitedPlace[];
  color?: string;
  onAddPlace?: () => void;
  onPlaceClick?: (place: VisitedPlace) => void;
  clickToAdd?: boolean;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Coordinates are now stored as actual lat/lng, not percentages
// coordinates.x = longitude, coordinates.y = latitude
function getLatLng(coordinates: { x: number; y: number }): [number, number] {
  // If values look like old percentage system (0-100), convert them
  if (coordinates.x >= -180 && coordinates.x <= 180 && 
      coordinates.y >= -90 && coordinates.y <= 90) {
    // Already in lat/lng format
    return [coordinates.y, coordinates.x]; // [lat, lng]
  }
  
  // Old percentage format, convert it
  const lng = (coordinates.x - 50) * 3.6; // -180 to 180
  const lat = (50 - coordinates.y) * 1.7; // 85 to -85
  return [lat, lng];
}

export function InteractiveWorldMap({
  visitedPlaces,
  color = '#06B6D4',
  onAddPlace,
  onPlaceClick,
  clickToAdd = false,
}: InteractiveWorldMapProps) {
  const { theme } = useAppStore();
  const [selectedPlace, setSelectedPlace] = useState<VisitedPlace | null>(null);
  const [mounted, setMounted] = useState(false);

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';
  const cardBg = theme === 'light' ? 'bg-white/90 border-slate-200/50' : 'bg-slate-900/90 border-white/10';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full aspect-[2/1] rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
        <p className={cn("text-sm", textSecondary)}>Loading map...</p>
      </div>
    );
  }

  const handlePlaceClick = (place: VisitedPlace) => {
    setSelectedPlace(place);
    onPlaceClick?.(place);
  };

  // Custom marker icon - smaller and better positioned
  const createCustomIcon = (emoji: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        ">
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 13px;
              line-height: 1;
              margin-top: -2px;
            ">${emoji}</span>
          </div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 38], // Fixed: anchor at the tip of the pin
      popupAnchor: [0, -38],
    });
  };

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{ color }} />
          <h3 className={cn("font-semibold", textPrimary)}>
            Interactive World Map
          </h3>
          <Badge variant="secondary" style={{ backgroundColor: `${color}20`, color }}>
            {visitedPlaces.length} {visitedPlaces.length === 1 ? 'place' : 'places'}
          </Badge>
        </div>
        {onAddPlace && (
          <Button onClick={onAddPlace} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Place
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '500px', width: '100%' }}
          scrollWheelZoom={true}
          className="z-0 leaflet-map-custom"
          attributionControl={true}
        >
          <TileLayer
            attribution='<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            url={
              theme === 'light'
                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
          />

          {/* Map click handler */}
          {clickToAdd && <MapClickHandler />}

          {/* Place markers */}
          {visitedPlaces.map((place) => {
            const [lat, lng] = getLatLng(place.coordinates);
            return (
              <Marker
                key={place.id}
                position={[lat, lng]}
                icon={createCustomIcon(place.emoji)}
                eventHandlers={{
                  click: () => handlePlaceClick(place),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{place.emoji}</span>
                      <div>
                        <p className="font-semibold">
                          {place.city ? `${place.city}, ${place.country}` : place.country}
                        </p>
                        <p className="text-sm text-gray-600">{place.year}</p>
                      </div>
                    </div>
                    {place.rating && (
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: place.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                    {place.notes && (
                      <p className="text-sm text-gray-600 mt-2">{place.notes}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {clickToAdd && (
          <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg z-[1000] border border-gray-200 dark:border-gray-700">
            <p className={cn("text-sm flex items-center gap-2", textPrimary)}>
              <MapPin className="h-4 w-4" style={{ color }} />
              Click on the map to add a place
            </p>
          </div>
        )}
      </div>

      {/* Empty state */}
      {visitedPlaces.length === 0 && (
        <Card className={cn("border", cardBg)}>
          <CardContent className="p-8 text-center">
            <MapPin className={cn("h-12 w-12 mx-auto mb-3", textSecondary)} />
            <p className={cn("text-sm", textSecondary)}>
              No places visited yet. Start exploring the world!
            </p>
            {onAddPlace && (
              <Button onClick={onAddPlace} className="mt-4" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Place
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <Card className={cn("border", cardBg)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{selectedPlace.emoji}</span>
              <div className="flex-1">
                <h4 className={cn("font-semibold", textPrimary)}>
                  {selectedPlace.city
                    ? `${selectedPlace.city}, ${selectedPlace.country}`
                    : selectedPlace.country}
                </h4>
                <p className={cn("text-sm mb-2", textSecondary)}>
                  Visited in {selectedPlace.year}
                </p>
                {selectedPlace.rating && (
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: selectedPlace.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
                {selectedPlace.notes && (
                  <p className={cn("text-sm", textSecondary)}>{selectedPlace.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Places Grid */}
      {visitedPlaces.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {visitedPlaces.map((place) => (
            <button
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg transition-colors text-left",
                selectedPlace?.id === place.id
                  ? 'bg-primary/10 border-2 border-primary'
                  : theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              )}
            >
              <span className="text-2xl">{place.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", textPrimary)}>
                  {place.city || place.country}
                </p>
                <p className={cn("text-xs", textSecondary)}>{place.year}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

