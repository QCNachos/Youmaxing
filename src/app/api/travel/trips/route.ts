import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/env';
import { z } from 'zod';

const tripSchema = z.object({
  destination: z.string().min(1).max(200),
  status: z.enum(['dream', 'planning', 'booked', 'completed']).optional().default('dream'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  budget: z.number().nullable().optional(),
  current_saved: z.number().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

const tripUpdateSchema = tripSchema.partial().extend({
  id: z.string().uuid(),
});

// GET: Fetch all trips for the user
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

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Trips GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new trip
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
    const parsed = tripSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid trip data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('Trips POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a trip
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
    const parsed = tripUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid trip data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    const { data: trip, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trip:', error);
      return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Trips PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a trip
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
      return NextResponse.json({ error: 'Trip ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting trip:', error);
      return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trips DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

