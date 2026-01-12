import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TrainingLog, TrainingType, TrainingIntensity, BodyPart } from '@/types/database';

// GET - Fetch training logs with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('training_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte('workout_date', startDate);
    }

    if (endDate) {
      query = query.lte('workout_date', endDate);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching training logs:', error);
      return NextResponse.json({ error: 'Failed to fetch training logs' }, { status: 500 });
    }

    // Fetch exercises for each log
    const logIds = logs?.map(log => log.id) || [];
    let exercises: any[] = [];
    
    if (logIds.length > 0) {
      const { data: exercisesData } = await supabase
        .from('workout_exercises')
        .select('*')
        .in('training_log_id', logIds)
        .order('order_index', { ascending: true });
      
      exercises = exercisesData || [];
    }

    // Attach exercises to their respective logs
    const logsWithExercises = logs?.map(log => ({
      ...log,
      exercises: exercises.filter(ex => ex.training_log_id === log.id)
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
      body_parts,
      distance_km,
      calories_burned,
      heart_rate_avg,
      heart_rate_max,
      workout_date,
      exercises,
    } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Insert training log
    const { data: log, error: logError } = await supabase
      .from('training_logs')
      .insert({
        user_id: user.id,
        title,
        type: type as TrainingType,
        duration_minutes: duration_minutes || null,
        intensity: (intensity || 'medium') as TrainingIntensity,
        notes: notes || null,
        body_parts: body_parts || [],
        distance_km: distance_km || null,
        calories_burned: calories_burned || null,
        heart_rate_avg: heart_rate_avg || null,
        heart_rate_max: heart_rate_max || null,
        workout_date: workout_date || new Date().toISOString().split('T')[0],
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating training log:', logError);
      return NextResponse.json({ error: 'Failed to create training log' }, { status: 500 });
    }

    // Insert exercises if provided (for strength training)
    if (exercises && exercises.length > 0 && log) {
      const exercisesToInsert = exercises.map((ex: any, index: number) => ({
        training_log_id: log.id,
        user_id: user.id,
        exercise_name: ex.exercise_name,
        sets: ex.sets || null,
        reps: ex.reps || null,
        weight_kg: ex.weight_kg || null,
        notes: ex.notes || null,
        order_index: index,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) {
        console.error('Error inserting exercises:', exercisesError);
        // Don't fail the whole request, log was created
      }
    }

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
    const { id, exercises, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    // Update training log
    const { data: log, error: logError } = await supabase
      .from('training_logs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (logError) {
      console.error('Error updating training log:', logError);
      return NextResponse.json({ error: 'Failed to update training log' }, { status: 500 });
    }

    // Update exercises if provided
    if (exercises !== undefined) {
      // Delete existing exercises
      await supabase
        .from('workout_exercises')
        .delete()
        .eq('training_log_id', id);

      // Insert new exercises
      if (exercises.length > 0) {
        const exercisesToInsert = exercises.map((ex: any, index: number) => ({
          training_log_id: id,
          user_id: user.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets || null,
          reps: ex.reps || null,
          weight_kg: ex.weight_kg || null,
          notes: ex.notes || null,
          order_index: index,
        }));

        await supabase
          .from('workout_exercises')
          .insert(exercisesToInsert);
      }
    }

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

