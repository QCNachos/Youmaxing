'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Plus, MapPin, Star, Loader2 } from 'lucide-react';
import { useVisitedPlaces } from '@/hooks/useTravel';
import { toast } from 'sonner';
import { geocodeLocation } from '@/lib/geocoding';

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
      
      // Geocode the location using Nominatim API
      toast.loading('Finding location on map...');
      const coords = await geocodeLocation(formData.country, formData.city);
      
      if (coords.lat === 0 && coords.lng === 0) {
        toast.warning('Location found, but coordinates may be approximate');
      }
      
      await addPlace({
        country: formData.country,
        city: formData.city || null,
        year: formData.year,
        emoji: formData.emoji || '🌍',
        coordinates_x: coords.lng, // Store actual longitude
        coordinates_y: coords.lat,  // Store actual latitude
        notes: formData.notes || null,
        rating: formData.rating || null,
        photos: null,
        visited_at: null,
      });

      toast.dismiss();
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
      toast.dismiss();
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

          {/* Note about geocoding */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Auto-Geocoding
            </Label>
            <p className={cn("text-xs", textSecondary)}>
              📍 Coordinates are automatically found using OpenStreetMap's geocoding service.
              Just enter the country and city - we'll find it on the map!
            </p>
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
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding location...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Visited Place
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

