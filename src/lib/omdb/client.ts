// OMDB API Client
// API for movie and TV show data with reliable poster URLs
// Get a free API key at: https://www.omdbapi.com/apikey.aspx

const OMDB_BASE_URL = 'https://www.omdbapi.com';

function getApiKey(): string {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    throw new Error('OMDB_API_KEY environment variable is not set');
  }
  return key;
}

export interface OMDBSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  Poster: string;
}

export interface OMDBDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: 'movie' | 'series' | 'episode';
  totalSeasons?: string;
  Response: 'True' | 'False';
  Error?: string;
}

export interface NormalizedOMDBResult {
  title: string;
  year: number | null;
  imdbId: string;
  type: 'movie' | 'series';
  posterUrl: string | null;
  plot: string | null;
  genre: string[];
  director: string | null;
  actors: string[];
  imdbRating: number | null;
}

/**
 * Search for movies and TV shows by title
 */
export async function searchOMDB(
  query: string,
  type?: 'movie' | 'series',
  year?: number
): Promise<OMDBSearchResult[]> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    s: query,
  });
  
  if (type) params.append('type', type);
  if (year) params.append('y', year.toString());
  
  const response = await fetch(`${OMDB_BASE_URL}/?${params}`);
  
  if (!response.ok) {
    throw new Error(`OMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.Response === 'False') {
    return [];
  }
  
  return data.Search || [];
}

/**
 * Get detailed information about a movie or TV show by title
 */
export async function getOMDBByTitle(
  title: string,
  year?: number,
  type?: 'movie' | 'series'
): Promise<NormalizedOMDBResult | null> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    t: title,
    plot: 'short',
  });
  
  if (type) params.append('type', type);
  if (year) params.append('y', year.toString());
  
  const response = await fetch(`${OMDB_BASE_URL}/?${params}`);
  
  if (!response.ok) {
    throw new Error(`OMDB API error: ${response.status}`);
  }
  
  const data: OMDBDetails = await response.json();
  
  if (data.Response === 'False') {
    return null;
  }
  
  return normalizeOMDBResult(data);
}

/**
 * Get detailed information about a movie or TV show by IMDB ID
 */
export async function getOMDBById(imdbId: string): Promise<NormalizedOMDBResult | null> {
  const params = new URLSearchParams({
    apikey: getApiKey(),
    i: imdbId,
    plot: 'short',
  });
  
  const response = await fetch(`${OMDB_BASE_URL}/?${params}`);
  
  if (!response.ok) {
    throw new Error(`OMDB API error: ${response.status}`);
  }
  
  const data: OMDBDetails = await response.json();
  
  if (data.Response === 'False') {
    return null;
  }
  
  return normalizeOMDBResult(data);
}

/**
 * Get just the poster URL for a title (quick lookup)
 */
export async function getPosterByTitle(
  title: string,
  year?: number,
  type?: 'movie' | 'series'
): Promise<string | null> {
  try {
    const result = await getOMDBByTitle(title, year, type);
    return result?.posterUrl || null;
  } catch {
    return null;
  }
}

function normalizeOMDBResult(data: OMDBDetails): NormalizedOMDBResult {
  const posterUrl = data.Poster && data.Poster !== 'N/A' ? data.Poster : null;
  const year = data.Year ? parseInt(data.Year.split('–')[0]) : null;
  const imdbRating = data.imdbRating && data.imdbRating !== 'N/A' 
    ? parseFloat(data.imdbRating) 
    : null;
  
  return {
    title: data.Title,
    year,
    imdbId: data.imdbID,
    type: data.Type === 'series' ? 'series' : 'movie',
    posterUrl,
    plot: data.Plot && data.Plot !== 'N/A' ? data.Plot : null,
    genre: data.Genre && data.Genre !== 'N/A' 
      ? data.Genre.split(', ').map(g => g.trim()) 
      : [],
    director: data.Director && data.Director !== 'N/A' ? data.Director : null,
    actors: data.Actors && data.Actors !== 'N/A' 
      ? data.Actors.split(', ').map(a => a.trim()) 
      : [],
    imdbRating,
  };
}

