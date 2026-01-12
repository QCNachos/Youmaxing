'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plane } from 'lucide-react';
import { toast } from 'sonner';

interface ConvertBucketToTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucketItem: {
    id: string;
    destination: string;
    reason?: string | null;
  } | null;
  onConvert: (bucketListId: string, tripData: {
    start_date?: string;
    end_date?: string;
    budget?: number;
    current_saved?: number;
    notes?: string;
  }) => Promise<void>;
}

export function ConvertBucketToTripDialog({
  open,
  onOpenChange,
  bucketItem,
  onConvert,
}: ConvertBucketToTripDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    budget: '',
    current_saved: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bucketItem) return;

    try {
      setSubmitting(true);
      
      await onConvert(bucketItem.id, {
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        current_saved: formData.current_saved ? parseFloat(formData.current_saved) : 0,
        notes: formData.notes || bucketItem.reason || undefined,
      });

      toast.success(`Converted "${bucketItem.destination}" to a trip!`);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        start_date: '',
        end_date: '',
        budget: '',
        current_saved: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error converting to trip:', error);
      toast.error('Failed to convert to trip');
    } finally {
      setSubmitting(false);
    }
  };

  if (!bucketItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Trip</DialogTitle>
          <DialogDescription>
            Convert &quot;{bucketItem.destination}&quot; from your bucket list into a planned trip
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date (optional)</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (optional)</Label>
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
              <Label>Budget (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Already Saved (optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.current_saved}
                onChange={(e) => setFormData({ ...formData, current_saved: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add any notes about this trip..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4 mr-2" />
                  Convert to Trip
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


