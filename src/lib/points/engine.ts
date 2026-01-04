import { createClient } from '@/lib/supabase/client';
import type { PointTransaction, PointTransactionType, UserPoints } from '@/types/database';

/**
 * Points Engine - Client-side wrapper for the points system
 * The actual logic is in the database functions for atomicity
 */

export interface AwardPointsResult {
  success: boolean;
  points_awarded?: number;
  new_balance?: number;
  error?: string;
}

export interface TipResult {
  success: boolean;
  amount?: number;
  sender_new_balance?: number;
  error?: string;
}

/**
 * Award points to a user for an action
 */
export async function awardPoints(
  userId: string,
  action: PointTransactionType,
  options?: {
    amount?: number;
    description?: string;
    relatedUserId?: string;
    relatedItemId?: string;
  }
): Promise<AwardPointsResult> {
  const supabase = createClient();
  
  // Note: award_points function must exist in database (migration 00006_entertainment_social.sql)
  const { data, error } = await (supabase.rpc as any)('award_points', {
    p_user_id: userId,
    p_action: action,
    p_amount: options?.amount ?? null,
    p_description: options?.description ?? null,
    p_related_user_id: options?.relatedUserId ?? null,
    p_related_item_id: options?.relatedItemId ?? null,
  });
  
  if (error) {
    console.error('Award points error:', error);
    return { success: false, error: error.message };
  }
  
  return data as AwardPointsResult;
}

/**
 * Tip a friend with points
 */
export async function tipFriend(
  fromUserId: string,
  toUserId: string,
  amount: number,
  message?: string
): Promise<TipResult> {
  if (amount < 5) {
    return { success: false, error: 'Minimum tip is 5 points' };
  }
  
  const supabase = createClient();
  
  // Note: tip_friend function must exist in database (migration 00006_entertainment_social.sql)
  const { data, error } = await (supabase.rpc as any)('tip_friend', {
    p_from_user_id: fromUserId,
    p_to_user_id: toUserId,
    p_amount: amount,
    p_message: message ?? null,
  });
  
  if (error) {
    console.error('Tip friend error:', error);
    return { success: false, error: error.message };
  }
  
  return data as TipResult;
}

/**
 * Get user's current points balance
 */
export async function getUserPoints(userId: string): Promise<UserPoints | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Get user points error:', error);
    return null;
  }
  
  return data;
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<PointTransaction[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Get transaction history error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check if user can perform an action (hasn't hit daily limit)
 */
export async function canPerformAction(
  userId: string,
  action: PointTransactionType
): Promise<boolean> {
  const supabase = createClient();
  
  // Get rule - table must exist from migration 00006_entertainment_social.sql
  const { data: rule } = await (supabase
    .from('point_rules' as any)
    .select('daily_limit')
    .eq('action', action)
    .eq('is_active', true)
    .single() as any);
  
  if (!rule || (rule as any).daily_limit === null) {
    return true; // No limit
  }
  
  // Count today's transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count } = await (supabase
    .from('point_transactions' as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('transaction_type', action)
    .gte('created_at', today.toISOString()) as any);
  
  return (count || 0) < (rule as any).daily_limit;
}

/**
 * Get all point rules
 */
export async function getPointRules(): Promise<Array<{
  action: string;
  points: number;
  daily_limit: number | null;
  description: string | null;
}>> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('point_rules')
    .select('action, points, daily_limit, description')
    .eq('is_active', true);
  
  if (error) {
    console.error('Get point rules error:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Award daily login bonus
 */
export async function awardDailyLoginBonus(userId: string): Promise<AwardPointsResult> {
  return awardPoints(userId, 'daily_login');
}

/**
 * Award points for rating an item
 */
export async function awardRatingPoints(
  userId: string,
  itemId: string,
  itemTitle: string
): Promise<AwardPointsResult> {
  return awardPoints(userId, 'rate_item', {
    relatedItemId: itemId,
    description: `Rated "${itemTitle}"`,
  });
}

/**
 * Award points for sharing a list
 */
export async function awardSharePoints(
  userId: string,
  listId: string,
  listTitle: string
): Promise<AwardPointsResult> {
  return awardPoints(userId, 'share_list', {
    relatedItemId: listId,
    description: `Shared "${listTitle}"`,
  });
}

/**
 * Award points for adding a friend
 */
export async function awardFriendPoints(
  userId: string,
  friendId: string
): Promise<AwardPointsResult> {
  return awardPoints(userId, 'add_friend', {
    relatedUserId: friendId,
    description: 'Added a new friend',
  });
}

