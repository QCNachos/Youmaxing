'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Plus, MapPin, Star } from 'lucide-react';
import { useVisitedPlaces } from '@/hooks/useTravel';
import { toast } from 'sonner';

interface AddVisitedPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddVisitedPlaceDialog({ open, onOpenChange, onSuccess }: AddVisitedPlaceDialogProps) {
  const { theme } = useAppStore();
  const { addPlace } = useVisitedPlaces();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    year: new Date().getFullYear(),
    emoji: '🌍',
    coordinates_x: 50,
    coordinates_y: 50,
    notes: '',
    rating: 5,
  });

  const [mapClick, setMapClick] = useState<{ x: number; y: number } | null>(null);

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMapClick({ x, y });
    setFormData({ ...formData, coordinates_x: x, coordinates_y: y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country.trim()) {
      toast.error('Please enter a country');
      return;
    }

    try {
      setSubmitting(true);
      await addPlace({
        country: formData.country,
        city: formData.city || null,
        year: formData.year,
        emoji: formData.emoji || '🌍',
        coordinates_x: formData.coordinates_x,
        coordinates_y: formData.coordinates_y,
        notes: formData.notes || null,
        rating: formData.rating || null,
        photos: null,
        visited_at: null,
      });

      toast.success('Place added successfully!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        country: '',
        city: '',
        year: new Date().getFullYear(),
        emoji: '🌍',
        coordinates_x: 50,
        coordinates_y: 50,
        notes: '',
        rating: 5,
      });
      setMapClick(null);
    } catch (error) {
      console.error('Error adding place:', error);
      toast.error('Failed to add place');
    } finally {
      setSubmitting(false);
    }
  };

  const popularEmojis = ['🌍', '🇫🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇮🇩', '🇹🇭', '🇦🇺', '🇧🇷', '🇲🇽', '🇨🇦'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Visited Place</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Country & City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input
                placeholder="e.g., France"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City (optional)</Label>
              <Input
                placeholder="e.g., Paris"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          {/* Year & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year Visited *</Label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        rating <= (formData.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emoji Selector */}
          <div className="space-y-2">
            <Label>Flag/Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={cn(
                    'text-2xl p-2 rounded-lg transition-all',
                    formData.emoji === emoji
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {emoji}
                </button>
              ))}
              <Input
                type="text"
                placeholder="Or type emoji"
                value={formData.emoji || ''}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-20 text-center text-xl"
                maxLength={10}
              />
            </div>
          </div>

          {/* Map Coordinate Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Click on the map to select location
            </Label>
            <p className={cn("text-xs", textSecondary)}>
              Coordinates: X: {formData.coordinates_x.toFixed(1)}%, Y: {formData.coordinates_y.toFixed(1)}%
            </p>
            
            <div
              onClick={handleMapClick}
              className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 cursor-crosshair border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              {/* Simple world map background */}
              <svg 
                viewBox="0 0 1000 500" 
                className="w-full h-full pointer-events-none"
                style={{ opacity: theme === 'light' ? 0.3 : 0.2 }}
              >
                {/* Continents */}
                <path d="M 150,150 L 200,120 L 280,130 L 320,100 L 380,110 L 420,140 L 450,160 L 440,200 L 380,220 L 320,210 L 280,180 L 220,190 L 180,170 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
                <path d="M 100,100 L 180,80 L 240,90 L 260,130 L 240,180 L 200,200 L 150,190 L 120,160 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
                <path d="M 220,240 L 250,220 L 280,240 L 290,300 L 270,360 L 240,370 L 220,340 L 210,280 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
                <path d="M 450,180 L 500,170 L 540,200 L 550,250 L 530,300 L 490,320 L 460,300 L 450,240 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
                <path d="M 600,80 L 750,70 L 850,90 L 900,120 L 920,180 L 880,220 L 800,240 L 720,230 L 650,200 L 620,150 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
                <path d="M 750,320 L 850,310 L 900,340 L 890,380 L 840,400 L 770,390 L 740,360 Z" fill={theme === 'light' ? '#94a3b8' : '#475569'} opacity="0.5" />
              </svg>

              {/* User's marker */}
              {mapClick && (
                <div
                  className="absolute"
                  style={{
                    left: `${mapClick.x}%`,
                    top: `${mapClick.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500 w-6 h-6 -mt-3 -ml-3 opacity-75" />
                    <div className="relative w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg -mt-3 -ml-3">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="What made this place special?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {submitting ? 'Adding...' : 'Add Visited Place'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

