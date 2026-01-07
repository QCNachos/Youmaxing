'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Save, Loader2, Trash2, Heart } from 'lucide-react';
import { useBucketList } from '@/hooks/useTravel';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditBucketListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item: {
    id: string;
    destination: string;
    country: string | null;
    emoji: string | null;
    reason: string | null;
    priority: string | null;
    notes: string | null;
  } | null;
}

export function EditBucketListDialog({ open, onOpenChange, onSuccess, item }: EditBucketListDialogProps) {
  const { theme } = useAppStore();
  const { updateItem, deleteItem } = useBucketList();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    emoji: '🌍',
    reason: '',
    priority: 'medium',
    notes: '',
  });

  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/60';

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setFormData({
        destination: item.destination,
        country: item.country || '',
        emoji: item.emoji || '🌍',
        reason: item.reason || '',
        priority: item.priority || 'medium',
        notes: item.notes || '',
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    try {
      setSubmitting(true);
      
      await updateItem(item.id, {
        destination: formData.destination,
        country: formData.country || null,
        emoji: formData.emoji || '🌍',
        reason: formData.reason || null,
        priority: formData.priority,
        notes: formData.notes || null,
      });

      toast.success('Bucket list item updated!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (!confirm(`Are you sure you want to remove ${item.destination} from your bucket list?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteItem(item.id);
      toast.success('Removed from bucket list!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const popularEmojis = ['🌍', '🇫🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇮🇹', '🇯🇵', '🇨🇳', '🇮🇩', '🇹🇭', '🇦🇺', '🇧🇷', '🗼', '🏰', '🏖️', '🏔️'];

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-bucket-description">
        <DialogHeader>
          <DialogTitle className={cn("text-2xl font-bold flex items-center gap-2", textPrimary)}>
            <Heart className="h-6 w-6 text-pink-500" />
            Edit Bucket List Item
          </DialogTitle>
        </DialogHeader>
        <p id="edit-bucket-description" className="sr-only">Edit your bucket list destination details</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label>Destination *</Label>
            <Input
              required
              placeholder="e.g., Santorini, Machu Picchu"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              placeholder="e.g., Greece, Peru"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label>Icon/Emoji</Label>
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

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔥 High Priority</SelectItem>
                <SelectItem value="medium">⭐ Medium Priority</SelectItem>
                <SelectItem value="low">💭 Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Why do you want to visit?</Label>
            <Input
              placeholder="e.g., Amazing sunset views"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
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
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

