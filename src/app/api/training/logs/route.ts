import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch training logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('training_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching training logs:', error);
      return NextResponse.json({ error: 'Failed to fetch training logs' }, { status: 500 });
    }

    // Return logs with empty exercises array (workout_exercises table not yet implemented)
    const logsWithExercises = logs?.map(log => ({
      ...log,
      exercises: []
    }));

    return NextResponse.json({ logs: logsWithExercises });
  } catch (error) {
    console.error('Training logs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new training log
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      duration_minutes,
      intensity,
      notes,
    } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Insert training log (using only columns that exist in the schema)
    const { data: log, error: logError } = await supabase
      .from('training_logs')
      .insert({
        user_id: user.id,
        title,
        type: type || null,
        duration_minutes: duration_minutes || null,
        intensity: intensity || 'medium',
        notes: notes || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating training log:', logError);
      return NextResponse.json({ error: 'Failed to create training log' }, { status: 500 });
    }

    // Note: workout_exercises table not yet implemented
    // Exercises will be supported in a future update

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Training logs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a training log
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, exercises, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    // Only update columns that exist in the schema
    const allowedFields = ['title', 'type', 'duration_minutes', 'intensity', 'notes', 'completed_at'];
    const filteredUpdate: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updateData) {
        filteredUpdate[key] = updateData[key];
      }
    }

    // Update training log
    const { data: log, error: logError } = await supabase
      .from('training_logs')
      .update(filteredUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (logError) {
      console.error('Error updating training log:', logError);
      return NextResponse.json({ error: 'Failed to update training log' }, { status: 500 });
    }

    // Note: workout_exercises table not yet implemented

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Training logs PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a training log
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    // Exercises will be cascade deleted
    const { error } = await supabase
      .from('training_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting training log:', error);
      return NextResponse.json({ error: 'Failed to delete training log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training logs DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

