// TheSportsDB API Client
// Free API for sports teams, leagues, and logos
// Documentation: https://www.thesportsdb.com/api.php

const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

export interface SportsDBLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueAlternate: string | null;
}

export interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string | null;
  strAlternate: string | null;
  strLeague: string;
  strStadium: string | null;
  strStadiumLocation: string | null;
  strCountry: string | null;
  strBadge: string | null; // Team logo URL
  strJersey: string | null;
  strFanart1: string | null;
}

// Popular leagues we want to show
export const POPULAR_LEAGUES = [
  // American Football
  { id: '4391', name: 'NFL', sport: 'American Football' },
  // Basketball
  { id: '4387', name: 'NBA', sport: 'Basketball' },
  // Baseball
  { id: '4424', name: 'MLB', sport: 'Baseball' },
  // Hockey
  { id: '4380', name: 'NHL', sport: 'Ice Hockey' },
  // Soccer - Major Leagues
  { id: '4328', name: 'English Premier League', sport: 'Soccer' },
  { id: '4335', name: 'La Liga', sport: 'Soccer' },
  { id: '4331', name: 'Bundesliga', sport: 'Soccer' },
  { id: '4332', name: 'Serie A', sport: 'Soccer' },
  { id: '4334', name: 'Ligue 1', sport: 'Soccer' },
  { id: '4346', name: 'MLS', sport: 'Soccer' },
  { id: '4350', name: 'Liga MX', sport: 'Soccer' },
  // Champions League
  { id: '4480', name: 'UEFA Champions League', sport: 'Soccer' },
];

/**
 * Get all teams for a specific league
 */
export async function getTeamsByLeague(leagueName: string): Promise<SportsDBTeam[]> {
  const url = `${SPORTSDB_BASE_URL}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.teams) {
    return [];
  }
  
  return data.teams.map((team: any) => ({
    idTeam: team.idTeam,
    strTeam: team.strTeam,
    strTeamShort: team.strTeamShort,
    strAlternate: team.strAlternate,
    strLeague: team.strLeague,
    strStadium: team.strStadium,
    strStadiumLocation: team.strStadiumLocation,
    strCountry: team.strCountry,
    strBadge: team.strBadge,
    strJersey: team.strJersey,
    strFanart1: team.strFanart1,
  }));
}

/**
 * Search for teams by name
 */
export async function searchTeams(teamName: string): Promise<SportsDBTeam[]> {
  const url = `${SPORTSDB_BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.teams) {
    return [];
  }
  
  return data.teams.map((team: any) => ({
    idTeam: team.idTeam,
    strTeam: team.strTeam,
    strTeamShort: team.strTeamShort,
    strAlternate: team.strAlternate,
    strLeague: team.strLeague,
    strStadium: team.strStadium,
    strStadiumLocation: team.strStadiumLocation,
    strCountry: team.strCountry,
    strBadge: team.strBadge,
    strJersey: team.strJersey,
    strFanart1: team.strFanart1,
  }));
}

/**
 * Get team details by ID
 */
export async function getTeamById(teamId: string): Promise<SportsDBTeam | null> {
  const url = `${SPORTSDB_BASE_URL}/lookupteam.php?id=${teamId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.teams || data.teams.length === 0) {
    return null;
  }
  
  const team = data.teams[0];
  return {
    idTeam: team.idTeam,
    strTeam: team.strTeam,
    strTeamShort: team.strTeamShort,
    strAlternate: team.strAlternate,
    strLeague: team.strLeague,
    strStadium: team.strStadium,
    strStadiumLocation: team.strStadiumLocation,
    strCountry: team.strCountry,
    strBadge: team.strBadge,
    strJersey: team.strJersey,
    strFanart1: team.strFanart1,
  };
}

// Event/Game types
export interface SportsDBEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate: string | null;
  strLeague: string;
  idLeague: string;
  strSeason: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strVenue: string | null;
  dateEvent: string; // YYYY-MM-DD
  strTime: string | null; // HH:MM:SS
  strTimestamp: string | null;
  strThumb: string | null;
  strBanner: string | null;
}

export interface NormalizedGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
  time: string;
  league: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  isFavoriteTeamPlaying: boolean;
  thumbnail: string | null;
}

/**
 * Get next 5 events/games for a team
 */
export async function getNextEventsForTeam(teamId: string): Promise<SportsDBEvent[]> {
  const url = `${SPORTSDB_BASE_URL}/eventsnext.php?id=${teamId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.events) {
    return [];
  }
  
  return data.events.map((event: any) => ({
    idEvent: event.idEvent,
    strEvent: event.strEvent,
    strEventAlternate: event.strEventAlternate,
    strLeague: event.strLeague,
    idLeague: event.idLeague,
    strSeason: event.strSeason,
    strHomeTeam: event.strHomeTeam,
    strAwayTeam: event.strAwayTeam,
    idHomeTeam: event.idHomeTeam,
    idAwayTeam: event.idAwayTeam,
    intHomeScore: event.intHomeScore,
    intAwayScore: event.intAwayScore,
    strVenue: event.strVenue,
    dateEvent: event.dateEvent,
    strTime: event.strTime,
    strTimestamp: event.strTimestamp,
    strThumb: event.strThumb,
    strBanner: event.strBanner,
  }));
}

/**
 * Get last 5 events/games for a team (results)
 */
export async function getLastEventsForTeam(teamId: string): Promise<SportsDBEvent[]> {
  const url = `${SPORTSDB_BASE_URL}/eventslast.php?id=${teamId}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TheSportsDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.results) {
    return [];
  }
  
  return data.results.map((event: any) => ({
    idEvent: event.idEvent,
    strEvent: event.strEvent,
    strEventAlternate: event.strEventAlternate,
    strLeague: event.strLeague,
    idLeague: event.idLeague,
    strSeason: event.strSeason,
    strHomeTeam: event.strHomeTeam,
    strAwayTeam: event.strAwayTeam,
    idHomeTeam: event.idHomeTeam,
    idAwayTeam: event.idAwayTeam,
    intHomeScore: event.intHomeScore,
    intAwayScore: event.intAwayScore,
    strVenue: event.strVenue,
    dateEvent: event.dateEvent,
    strTime: event.strTime,
    strTimestamp: event.strTimestamp,
    strThumb: event.strThumb,
    strBanner: event.strBanner,
  }));
}

/**
 * Normalize event to our game format
 */
export function normalizeEvent(event: SportsDBEvent, favoriteTeamIds: string[]): NormalizedGame {
  // Parse date and time
  const dateStr = event.dateEvent;
  const timeStr = event.strTime || '00:00:00';
  const dateTime = new Date(`${dateStr}T${timeStr}`);
  
  // Format time for display
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  
  return {
    id: event.idEvent,
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeTeamId: event.idHomeTeam,
    awayTeamId: event.idAwayTeam,
    date: dateTime,
    time: displayTime,
    league: event.strLeague,
    venue: event.strVenue,
    homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
    awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
    isFavoriteTeamPlaying: favoriteTeamIds.includes(event.idHomeTeam) || favoriteTeamIds.includes(event.idAwayTeam),
    thumbnail: event.strThumb,
  };
}

