import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ResourceType } from '@/types/database';

// Helper to detect resource type from URL
function detectResourceType(url: string): ResourceType {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  }
  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return 'image';
  }
  if (lowerUrl.includes('medium.com') || lowerUrl.includes('blog') || lowerUrl.includes('article')) {
    return 'article';
  }
  
  return 'other';
}

// Helper to extract YouTube thumbnail
function getYouTubeThumbnail(url: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  
  return null;
}

// GET - Fetch training resources
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('type');
    const trainingType = searchParams.get('trainingType');
    const bodyPart = searchParams.get('bodyPart');
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('training_resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (trainingType) {
      query = query.eq('training_type', trainingType);
    }

    if (bodyPart) {
      query = query.contains('body_parts', [bodyPart]);
    }

    if (favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data: resources, error } = await query;

    if (error) {
      console.error('Error fetching training resources:', error);
      return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }

    return NextResponse.json({ resources });
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

    const body = await request.json();
    const {
      title,
      url,
      resource_type,
      training_type,
      body_parts,
      thumbnail_url,
      notes,
      is_favorite,
    } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Auto-detect resource type if not provided
    const detectedType = resource_type || detectResourceType(url);
    
    // Auto-get thumbnail for YouTube if not provided
    let finalThumbnail = thumbnail_url;
    if (!finalThumbnail && detectedType === 'youtube') {
      finalThumbnail = getYouTubeThumbnail(url);
    }

    const { data: resource, error } = await supabase
      .from('training_resources')
      .insert({
        user_id: user.id,
        title,
        url,
        resource_type: detectedType,
        training_type: training_type || null,
        body_parts: body_parts || [],
        thumbnail_url: finalThumbnail,
        notes: notes || null,
        is_favorite: is_favorite || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating training resource:', error);
      return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
    }

    return NextResponse.json({ resource });
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const { data: resource, error } = await supabase
      .from('training_resources')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating training resource:', error);
      return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
    }

    return NextResponse.json({ resource });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('training_resources')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting training resource:', error);
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training resources DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

