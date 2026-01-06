'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Share2,
  Users,
  Globe,
  Lock,
  Coins,
  Loader2,
  Check,
  User,
} from 'lucide-react';
import type { ListVisibility, SharedList, FilmTier } from '@/types/database';

interface ListItem {
  id: string;
  title: string;
  tier?: FilmTier;
  type?: string;
}

interface Friend {
  id: string;
  name: string;
  avatar_url?: string;
}

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listTitle: string;
  listType: 'films' | 'music' | 'custom';
  items: ListItem[];
  onShare: (data: {
    title: string;
    description: string;
    visibility: ListVisibility;
    friendIds: string[];
    message: string;
  }) => Promise<void>;
}

// Mock friends
const mockFriends: Friend[] = [
  { id: '1', name: 'Sarah', avatar_url: undefined },
  { id: '2', name: 'Mike', avatar_url: undefined },
  { id: '3', name: 'Emma', avatar_url: undefined },
  { id: '4', name: 'Alex', avatar_url: undefined },
];

const visibilityOptions: { value: ListVisibility; label: string; icon: typeof Globe; description: string }[] = [
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this' },
  { value: 'friends', label: 'Friends Only', icon: Users, description: 'Only your friends can see this' },
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this' },
];

export function ShareModal({ 
  open, 
  onOpenChange, 
  listTitle, 
  listType, 
  items, 
  onShare 
}: ShareModalProps) {
  const [title, setTitle] = useState(listTitle);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<ListVisibility>('friends');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  
  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare({
        title,
        description,
        visibility,
        friendIds: selectedFriends,
        message,
      });
      setShared(true);
      setTimeout(() => {
        onOpenChange(false);
        setShared(false);
      }, 1500);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };
  
  const pointsReward = 10; // Points for sharing
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-500" />
            Share List
          </DialogTitle>
          <DialogDescription>
            Share your {listType} list with friends and earn points!
          </DialogDescription>
        </DialogHeader>
        
        {shared ? (
          <div className="py-12 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Shared Successfully!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You earned {pointsReward} points
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label>List Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Favorite Films"
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A curated list of my all-time favorites..."
                rows={2}
              />
            </div>
            
            {/* Preview Items */}
            <div className="space-y-2">
              <Label>Items ({items.length})</Label>
              <ScrollArea className="h-24 rounded-md border p-2">
                <div className="space-y-1">
                  {items.slice(0, 10).map((item) => (
                    <div key={item.id} className="text-sm flex items-center gap-2">
                      <span className="truncate">{item.title}</span>
                      {item.tier && (
                        <Badge variant="outline" className="text-xs">
                          {item.tier.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {items.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      +{items.length - 10} more items
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Visibility */}
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as ListVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Share with specific friends */}
            {visibility !== 'private' && (
              <div className="space-y-2">
                <Label>Share with friends</Label>
                <div className="flex flex-wrap gap-2">
                  {mockFriends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedFriends.includes(friend.id)
                          ? 'bg-violet-500/20 text-violet-500 border border-violet-500/50'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      {friend.name}
                      {selectedFriends.includes(friend.id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Message */}
            {selectedFriends.length > 0 && (
              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="You gotta check these out!"
                />
              </div>
            )}
            
            {/* Points Reward */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Coins className="h-5 w-5 text-amber-500" />
              <span className="text-sm">
                Share to earn <strong className="text-amber-500">+{pointsReward} points</strong>
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleShare}
                disabled={!title.trim() || isSharing}
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                Share List
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


