'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Coins,
  TrendingUp,
  Gift,
  Share2,
  Star,
  UserPlus,
  LogIn,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { PointTransaction, PointTransactionType } from '@/types/database';

// Transaction type icons
const transactionIcons: Partial<Record<PointTransactionType, typeof Coins>> = {
  daily_login: LogIn,
  rate_item: Star,
  share_list: Share2,
  receive_tip: Gift,
  give_tip: Gift,
  unlock_feature: Sparkles,
  add_friend: UserPlus,
  complete_watchlist: Award,
  signup_bonus: Award,
  referral: UserPlus,
  earn: Award,
  spend: Gift,
  tip_received: Gift,
  tip_sent: Gift,
};

// Mock data
const mockBalance = 245;
const mockTransactions: PointTransaction[] = [
  {
    id: '1',
    user_id: '1',
    amount: 15,
    transaction_type: 'receive_tip',
    description: 'Tip from Mike',
    related_user_id: '2',
    related_item_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    amount: 10,
    transaction_type: 'share_list',
    description: 'Shared "My Top Films"',
    related_user_id: null,
    related_item_id: 'list-1',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    amount: 5,
    transaction_type: 'daily_login',
    description: 'Daily login bonus',
    related_user_id: null,
    related_item_id: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: '1',
    amount: -10,
    transaction_type: 'give_tip',
    description: 'Tipped Sarah',
    related_user_id: '3',
    related_item_id: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: '1',
    amount: 2,
    transaction_type: 'rate_item',
    description: 'Rated "Game of Thrones"',
    related_user_id: null,
    related_item_id: 'film-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    user_id: '1',
    amount: 100,
    transaction_type: 'signup_bonus',
    description: 'Welcome to Youmaxing!',
    related_user_id: null,
    related_item_id: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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

interface PointsDisplayProps {
  variant?: 'badge' | 'full';
  showHistory?: boolean;
}

export function PointsDisplay({ variant = 'badge', showHistory = true }: PointsDisplayProps) {
  const [balance] = useState(mockBalance);
  const [transactions] = useState<PointTransaction[]>(mockTransactions);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime] = useState(() => Date.now());
  
  // Calculate stats
  const earnedToday = transactions
    .filter(t => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(t.created_at) >= today && t.amount > 0;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const earnedThisWeek = transactions
    .filter(t => {
      const weekAgo = new Date(currentTime - 7 * 24 * 60 * 60 * 1000);
      return new Date(t.created_at) >= weekAgo && t.amount > 0;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const renderTransaction = (tx: PointTransaction) => {
    const Icon = transactionIcons[tx.transaction_type] || Coins;
    const isPositive = tx.amount > 0;
    
    return (
      <div 
        key={tx.id}
        className="flex items-center gap-3 py-2"
      >
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          <Icon className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{tx.description}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.created_at)}</p>
        </div>
        
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{tx.amount}
        </span>
      </div>
    );
  };
  
  // Simple badge variant
  if (variant === 'badge' && !showHistory) {
    return (
      <Badge 
        variant="secondary" 
        className="bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30 cursor-pointer"
      >
        <Coins className="h-3 w-3 mr-1" />
        {balance}
      </Badge>
    );
  }
  
  // Full variant with popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 hover:bg-amber-500/10"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <span className="font-semibold text-amber-500">{balance}</span>
          {earnedToday > 0 && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-500 text-xs">
              +{earnedToday} today
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                {balance}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-green-500">
                <TrendingUp className="h-4 w-4" />
                +{earnedThisWeek} this week
              </div>
            </div>
          </div>
        </div>
        
        {/* How to earn */}
        <div className="p-3 border-b bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">EARN POINTS</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <LogIn className="h-3 w-3 text-amber-500" />
              <span>Daily login: +5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 text-amber-500" />
              <span>Rate item: +2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Share2 className="h-3 w-3 text-amber-500" />
              <span>Share list: +10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserPlus className="h-3 w-3 text-amber-500" />
              <span>Add friend: +15</span>
            </div>
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">RECENT ACTIVITY</p>
          </div>
          
          <ScrollArea className="h-48">
            <div className="space-y-1 divide-y">
              {transactions.slice(0, 10).map(renderTransaction)}
            </div>
          </ScrollArea>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-between text-xs">
            View all transactions
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


