import type {
  TMDBSearchResponse,
  TMDBSearchResult,
  TMDBWatchProvidersResponse,
  TMDBMovieDetails,
  TMDBTVDetails,
  NormalizedMediaResult,
} from './types';

import { TMDB_GENRES, FRANCHISE_MAPPINGS } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }
  return key;
}

function buildHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Get full image URL from TMDB path
 */
export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Search for movies and TV shows
 */
export async function searchTMDB(
  query: string, 
  type: 'movie' | 'tv' | 'multi' = 'multi',
  page: number = 1
): Promise<NormalizedMediaResult[]> {
  const url = `${TMDB_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  
  const response = await fetch(url, { headers: buildHeaders() });
  
  if (!response.ok) {
    throw new Error(`TMDB search failed: ${response.status}`);
  }
  
  const data: TMDBSearchResponse = await response.json();
  
  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .map(normalizeSearchResult);
}

/**
 * Get watch providers (streaming availability) for a title
 */
export async function getWatchProviders(
  tmdbId: number, 
  type: 'movie' | 'tv', 
  country: string = 'US'
): Promise<{
  flatrate?: Array<{ id: number; name: string; logoUrl: string }>;
  rent?: Array<{ id: number; name: string; logoUrl: string }>;
  buy?: Array<{ id: number; name: string; logoUrl: string }>;
  free?: Array<{ id: number; name: string; logoUrl: string }>;
  link?: string;
} | null> {
  const url = `${TMDB_BASE_URL}/${type}/${tmdbId}/watch/providers`;
  
  const response = await fetch(url, { headers: buildHeaders() });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`TMDB providers failed: ${response.status}`);
  }
  
  const data: TMDBWatchProvidersResponse = await response.json();
  const countryData = data.results[country];
  
  if (!countryData) return null;
  
  const normalizeProviders = (providers?: Array<{ provider_id: number; provider_name: string; logo_path: string }>) =>
    providers?.map(p => ({
      id: p.provider_id,
      name: p.provider_name,
      logoUrl: getImageUrl(p.logo_path, 'w92') || '',
    }));
  
  return {
    flatrate: normalizeProviders(countryData.flatrate),
    rent: normalizeProviders(countryData.rent),
    buy: normalizeProviders(countryData.buy),
    free: normalizeProviders(countryData.free),
    link: countryData.link,
  };
}

/**
 * Get detailed information about a movie
 */
export async function getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails | null> {
  const url = `${TMDB_BASE_URL}/movie/${tmdbId}`;
  
  const response = await fetch(url, { headers: buildHeaders() });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`TMDB movie details failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get detailed information about a TV show
 */
export async function getTVDetails(tmdbId: number): Promise<TMDBTVDetails | null> {
  const url = `${TMDB_BASE_URL}/tv/${tmdbId}`;
  
  const response = await fetch(url, { headers: buildHeaders() });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`TMDB TV details failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get details for either movie or TV
 */
export async function getDetails(
  tmdbId: number, 
  type: 'movie' | 'tv'
): Promise<NormalizedMediaResult | null> {
  if (type === 'movie') {
    const details = await getMovieDetails(tmdbId);
    if (!details) return null;
    return normalizeMovieDetails(details);
  } else {
    const details = await getTVDetails(tmdbId);
    if (!details) return null;
    return normalizeTVDetails(details);
  }
}

// Helper functions

function normalizeSearchResult(result: TMDBSearchResult): NormalizedMediaResult {
  const title = result.title || result.name || 'Unknown';
  const releaseDate = result.release_date || result.first_air_date;
  const type = result.media_type === 'movie' ? 'movie' : 'series';
  
  // Check for known franchise
  const franchise = detectFranchise(title);
  
  return {
    tmdbId: result.id,
    title,
    type,
    overview: result.overview,
    posterUrl: getImageUrl(result.poster_path),
    backdropUrl: getImageUrl(result.backdrop_path, 'w780'),
    releaseYear: releaseDate ? parseInt(releaseDate.substring(0, 4)) : null,
    rating: Math.round(result.vote_average * 10) / 10,
    genres: result.genre_ids.map(id => TMDB_GENRES[id]).filter(Boolean),
    franchise,
  };
}

function normalizeMovieDetails(details: TMDBMovieDetails): NormalizedMediaResult {
  // Check collection for franchise
  let franchise = details.belongs_to_collection 
    ? FRANCHISE_MAPPINGS[details.belongs_to_collection.name] 
    : undefined;
  
  if (!franchise) {
    franchise = detectFranchise(details.title);
  }
  
  return {
    tmdbId: details.id,
    title: details.title,
    type: 'movie',
    overview: details.overview,
    posterUrl: getImageUrl(details.poster_path),
    backdropUrl: getImageUrl(details.backdrop_path, 'w780'),
    releaseYear: details.release_date ? parseInt(details.release_date.substring(0, 4)) : null,
    rating: Math.round(details.vote_average * 10) / 10,
    genres: details.genres.map(g => g.name),
    franchise,
  };
}

function normalizeTVDetails(details: TMDBTVDetails): NormalizedMediaResult {
  const franchise = detectFranchise(details.name);
  
  return {
    tmdbId: details.id,
    title: details.name,
    type: 'series',
    overview: details.overview,
    posterUrl: getImageUrl(details.poster_path),
    backdropUrl: getImageUrl(details.backdrop_path, 'w780'),
    releaseYear: details.first_air_date ? parseInt(details.first_air_date.substring(0, 4)) : null,
    rating: Math.round(details.vote_average * 10) / 10,
    genres: details.genres.map(g => g.name),
    franchise,
  };
}

function detectFranchise(title: string): string | undefined {
  // Check exact matches first
  if (FRANCHISE_MAPPINGS[title]) {
    return FRANCHISE_MAPPINGS[title];
  }
  
  // Check partial matches for TV shows
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('star wars') || lowerTitle.includes('mandalorian') || 
      lowerTitle.includes('boba fett') || lowerTitle.includes('andor') ||
      lowerTitle.includes('ahsoka') || lowerTitle.includes('obi-wan')) {
    return 'star_wars';
  }
  
  if (lowerTitle.includes('game of thrones') || lowerTitle.includes('house of the dragon')) {
    return 'got';
  }
  
  if (lowerTitle.includes('lord of the rings') || lowerTitle.includes('rings of power') ||
      lowerTitle.includes('hobbit')) {
    return 'lotr';
  }
  
  if (lowerTitle.includes('harry potter') || lowerTitle.includes('fantastic beasts')) {
    return 'harry_potter';
  }
  
  if (lowerTitle.includes('matrix')) {
    return 'matrix';
  }
  
  return undefined;
}

