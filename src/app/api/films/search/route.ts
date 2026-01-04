import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB } from '@/lib/tmdb/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') as 'movie' | 'tv' | 'multi' | null;
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }
  
  if (query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    );
  }
  
  try {
    const results = await searchTMDB(query, type || 'multi');
    
    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('TMDB search error:', error);
    
    if (error instanceof Error && error.message.includes('TMDB_API_KEY')) {
      return NextResponse.json(
        { error: 'TMDB API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search TMDB' },
      { status: 500 }
    );
  }
}

