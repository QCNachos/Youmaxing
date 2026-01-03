import { NextRequest, NextResponse } from 'next/server';
import type { AspectType, AITone } from '@/types/database';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/env';

const aspectSchema = z.enum([
  'training',
  'food',
  'sports',
  'films',
  'finance',
  'business',
  'travel',
  'family',
  'friends',
  'events',
  'settings',
]);

// Mock recommendations for demo
const mockRecommendations = [
  {
    id: '1',
    aspect: 'training' as AspectType,
    title: 'Time for a rest day?',
    content: "You've been crushing it with 3 workouts this week! Consider active recovery today.",
    action_type: 'info' as const,
    priority: 'medium',
  },
  {
    id: '2',
    aspect: 'finance' as AspectType,
    title: 'Savings milestone reached!',
    content: "You're 80% towards your travel fund goal. Just $600 more to go!",
    action_type: 'info' as const,
    priority: 'high',
  },
  {
    id: '3',
    aspect: 'friends' as AspectType,
    title: "Haven't seen Sarah in a while",
    content: 'Last hangout was 3 weeks ago. Maybe plan a coffee catch-up?',
    action_type: 'action' as const,
    priority: 'medium',
  },
  {
    id: '4',
    aspect: 'food' as AspectType,
    title: 'Try adding more greens',
    content: 'Your recent meals have been protein-heavy. Consider adding leafy vegetables for better balance.',
    action_type: 'info' as const,
    priority: 'low',
  },
  {
    id: '5',
    aspect: 'business' as AspectType,
    title: 'Focus time suggestion',
    content: "You're most productive in the morning. Block 2 hours tomorrow for deep work.",
    action_type: 'action' as const,
    priority: 'medium',
  },
];

// GET: Fetch recommendations
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const searchParams = request.nextUrl.searchParams;
    const aspectRaw = searchParams.get('aspect');
    const limitRaw = searchParams.get('limit') || '5';
    const limit = Math.max(1, Math.min(20, Number.parseInt(limitRaw, 10) || 5));
    const aspect = aspectRaw ? aspectSchema.safeParse(aspectRaw).data ?? null : null;

    let recommendations = [...mockRecommendations];

    if (aspect) {
      recommendations = recommendations.filter(r => r.aspect === aspect);
    }

    recommendations = recommendations.slice(0, limit);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Generate new recommendations (simplified version)
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // If running locally without Supabase, allow demo behavior.
    if (process.env.NODE_ENV !== 'production' && isDemoMode && !isSupabaseConfigured) {
      const shuffled = [...mockRecommendations].sort(() => Math.random() - 0.5);
      const recommendations = shuffled.slice(0, 3);
      return NextResponse.json({
        success: true,
        recommendations,
        count: recommendations.length,
      });
    }

    // In production, this would:
    // 1. Analyze user data from Supabase
    // 2. Call AI to generate personalized recommendations
    // 3. Store them in the database

    // For now, return mock recommendations with simulated AI processing
    const shuffled = [...mockRecommendations].sort(() => Math.random() - 0.5);
    const recommendations = shuffled.slice(0, 3);

    return NextResponse.json({ 
      success: true, 
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update recommendation status
export async function PATCH(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { id } = body as { id?: string; acted_on?: boolean; dismissed?: boolean };

    if (!id) {
      return NextResponse.json({ error: 'Recommendation ID required' }, { status: 400 });
    }

    // In production, this would update the database
    // Avoid logging user-specific data here.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recommendations PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
