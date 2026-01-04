import { NextRequest, NextResponse } from 'next/server';
import { getWatchProviders } from '@/lib/tmdb/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdb_id');
  const type = searchParams.get('type') as 'movie' | 'tv' | null;
  const country = searchParams.get('country') || 'US';
  
  if (!tmdbId) {
    return NextResponse.json(
      { error: 'Parameter "tmdb_id" is required' },
      { status: 400 }
    );
  }
  
  if (!type || !['movie', 'tv'].includes(type)) {
    return NextResponse.json(
      { error: 'Parameter "type" must be "movie" or "tv"' },
      { status: 400 }
    );
  }
  
  const id = parseInt(tmdbId);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Parameter "tmdb_id" must be a number' },
      { status: 400 }
    );
  }
  
  try {
    const providers = await getWatchProviders(id, type, country.toUpperCase());
    
    if (!providers) {
      return NextResponse.json({
        tmdb_id: id,
        type,
        country,
        providers: null,
        message: 'No streaming data available for this title in the specified country',
      });
    }
    
    return NextResponse.json({
      tmdb_id: id,
      type,
      country,
      providers: {
        streaming: providers.flatrate || [],
        rent: providers.rent || [],
        buy: providers.buy || [],
        free: providers.free || [],
      },
      link: providers.link,
    });
  } catch (error) {
    console.error('TMDB providers error:', error);
    
    if (error instanceof Error && error.message.includes('TMDB_API_KEY')) {
      return NextResponse.json(
        { error: 'TMDB API not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

