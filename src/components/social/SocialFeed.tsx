'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Share2,
  Gift,
  UserPlus,
  Award,
  Coins,
  ExternalLink,
  User,
  Clock,
  Send,
  Loader2,
  Bell,
  Check,
} from 'lucide-react';
import type { SocialFeedItem, FeedType } from '@/types/database';

// Feed type configuration
const feedTypeConfig: Record<FeedType, { 
  icon: typeof Share2; 
  color: string; 
  label: string;
}> = {
  list_shared: { icon: Share2, color: '#8B5CF6', label: 'Shared a list' },
  recommendation: { icon: Award, color: '#3B82F6', label: 'New recommendation' },
  achievement: { icon: Award, color: '#F59E0B', label: 'Achievement unlocked' },
  tip_received: { icon: Gift, color: '#22C55E', label: 'Received a tip' },
  friend_added: { icon: UserPlus, color: '#EC4899', label: 'New friend' },
};

// Mock feed items
const mockFeedItems: (SocialFeedItem & { source_user_name?: string })[] = [
  {
    id: '1',
    user_id: '1',
    feed_type: 'list_shared',
    content: {
      list_title: 'Best Sci-Fi Movies of 2024',
      list_type: 'films',
      item_count: 12,
    },
    source_user_id: '2',
    source_user_name: 'Sarah',
    related_id: 'list-1',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    user_id: '1',
    feed_type: 'tip_received',
    content: {
      amount: 15,
      message: 'Thanks for the GoT recommendation!',
    },
    source_user_id: '3',
    source_user_name: 'Mike',
    related_id: null,
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    user_id: '1',
    feed_type: 'friend_added',
    content: {
      friend_name: 'Emma',
    },
    source_user_id: '4',
    source_user_name: 'Emma',
    related_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    user_id: '1',
    feed_type: 'recommendation',
    content: {
      title: 'Based on your LEGENDARY ratings',
      recommendation: 'Shogun',
      reason: 'Epic storytelling like Game of Thrones',
    },
    source_user_id: null,
    source_user_name: 'AI',
    related_id: null,
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
];

interface TipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  recipientId: string;
  onTip: (amount: number, message: string) => Promise<void>;
}

function TipModal({ open, onOpenChange, recipientName, onTip }: TipModalProps) {
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const presetAmounts = [5, 10, 25, 50];
  
  const handleSend = async () => {
    if (amount < 5) return;
    setIsSending(true);
    try {
      await onTip(amount, message);
      setSent(true);
      setTimeout(() => {
        onOpenChange(false);
        setSent(false);
        setAmount(10);
        setMessage('');
      }, 1500);
    } catch (error) {
      console.error('Tip failed:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Tip {recipientName}
          </DialogTitle>
          <DialogDescription>
            Send points to thank them for a great recommendation!
          </DialogDescription>
        </DialogHeader>
        
        {sent ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Tip Sent!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {recipientName} received {amount} points
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Amount presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className="flex-1"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                min={5}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 5)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground">Minimum tip: 5 points</p>
            </div>
            
            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (optional)</label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Thanks for the recommendation!"
              />
            </div>
            
            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={amount < 5 || isSending}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send {amount} Points
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

interface SocialFeedProps {
  compact?: boolean;
  maxItems?: number;
}

export function SocialFeed({ compact = false, maxItems }: SocialFeedProps) {
  const [feedItems, setFeedItems] = useState(mockFeedItems);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipRecipient, setTipRecipient] = useState<{ id: string; name: string } | null>(null);
  
  const displayItems = maxItems ? feedItems.slice(0, maxItems) : feedItems;
  const unreadCount = feedItems.filter(item => !item.is_read).length;
  
  const markAsRead = (itemId: string) => {
    setFeedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, is_read: true } : item
      )
    );
  };
  
  const openTipModal = (userId: string, userName: string) => {
    setTipRecipient({ id: userId, name: userName });
    setTipModalOpen(true);
  };
  
  const handleTip = async (amount: number, message: string) => {
    // In real app, call tipFriend from points engine
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Tipped ${tipRecipient?.name} ${amount} points: ${message}`);
  };
  
  const renderFeedContent = (item: SocialFeedItem & { source_user_name?: string }) => {
    const content = item.content as Record<string, unknown>;
    
    switch (item.feed_type) {
      case 'list_shared':
        return (
          <div>
            <p className="text-sm">
              <strong>{item.source_user_name}</strong> shared a list with you
            </p>
            <p className="text-sm font-medium mt-1">{content.list_title as string}</p>
            <p className="text-xs text-muted-foreground">
              {content.item_count as number} items
            </p>
          </div>
        );
      
      case 'tip_received':
        return (
          <div>
            <p className="text-sm">
              <strong>{item.source_user_name}</strong> tipped you{' '}
              <span className="text-green-500 font-semibold">{content.amount as number} points</span>
            </p>
            {content.message ? (
              <p className="text-sm text-muted-foreground mt-1 italic">
                &quot;{content.message as string}&quot;
              </p>
            ) : null}
          </div>
        );
      
      case 'friend_added':
        return (
          <p className="text-sm">
            <strong>{content.friend_name as string}</strong> is now your friend
          </p>
        );
      
      case 'recommendation':
        return (
          <div>
            <p className="text-sm">{content.title as string}</p>
            <p className="text-sm font-medium mt-1">
              Check out: {content.recommendation as string}
            </p>
            <p className="text-xs text-muted-foreground">{content.reason as string}</p>
          </div>
        );
      
      case 'achievement':
        return (
          <p className="text-sm">
            You unlocked: <strong>{content.title as string}</strong>
          </p>
        );
      
      default:
        return <p className="text-sm">New activity</p>;
    }
  };
  
  const renderFeedItem = (item: SocialFeedItem & { source_user_name?: string }) => {
    const config = feedTypeConfig[item.feed_type];
    const Icon = config.icon;
    
    return (
      <Card 
        key={item.id} 
        className={`transition-colors ${!item.is_read ? 'bg-accent/50 border-violet-500/30' : ''}`}
        onClick={() => markAsRead(item.id)}
      >
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex gap-3">
            {/* Icon */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="h-5 w-5" style={{ color: config.color }} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {renderFeedContent(item)}
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.created_at)}
                </span>
                
                {item.feed_type === 'list_shared' && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                
                {item.source_user_id && item.feed_type !== 'tip_received' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs text-green-500 hover:text-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTipModal(item.source_user_id!, item.source_user_name || 'Friend');
                    }}
                  >
                    <Gift className="h-3 w-3 mr-1" />
                    Tip
                  </Button>
                )}
              </div>
            </div>
            
            {/* Unread indicator */}
            {!item.is_read && (
              <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <>
      <div className="space-y-4">
        {!compact && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Activity Feed
              {unreadCount > 0 && (
                <Badge className="bg-violet-500">{unreadCount}</Badge>
              )}
            </h2>
          </div>
        )}
        
        {displayItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold">No activity yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share lists and connect with friends to see activity here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {displayItems.map(renderFeedItem)}
          </div>
        )}
      </div>
      
      {/* Tip Modal */}
      {tipRecipient && (
        <TipModal
          open={tipModalOpen}
          onOpenChange={setTipModalOpen}
          recipientName={tipRecipient.name}
          recipientId={tipRecipient.id}
          onTip={handleTip}
        />
      )}
    </>
  );
}

