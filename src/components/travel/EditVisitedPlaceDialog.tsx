'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Save, MapPin, Star, Loader2, Trash2 } from 'lucide-react';
import { useVisitedPlaces } from '@/hooks/useTravel';
import { toast } from 'sonner';
import { geocodeLocation } from '@/lib/geocoding';

interface EditVisitedPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  place: {
    id: string;
    country: string;
    city: string | null;
    year: number;
    emoji: string | null;
    coordinates_x: number;
    coordinates_y: number;
    notes: string | null;
    rating: number | null;
  } | null;
}

export function EditVisitedPlaceDialog({ open, onOpenChange, onSuccess, place }: EditVisitedPlaceDialogProps) {
  const { theme } = useAppStore();
  const { updatePlace, deletePlace } = useVisitedPlaces();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    year: new Date().getFullYear(),
    emoji: '🌍',
    notes: '',
    rating: 5,
  });

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';

  // Initialize form with place data
  useEffect(() => {
    if (place) {
      setFormData({
        country: place.country,
        city: place.city || '',
        year: place.year,
        emoji: place.emoji,
        notes: place.notes || '',
        rating: place.rating || 5,
      });
    }
  }, [place]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!place) return;
    if (!formData.country.trim()) {
      toast.error('Please enter a country');
      return;
    }

    try {
      setSubmitting(true);
      
      // Check if location changed, if so re-geocode
      const locationChanged = 
        formData.country !== place.country || 
        formData.city !== (place.city || '');
      
      let coords = { lng: place.coordinates_x, lat: place.coordinates_y };
      
      if (locationChanged) {
        toast.loading('Updating location...');
        coords = await geocodeLocation(formData.country, formData.city);
      }
      
      await updatePlace(place.id, {
        country: formData.country,
        city: formData.city || null,
        year: formData.year,
        emoji: formData.emoji || '🌍',
        coordinates_x: coords.lng,
        coordinates_y: coords.lat,
        notes: formData.notes || null,
        rating: formData.rating || null,
      });

      toast.dismiss();
      toast.success('Place updated successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating place:', error);
      toast.dismiss();
      toast.error('Failed to update place');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!place) return;
    
    if (!confirm(`Are you sure you want to delete ${place.city || place.country}?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deletePlace(place.id);
      toast.success('Place deleted successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting place:', error);
      toast.error('Failed to delete place');
    } finally {
      setDeleting(false);
    }
  };

  const popularEmojis = ['🌍', '🇫🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇮🇩', '🇹🇭', '🇦🇺', '🇧🇷', '🇲🇽', '🇨🇦'];

  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-place-description">
        <DialogHeader>
          <DialogTitle className={cn("text-2xl font-bold", textPrimary)}>
            Edit Visited Place
          </DialogTitle>
        </DialogHeader>
        <p id="edit-place-description" className="sr-only">Edit your visited place details including location, rating, and notes</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country */}
          <div className="space-y-2">
            <Label>Country *</Label>
            <Input
              required
              placeholder="e.g., France, Japan, Italy"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>City (optional)</Label>
            <Input
              placeholder="e.g., Paris, Tokyo, Rome"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label>Year Visited *</Label>
            <Input
              required
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className={cn(
                    'transition-all',
                    rating <= formData.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                >
                  <Star className={cn(
                    'h-6 w-6',
                    rating <= formData.rating && 'fill-current'
                  )} />
                </button>
              ))}
            </div>
          </div>

          {/* Emoji */}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="What made this place special?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
              disabled={submitting || deleting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

