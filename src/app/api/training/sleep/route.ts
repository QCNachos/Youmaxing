import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch sleep logs
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
    const limit = parseInt(searchParams.get('limit') || '30');

    let query = supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('sleep_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('sleep_date', startDate);
    }

    if (endDate) {
      query = query.lte('sleep_date', endDate);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching sleep logs:', error);
      return NextResponse.json({ error: 'Failed to fetch sleep logs' }, { status: 500 });
    }

    // Calculate summary stats
    let summary = null;
    if (logs && logs.length > 0) {
      const totalHours = logs.reduce((sum, log) => sum + (log.hours_slept || 0), 0);
      const totalQuality = logs.filter(log => log.quality_rating).reduce((sum, log) => sum + (log.quality_rating || 0), 0);
      const qualityCount = logs.filter(log => log.quality_rating).length;

      summary = {
        avg_hours: Math.round((totalHours / logs.length) * 10) / 10,
        avg_quality: qualityCount > 0 ? Math.round((totalQuality / qualityCount) * 10) / 10 : null,
        days_logged: logs.length,
      };
    }

    return NextResponse.json({ logs, summary });
  } catch (error) {
    console.error('Sleep logs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new sleep log
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sleep_date, hours_slept, quality_rating, notes } = body;

    if (!sleep_date || hours_slept === undefined) {
      return NextResponse.json({ error: 'Sleep date and hours are required' }, { status: 400 });
    }

    if (hours_slept < 0 || hours_slept > 24) {
      return NextResponse.json({ error: 'Hours slept must be between 0 and 24' }, { status: 400 });
    }

    if (quality_rating !== undefined && (quality_rating < 1 || quality_rating > 5)) {
      return NextResponse.json({ error: 'Quality rating must be between 1 and 5' }, { status: 400 });
    }

    // Use upsert to handle duplicate dates
    const { data: log, error } = await supabase
      .from('sleep_logs')
      .upsert({
        user_id: user.id,
        sleep_date,
        hours_slept,
        quality_rating: quality_rating || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,sleep_date',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sleep log:', error);
      return NextResponse.json({ error: 'Failed to create sleep log' }, { status: 500 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Sleep logs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a sleep log
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    const { data: log, error } = await supabase
      .from('sleep_logs')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sleep log:', error);
      return NextResponse.json({ error: 'Failed to update sleep log' }, { status: 500 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Sleep logs PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a sleep log
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

    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting sleep log:', error);
      return NextResponse.json({ error: 'Failed to delete sleep log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sleep logs DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

