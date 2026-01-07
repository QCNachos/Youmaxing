'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Plus, Heart, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useTrips, type Trip } from '@/hooks/useTravel';
import { toast } from 'sonner';

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    destination: string;
    notes?: string;
  };
}

const statusConfig = {
  dream: { label: 'Dream', icon: Heart, color: '#EC4899' },
  planning: { label: 'Planning', icon: Clock, color: '#F59E0B' },
  booked: { label: 'Booked', icon: Calendar, color: '#3B82F6' },
  completed: { label: 'Completed', icon: CheckCircle, color: '#22C55E' },
};

export function AddTripDialog({ open, onOpenChange, onSuccess, initialData }: AddTripDialogProps) {
  const { theme } = useAppStore();
  const { addTrip } = useTrips();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Trip, 'id' | 'user_id' | 'created_at'>>({
    destination: initialData?.destination || '',
    status: 'dream',
    start_date: null,
    end_date: null,
    budget: null,
    current_saved: null,
    notes: initialData?.notes || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    try {
      setSubmitting(true);
      await addTrip(formData);

      toast.success('Trip added successfully!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        destination: '',
        status: 'dream',
        start_date: null,
        end_date: null,
        budget: null,
        current_saved: null,
        notes: null,
      });
    } catch (error) {
      console.error('Error adding trip:', error);
      toast.error('Failed to add trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Destination *</Label>
            <Input
              placeholder="Where to?"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={formData.status === status ? 'default' : 'outline'}
                    size="sm"
                    style={formData.status === status ? { backgroundColor: config.color } : undefined}
                    onClick={() => setFormData({ ...formData, status: status as Trip['status'] })}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {(formData.status === 'booked' || formData.status === 'completed') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || null })}
              />
            </div>
            <div className="space-y-2">
              <Label>Saved (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.current_saved || ''}
                onChange={(e) => setFormData({ ...formData, current_saved: parseFloat(e.target.value) || null })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Any details..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {submitting ? 'Adding...' : 'Add Trip'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

