import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ClaudeCodeSyncPayload, StreamingItem } from '@/lib/streaming-sync/types';

/**
 * POST /api/streaming-sync
 * 
 * Receives streaming data from Claude Code browser automation
 * or from manual sync tools.
 * 
 * Note: This route uses dynamic table names that aren't in the 
 * generated Supabase types yet. Types will work after running
 * migration 00006_entertainment_social.sql
 */
export async function POST(request: NextRequest) {
  try {
    const payload: ClaudeCodeSyncPayload & { user_id: string } = await request.json();
    
    const { user_id, service, timestamp, data } = payload;
    
    if (!user_id || !service || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, service, data' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient() as any; // Use any to bypass type checking for ungenerated tables
    
    // Combine all items from the sync
    const allItems: StreamingItem[] = [
      ...(data.watchlist || []),
      ...(data.continue_watching || []),
      ...(data.recently_watched || []),
    ];
    
    // Dedupe by title
    const uniqueItems = allItems.reduce((acc, item) => {
      const key = `${item.title}-${item.type}`;
      if (!acc[key]) {
        acc[key] = item;
      } else {
        // Merge data (prefer watchlist status, keep progress)
        acc[key] = {
          ...acc[key],
          in_watchlist: acc[key].in_watchlist || item.in_watchlist,
          progress: item.progress || acc[key].progress,
          last_watched: item.last_watched || acc[key].last_watched,
        };
      }
      return acc;
    }, {} as Record<string, StreamingItem>);
    
    const itemsToUpsert = Object.values(uniqueItems);
    
    // Upsert items into watchlist table
    for (const item of itemsToUpsert) {
      // Check if item exists
      const { data: existing } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user_id)
        .eq('title', item.title)
        .eq('type', item.type)
        .single();
      
      if (existing) {
        // Update existing
        await supabase
          .from('watchlist')
          .update({
            streaming_providers: {
              [`${service}_synced`]: {
                service,
                progress: item.progress,
                last_synced: timestamp,
              },
            },
            poster_url: item.poster_url || undefined,
          })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('watchlist')
          .insert({
            user_id,
            title: item.title,
            type: item.type,
            status: item.progress && item.progress > 0 
              ? (item.progress > 90 ? 'watched' : 'watching')
              : (item.in_watchlist ? 'want_to_watch' : 'watched'),
            poster_url: item.poster_url,
            streaming_providers: {
              [`${service}_synced`]: {
                service,
                progress: item.progress,
                last_synced: timestamp,
              },
            },
          });
      }
    }
    
    // Record sync event
    await supabase
      .from('streaming_syncs')
      .insert({
        user_id,
        service,
        synced_at: timestamp,
        items_synced: itemsToUpsert.length,
        method: 'claude_code',
      });
    
    return NextResponse.json({
      success: true,
      service,
      items_synced: itemsToUpsert.length,
      timestamp,
    });
    
  } catch (error) {
    console.error('Streaming sync error:', error);
    return NextResponse.json(
      { error: 'Failed to process sync data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/streaming-sync
 * 
 * Get sync status for the current user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'user_id is required' },
      { status: 400 }
    );
  }
  
  const supabase = await createClient() as any;
  
  // Get last sync for each service
  const { data: syncs, error } = await supabase
    .from('streaming_syncs')
    .select('service, synced_at, items_synced, method')
    .eq('user_id', userId)
    .order('synced_at', { ascending: false });
  
  if (error) {
    console.error('Get sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
  
  // Group by service, get latest
  const latestByService = (syncs || []).reduce((acc: any, sync: any) => {
    if (!acc[sync.service]) {
      acc[sync.service] = sync;
    }
    return acc;
  }, {});
  
  return NextResponse.json({
    syncs: latestByService,
    total_syncs: syncs?.length || 0,
  });
}
