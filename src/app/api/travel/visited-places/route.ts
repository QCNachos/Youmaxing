import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/env';
import { z } from 'zod';

const visitedPlaceSchema = z.object({
  country: z.string().min(1).max(100),
  city: z.string().max(100).nullable().optional(),
  year: z.number().int().min(1900).max(2100),
  emoji: z.string().max(10).optional().default('🌍'),
  coordinates_x: z.number().min(0).max(100),
  coordinates_y: z.number().min(0).max(100),
  notes: z.string().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  visited_at: z.string().nullable().optional(),
});

const visitedPlaceUpdateSchema = visitedPlaceSchema.partial().extend({
  id: z.string().uuid(),
});

// GET: Fetch all visited places for the user
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: places, error } = await supabase
      .from('visited_places')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching visited places:', error);
      return NextResponse.json({ error: 'Failed to fetch visited places' }, { status: 500 });
    }

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Visited places GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new visited place
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = visitedPlaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid visited place data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { data: place, error } = await supabase
      .from('visited_places')
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating visited place:', error);
      return NextResponse.json({ error: 'Failed to create visited place' }, { status: 500 });
    }

    return NextResponse.json({ place }, { status: 201 });
  } catch (error) {
    console.error('Visited places POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a visited place
export async function PATCH(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = visitedPlaceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid visited place data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    const { data: place, error } = await supabase
      .from('visited_places')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating visited place:', error);
      return NextResponse.json({ error: 'Failed to update visited place' }, { status: 500 });
    }

    return NextResponse.json({ place });
  } catch (error) {
    console.error('Visited places PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a visited place
export async function DELETE(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Server is not configured' },
          { status: 503 }
        );
      }
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visited place ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('visited_places')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting visited place:', error);
      return NextResponse.json({ error: 'Failed to delete visited place' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visited places DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

