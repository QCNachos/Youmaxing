import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Note: training_resources table not yet implemented
// These endpoints return stub data until the table is created

// GET - Fetch training resources
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Table not yet implemented - return empty array
    return NextResponse.json({ resources: [] });
  } catch (error) {
    console.error('Training resources GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new training resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Table not yet implemented
    return NextResponse.json({ 
      error: 'Feature not yet implemented',
      message: 'Training resources will be available in a future update'
    }, { status: 501 });
  } catch (error) {
    console.error('Training resources POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a training resource
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Table not yet implemented
    return NextResponse.json({ 
      error: 'Feature not yet implemented',
      message: 'Training resources will be available in a future update'
    }, { status: 501 });
  } catch (error) {
    console.error('Training resources PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a training resource
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Table not yet implemented
    return NextResponse.json({ success: true, message: 'Feature not yet implemented' });
  } catch (error) {
    console.error('Training resources DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
