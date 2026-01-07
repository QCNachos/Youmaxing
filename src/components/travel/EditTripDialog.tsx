'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Save, Loader2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useTrips } from '@/hooks/useTravel';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  trip: {
    id: string;
    destination: string;
    status: string | null;
    start_date: string | null;
    end_date: string | null;
    budget: number | null;
    current_saved: number | null;
    notes: string | null;
  } | null;
}

export function EditTripDialog({ open, onOpenChange, onSuccess, trip }: EditTripDialogProps) {
  const { theme } = useAppStore();
  const { updateTrip, deleteTrip } = useTrips();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    status: 'dream',
    start_date: '',
    end_date: '',
    budget: '',
    current_saved: '',
    notes: '',
  });

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';

  // Initialize form with trip data
  useEffect(() => {
    if (trip) {
      setFormData({
        destination: trip.destination,
        status: trip.status || 'dream',
        start_date: trip.start_date || '',
        end_date: trip.end_date || '',
        budget: trip.budget?.toString() || '',
        current_saved: trip.current_saved?.toString() || '',
        notes: trip.notes || '',
      });
    }
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    try {
      setSubmitting(true);
      
      await updateTrip(trip.id, {
        destination: formData.destination,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        current_saved: formData.current_saved ? parseFloat(formData.current_saved) : null,
        notes: formData.notes || null,
      });

      toast.success('Trip updated successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!trip) return;
    
    if (!confirm(`Are you sure you want to delete the trip to ${trip.destination}?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteTrip(trip.id);
      toast.success('Trip deleted successfully!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    } finally {
      setDeleting(false);
    }
  };

  if (!trip) return null;

  const savingsProgress = formData.budget && formData.current_saved
    ? (parseFloat(formData.current_saved) / parseFloat(formData.budget)) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-trip-description">
        <DialogHeader>
          <DialogTitle className={cn("text-2xl font-bold", textPrimary)}>
            Edit Trip
          </DialogTitle>
        </DialogHeader>
        <p id="edit-trip-description" className="sr-only">Edit your trip details including destination, dates, budget, and notes</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label>Destination *</Label>
            <Input
              required
              placeholder="e.g., Tokyo, Paris, Bali"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dream">💭 Dream</SelectItem>
                <SelectItem value="planning">⏰ Planning</SelectItem>
                <SelectItem value="booked">📅 Booked</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget
              </Label>
              <Input
                type="number"
                placeholder="3000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Current Saved
              </Label>
              <Input
                type="number"
                placeholder="1500"
                value={formData.current_saved}
                onChange={(e) => setFormData({ ...formData, current_saved: e.target.value })}
              />
            </div>
          </div>

          {/* Savings Progress */}
          {formData.budget && formData.current_saved && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={textSecondary}>Savings Progress</span>
                <span className={textPrimary}>{Math.round(savingsProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Add notes about your trip..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
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

