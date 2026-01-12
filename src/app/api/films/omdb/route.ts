import { NextRequest, NextResponse } from 'next/server';
import { getOMDBByTitle, getOMDBById, searchOMDB, getPosterByTitle } from '@/lib/omdb/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title');
  const imdbId = searchParams.get('imdb_id');
  const search = searchParams.get('search');
  const year = searchParams.get('year');
  const type = searchParams.get('type') as 'movie' | 'series' | null;
  const posterOnly = searchParams.get('poster_only') === 'true';
  
  try {
    // Just get poster URL (quick lookup)
    if (posterOnly && title) {
      const posterUrl = await getPosterByTitle(
        title,
        year ? parseInt(year) : undefined,
        type || undefined
      );
      return NextResponse.json({ posterUrl });
    }
    
    // Search for movies/series
    if (search) {
      const results = await searchOMDB(
        search,
        type || undefined,
        year ? parseInt(year) : undefined
      );
      return NextResponse.json({
        results,
        count: results.length,
      });
    }
    
    // Get by IMDB ID
    if (imdbId) {
      const result = await getOMDBById(imdbId);
      if (!result) {
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }
    
    // Get by title
    if (title) {
      const result = await getOMDBByTitle(
        title,
        year ? parseInt(year) : undefined,
        type || undefined
      );
      if (!result) {
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { error: 'Missing required parameter: title, imdb_id, or search' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OMDB API error:', error);
    
    if (error instanceof Error && error.message.includes('OMDB_API_KEY')) {
      return NextResponse.json(
        { error: 'OMDB API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch movie data' },
      { status: 500 }
    );
  }
}

