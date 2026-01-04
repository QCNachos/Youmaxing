/**
 * Spotify API Client
 * Handles OAuth flow and API interactions
 */

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Required scopes for our features
const SCOPES = [
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-top-read',
  'user-read-recently-played',
].join(' ');

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
    release_date: string;
  };
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: Array<{ url: string; width: number; height: number }>;
  tracks: { total: number };
  owner: { id: string; display_name: string };
  external_urls: { spotify: string };
}

/**
 * Generate Spotify OAuth authorization URL
 */
export function getSpotifyAuthUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spotify/callback`;
  
  if (!clientId) {
    throw new Error('SPOTIFY_CLIENT_ID is not configured');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    show_dialog: 'true',
  });
  
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/spotify/callback`;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }
  
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }
  
  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('SPOTIFY_TOKEN_EXPIRED');
    }
    throw new Error(`Spotify API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get user's top tracks
 */
export async function getUserTopTracks(
  accessToken: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 50
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
  return data.items;
}

/**
 * Get user's saved tracks (library)
 */
export async function getUserSavedTracks(
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ items: Array<{ added_at: string; track: SpotifyTrack }>; total: number }> {
  return spotifyFetch(
    `/me/tracks?limit=${limit}&offset=${offset}`,
    accessToken
  );
}

/**
 * Get user's playlists
 */
export async function getUserPlaylists(
  accessToken: string,
  limit: number = 50
): Promise<SpotifyPlaylist[]> {
  const data = await spotifyFetch<{ items: SpotifyPlaylist[] }>(
    `/me/playlists?limit=${limit}`,
    accessToken
  );
  return data.items;
}

/**
 * Get user's recently played tracks
 */
export async function getRecentlyPlayed(
  accessToken: string,
  limit: number = 50
): Promise<Array<{ played_at: string; track: SpotifyTrack }>> {
  const data = await spotifyFetch<{ items: Array<{ played_at: string; track: SpotifyTrack }> }>(
    `/me/player/recently-played?limit=${limit}`,
    accessToken
  );
  return data.items;
}

/**
 * Search for tracks, albums, artists
 */
export async function search(
  accessToken: string,
  query: string,
  types: ('track' | 'album' | 'artist' | 'playlist')[] = ['track'],
  limit: number = 20
): Promise<{
  tracks?: { items: SpotifyTrack[] };
  albums?: { items: Array<{ id: string; name: string; artists: Array<{ name: string }>; images: Array<{ url: string }> }> };
  artists?: { items: Array<{ id: string; name: string; images: Array<{ url: string }>; genres: string[] }> };
}> {
  return spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=${types.join(',')}&limit=${limit}`,
    accessToken
  );
}

/**
 * Get track details
 */
export async function getTrack(accessToken: string, trackId: string): Promise<SpotifyTrack> {
  return spotifyFetch(`/tracks/${trackId}`, accessToken);
}

/**
 * Normalize Spotify track to our format
 */
export function normalizeTrack(track: SpotifyTrack): {
  spotify_id: string;
  title: string;
  artist: string;
  album: string;
  cover_url: string | null;
  preview_url: string | null;
  release_year: number | null;
} {
  return {
    spotify_id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    cover_url: track.album.images[0]?.url || null,
    preview_url: track.preview_url,
    release_year: track.album.release_date 
      ? parseInt(track.album.release_date.substring(0, 4)) 
      : null,
  };
}

