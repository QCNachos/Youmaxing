'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Globe, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

interface VisitedPlace {
  id: string;
  country: string;
  city?: string | null;
  year: number;
  emoji: string | null;
  coordinates: { x: number; y: number }; // Percentage coordinates on the map
  notes?: string | null;
}

interface WorldMapProps {
  visitedPlaces: VisitedPlace[];
  color?: string;
  onAddPlace?: () => void;
}

export function WorldMap({ visitedPlaces, color = '#06B6D4', onAddPlace }: WorldMapProps) {
  const { theme } = useAppStore();
  const [hoveredPlace, setHoveredPlace] = useState<VisitedPlace | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<VisitedPlace | null>(null);

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';
  const cardBg = theme === 'light' ? 'bg-white/90 border-slate-200/50' : 'bg-slate-900/90 border-white/10';

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className={cn("border overflow-hidden", cardBg)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4" style={{ color }} />
            <h3 className={cn("font-semibold text-sm", textPrimary)}>
              Places I've Been
            </h3>
            <Badge 
              variant="secondary" 
              className="ml-auto"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {visitedPlaces.length} {visitedPlaces.length === 1 ? 'country' : 'countries'}
            </Badge>
            {onAddPlace && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={onAddPlace}
                style={{ color }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Simple World Map with Markers */}
          <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900">
            {/* World map background (simplified continents) */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-full"
              style={{ opacity: theme === 'light' ? 0.3 : 0.2 }}
            >
              {/* Simplified world map paths - just basic continent shapes */}
              <path
                d="M 150,150 L 200,120 L 280,130 L 320,100 L 380,110 L 420,140 L 450,160 L 440,200 L 380,220 L 320,210 L 280,180 L 220,190 L 180,170 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
              {/* North America */}
              <path
                d="M 100,100 L 180,80 L 240,90 L 260,130 L 240,180 L 200,200 L 150,190 L 120,160 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
              {/* South America */}
              <path
                d="M 220,240 L 250,220 L 280,240 L 290,300 L 270,360 L 240,370 L 220,340 L 210,280 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
              {/* Africa */}
              <path
                d="M 450,180 L 500,170 L 540,200 L 550,250 L 530,300 L 490,320 L 460,300 L 450,240 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
              {/* Asia */}
              <path
                d="M 600,80 L 750,70 L 850,90 L 900,120 L 920,180 L 880,220 L 800,240 L 720,230 L 650,200 L 620,150 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
              {/* Australia */}
              <path
                d="M 750,320 L 850,310 L 900,340 L 890,380 L 840,400 L 770,390 L 740,360 Z"
                fill={theme === 'light' ? '#94a3b8' : '#475569'}
                opacity="0.5"
              />
            </svg>

            {/* Markers for visited places */}
            {visitedPlaces.map((place) => (
              <div
                key={place.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${place.coordinates.x}%`,
                  top: `${place.coordinates.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredPlace(place)}
                onMouseLeave={() => setHoveredPlace(null)}
                onClick={() => setSelectedPlace(place)}
              >
                {/* Pulse animation */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ 
                    backgroundColor: color,
                    width: '20px',
                    height: '20px',
                    margin: '-10px',
                    opacity: 0.3,
                  }}
                />
                {/* Main marker */}
                <div
                  className="relative w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125"
                  style={{ backgroundColor: color }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                
                {/* Tooltip on hover */}
                {hoveredPlace?.id === place.id && (
                  <div 
                    className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-10 border",
                      cardBg
                    )}
                  >
                    <p className={cn("text-sm font-medium", textPrimary)}>
                      {place.emoji || '🌍'} {place.city || place.country}
                    </p>
                    <p className={cn("text-xs", textSecondary)}>{place.year}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {visitedPlaces.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Globe className={cn("h-12 w-12 mb-3", textSecondary)} />
              <p className={cn("text-sm", textSecondary)}>
                No places visited yet. Start exploring!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Place Details */}
      {selectedPlace && (
        <Card className={cn("border", cardBg)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{selectedPlace.emoji}</span>
              <div className="flex-1">
                <h4 className={cn("font-semibold", textPrimary)}>
                  {selectedPlace.city ? `${selectedPlace.city}, ${selectedPlace.country}` : selectedPlace.country}
                </h4>
                <p className={cn("text-sm mb-2", textSecondary)}>
                  Visited in {selectedPlace.year}
                </p>
                {selectedPlace.notes && (
                  <p className={cn("text-sm", textSecondary)}>
                    {selectedPlace.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List of visited places */}
      <div className="grid grid-cols-2 gap-2">
        {visitedPlaces.map((place) => (
          <button
            key={place.id}
            onClick={() => setSelectedPlace(place)}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-colors text-left",
              selectedPlace?.id === place.id
                ? 'bg-primary/10 border border-primary/30'
                : theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100'
                : 'bg-white/5 hover:bg-white/10'
            )}
          >
            <span className="text-xl">{place.emoji || '🌍'}</span>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", textPrimary)}>
                {place.city || place.country}
              </p>
              <p className={cn("text-xs", textSecondary)}>{place.year}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

