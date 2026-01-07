import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AnalysisResult, Insight } from '@/lib/insight-agent/types';

/**
 * POST /api/insights/ingest
 * 
 * Receives insights from Claude Code analysis agent
 */
export async function POST(request: NextRequest) {
  try {
    const payload: AnalysisResult = await request.json();
    
    const { user_id, platform, timestamp, insights, logged_in, error } = payload;
    
    if (!user_id || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, platform' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // If not logged in, just record the attempt
    if (!logged_in) {
      await (supabase.from('insight_analyses' as any).insert({
        user_id,
        platform,
        analyzed_at: timestamp || new Date().toISOString(),
        logged_in: false,
        insights_count: 0,
        error: error || 'User not logged in',
      } as any) as any);
      
      return NextResponse.json({
        success: true,
        message: `Skipped ${platform} - user not logged in`,
        insights_stored: 0,
      });
    }
    
    // Store each insight
    const insightPromises = (insights || []).map(async (insight: Insight) => {
      return (supabase.from('user_insights' as any).insert({
        user_id,
        platform,
        category: insight.category,
        confidence: insight.confidence,
        value: typeof insight.value === 'string' 
          ? { text: insight.value } 
          : insight.value,
        evidence: insight.evidence,
        extracted_at: insight.extracted_at || timestamp || new Date().toISOString(),
      } as any) as any);
    });
    
    await Promise.all(insightPromises);
    
    // Record the analysis
    await (supabase.from('insight_analyses' as any).insert({
      user_id,
      platform,
      analyzed_at: timestamp || new Date().toISOString(),
      logged_in: true,
      insights_count: insights?.length || 0,
    } as any) as any);
    
    // Trigger profile rebuild (async, don't wait)
    rebuildUserProfile(user_id, supabase).catch(console.error);
    
    return NextResponse.json({
      success: true,
      platform,
      insights_stored: insights?.length || 0,
      timestamp,
    });
    
  } catch (error) {
    console.error('Insight ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to process insights' },
      { status: 500 }
    );
  }
}

/**
 * Rebuild the user's aggregated insight profile
 */
async function rebuildUserProfile(userId: string, supabase: any) {
  // Get all recent insights for this user
  const { data: insights } = await (supabase
    .from('user_insights' as any)
    .select('*')
    .eq('user_id', userId)
    .order('extracted_at', { ascending: false })
    .limit(500) as any);
  
  if (!insights || insights.length === 0) return;
  
  // Aggregate insights by category
  const aggregated: Record<string, any[]> = {};
  
  for (const insight of insights) {
    if (!aggregated[insight.category]) {
      aggregated[insight.category] = [];
    }
    aggregated[insight.category].push({
      value: insight.value,
      confidence: insight.confidence,
      platform: insight.platform,
    });
  }
  
  // Build profile sections
  const profile = {
    user_id: userId,
    
    // Interests (from multiple sources)
    interests: extractInterests(aggregated.interests || []),
    
    // Entertainment preferences
    entertainment: extractEntertainment(aggregated.entertainment_prefs || []),
    
    // Social patterns
    social: extractSocial(aggregated.social_circle || []),
    
    // Work patterns
    work: extractWork(aggregated.work_patterns || []),
    
    // Health
    health: extractHealth(aggregated.health_fitness || []),
    
    // Financial
    financial: extractFinancial(aggregated.financial_behavior || []),
    
    // Travel
    travel: extractTravel(aggregated.travel_interests || []),
    
    // Meta
    last_analysis: new Date().toISOString(),
    platforms_analyzed: [...new Set(insights.map((i: any) => i.platform))],
    total_insights: insights.length,
  };
  
  // Upsert the profile
  await (supabase
    .from('user_insight_profiles' as any)
    .upsert(profile as any, { onConflict: 'user_id' }) as any);
}

// Helper functions to extract and merge insights

function extractInterests(insights: any[]) {
  const interestMap: Record<string, { strength: number; sources: string[] }> = {};
  
  for (const insight of insights) {
    const topics = Array.isArray(insight.value) 
      ? insight.value 
      : insight.value?.text 
        ? [insight.value.text]
        : [];
    
    for (const topic of topics) {
      if (!interestMap[topic]) {
        interestMap[topic] = { strength: 0, sources: [] };
      }
      interestMap[topic].strength = Math.min(1, interestMap[topic].strength + insight.confidence * 0.3);
      if (!interestMap[topic].sources.includes(insight.platform)) {
        interestMap[topic].sources.push(insight.platform);
      }
    }
  }
  
  return Object.entries(interestMap)
    .map(([topic, data]) => ({ topic, ...data }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 20);
}

function extractEntertainment(insights: any[]) {
  const result = {
    preferred_genres: [] as string[],
    preferred_formats: [] as string[],
    viewing_time: 'evening' as const,
    binge_watcher: false,
    music_genres: [] as string[],
    podcast_listener: false,
  };
  
  for (const insight of insights) {
    const val = insight.value;
    if (val?.preferred_genres) {
      result.preferred_genres.push(...val.preferred_genres);
    }
    if (val?.binge_watcher !== undefined) {
      result.binge_watcher = result.binge_watcher || val.binge_watcher;
    }
    if (val?.music_genres) {
      result.music_genres.push(...val.music_genres);
    }
  }
  
  // Dedupe
  result.preferred_genres = [...new Set(result.preferred_genres)];
  result.music_genres = [...new Set(result.music_genres)];
  
  return result;
}

function extractSocial(insights: any[]) {
  return {
    social_activity_level: 'medium' as const,
    preferred_group_size: 'small' as const,
    communication_style: 'occasional' as const,
    close_friends_count: 10,
    family_oriented: false,
  };
}

function extractWork(insights: any[]) {
  const result = {
    work_schedule: 'standard' as const,
    productivity_peak: 'morning' as const,
    role_type: 'mixed' as const,
    industry_interests: [] as string[],
    skill_focus: [] as string[],
  };
  
  for (const insight of insights) {
    const val = insight.value;
    if (val?.industry_interests) {
      result.industry_interests.push(...val.industry_interests);
    }
    if (val?.skill_focus) {
      result.skill_focus.push(...val.skill_focus);
    }
  }
  
  result.industry_interests = [...new Set(result.industry_interests)];
  result.skill_focus = [...new Set(result.skill_focus)];
  
  return result;
}

function extractHealth(insights: any[]) {
  return {
    activity_level: 'moderate' as const,
    workout_preferences: [] as string[],
    dietary_restrictions: [] as string[],
    health_goals: [] as string[],
  };
}

function extractFinancial(insights: any[]) {
  return {
    spending_style: 'balanced' as const,
    investment_interest: false,
    financial_goals: [] as string[],
  };
}

function extractTravel(insights: any[]) {
  return {
    travel_style: 'cultural' as const,
    preferred_destinations: [] as string[],
    travel_frequency: 'occasionally' as const,
  };
}



