'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useBucketList, type BucketListItem } from '@/hooks/useTravel';
import { toast } from 'sonner';

interface AddBucketListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBucketListDialog({ open, onOpenChange, onSuccess }: AddBucketListDialogProps) {
  const { theme } = useAppStore();
  const { addItem } = useBucketList();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<BucketListItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    destination: '',
    country: null,
    emoji: '🌍',
    reason: null,
    priority: 'medium',
    notes: null,
  });

  const popularEmojis = ['🌍', '🇮🇸', '🇳🇿', '🇲🇻', '🇵🇪', '🇯🇵', '🇮🇹', '🇬🇷', '🇨🇭', '🇳🇴', '🇨🇦', '🇦🇺'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    try {
      setSubmitting(true);
      await addItem(formData);

      toast.success('Destination added to bucket list!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        destination: '',
        country: null,
        emoji: '🌍',
        reason: null,
        priority: 'medium',
        notes: null,
      });
    } catch (error) {
      console.error('Error adding bucket list item:', error);
      toast.error('Failed to add to bucket list');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Bucket List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destination *</Label>
              <Input
                placeholder="e.g., Iceland"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Country (optional)</Label>
              <Input
                placeholder="Full name"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value || null })}
              />
            </div>
          </div>

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
                placeholder="Or type"
                value={formData.emoji || ''}
                onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                className="w-20 text-center text-xl"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Why do you want to go?</Label>
            <Input
              placeholder="e.g., Northern Lights"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value || null })}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((priority) => (
                <Button
                  key={priority}
                  type="button"
                  variant={formData.priority === priority ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, priority: priority as 'low' | 'medium' | 'high' })}
                  className="flex-1 capitalize"
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Additional details..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            disabled={submitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            {submitting ? 'Adding...' : 'Add to Bucket List'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

