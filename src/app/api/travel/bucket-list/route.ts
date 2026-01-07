import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode, isSupabaseConfigured } from '@/lib/env';
import { z } from 'zod';

const bucketListSchema = z.object({
  destination: z.string().min(1).max(200),
  country: z.string().max(100).nullable().optional(),
  emoji: z.string().max(10).optional().default('🌍'),
  reason: z.string().max(500).nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  notes: z.string().max(1000).nullable().optional(),
});

const bucketListUpdateSchema = bucketListSchema.partial().extend({
  id: z.string().uuid(),
});

// GET: Fetch all bucket list items for the user
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

    const { data: items, error } = await supabase
      .from('bucket_list')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bucket list:', error);
      return NextResponse.json({ error: 'Failed to fetch bucket list' }, { status: 500 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Bucket list GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new bucket list item
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
    const parsed = bucketListSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid bucket list data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('bucket_list')
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bucket list item:', error);
      return NextResponse.json({ error: 'Failed to create bucket list item' }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Bucket list POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a bucket list item
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
    const parsed = bucketListUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid bucket list data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    const { data: item, error } = await supabase
      .from('bucket_list')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bucket list item:', error);
      return NextResponse.json({ error: 'Failed to update bucket list item' }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Bucket list PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a bucket list item
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
      return NextResponse.json({ error: 'Bucket list item ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bucket list item:', error);
      return NextResponse.json({ error: 'Failed to delete bucket list item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bucket list DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

