import { NextRequest, NextResponse } from 'next/server';
import { 
  getTeamsByLeague, 
  searchTeams, 
  POPULAR_LEAGUES,
  getNextEventsForTeam,
  getLastEventsForTeam,
  normalizeEvent,
} from '@/lib/sportsdb/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get('league');
  const search = searchParams.get('search');
  const teamId = searchParams.get('team_id');
  const events = searchParams.get('events'); // 'next' or 'last'
  const favoriteIds = searchParams.get('favorite_ids'); // comma-separated team IDs
  
  try {
    // Get events for a specific team
    if (teamId && events) {
      const favoriteTeamIds = favoriteIds ? favoriteIds.split(',') : [];
      
      if (events === 'next') {
        const rawEvents = await getNextEventsForTeam(teamId);
        const normalizedEvents = rawEvents.map(e => normalizeEvent(e, favoriteTeamIds));
        return NextResponse.json({
          events: normalizedEvents,
          count: normalizedEvents.length,
          teamId,
        });
      }
      
      if (events === 'last') {
        const rawEvents = await getLastEventsForTeam(teamId);
        const normalizedEvents = rawEvents.map(e => normalizeEvent(e, favoriteTeamIds));
        return NextResponse.json({
          events: normalizedEvents,
          count: normalizedEvents.length,
          teamId,
        });
      }
    }
    
    // If searching by team name
    if (search) {
      const teams = await searchTeams(search);
      return NextResponse.json({
        teams,
        count: teams.length,
      });
    }
    
    // If getting teams by league
    if (league) {
      const teams = await getTeamsByLeague(league);
      return NextResponse.json({
        teams,
        count: teams.length,
        league,
      });
    }
    
    // If no params, return the list of popular leagues
    return NextResponse.json({
      leagues: POPULAR_LEAGUES,
    });
  } catch (error) {
    console.error('Sports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports data' },
      { status: 500 }
    );
  }
}

