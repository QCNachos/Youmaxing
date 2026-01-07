// TMDB API Types

export interface TMDBSearchResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TMDBProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBWatchProviderResult {
  link: string;
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
  free?: TMDBProvider[];
}

export interface TMDBWatchProvidersResponse {
  id: number;
  results: Record<string, TMDBWatchProviderResult>;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: TMDBGenre[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  genres: TMDBGenre[];
  status: string;
  networks: { id: number; name: string; logo_path: string | null }[];
}

// Normalized result for our app
export interface NormalizedMediaResult {
  tmdbId: number;
  title: string;
  type: 'movie' | 'series';
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  rating: number;
  genres: string[];
  franchise?: string;
}

// Genre ID to name mapping (common ones)
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV specific
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// Known franchise mappings based on collection or keywords
export const FRANCHISE_MAPPINGS: Record<string, string> = {
  // Movies
  'Star Wars Collection': 'star_wars',
  'The Lord of the Rings Collection': 'lotr',
  'The Hobbit Collection': 'lotr',
  'Harry Potter Collection': 'harry_potter',
  'The Matrix Collection': 'matrix',
  'The Dark Knight Collection': 'dc',
  'Marvel Cinematic Universe': 'mcu',
  'Dune Collection': 'dune',
  'Back to the Future Collection': 'back_to_the_future',
  'Ocean\'s Collection': 'oceans',
  // TV shows by name patterns
  'Game of Thrones': 'got',
  'House of the Dragon': 'got',
  'The Mandalorian': 'star_wars',
  'The Book of Boba Fett': 'star_wars',
  'Andor': 'star_wars',
  'Ahsoka': 'star_wars',
  'Obi-Wan Kenobi': 'star_wars',
  'The Rings of Power': 'lotr',
  'Vikings': 'vikings',
  'Vikings: Valhalla': 'vikings',
};



