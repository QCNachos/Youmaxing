/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 * Free, no API key required!
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Geocode a location (city and/or country) to coordinates using Nominatim
 * Returns actual lat/lng coordinates
 */
export async function geocodeLocation(country: string, city?: string | null): Promise<Coordinates> {
  try {
    // Build the query
    const query = city ? `${city}, ${country}` : country;
    
    // Use Nominatim API (OpenStreetMap's free geocoding service)
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Youmaxing-Travel-App', // Nominatim requires User-Agent
      },
    });
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    
    // Fallback to center of map if not found
    console.warn(`Location not found: ${query}`);
    return { lat: 0, lng: 0 };
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to center of map
    return { lat: 0, lng: 0 };
  }
}

/**
 * Batch geocode multiple locations (with rate limiting)
 */
export async function geocodeLocations(
  locations: Array<{ country: string; city?: string | null }>
): Promise<Coordinates[]> {
  const results: Coordinates[] = [];
  
  for (const location of locations) {
    const coords = await geocodeLocation(location.country, location.city);
    results.push(coords);
    
    // Rate limiting: wait 1 second between requests (Nominatim policy)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Convert old percentage coordinates to lat/lng (for backward compatibility)
 * This is approximate and may not be accurate
 */
export function percentToLatLng(x: number, y: number): Coordinates {
  // x: 0-100 (left to right) → lng: -180 to 180
  // y: 0-100 (top to bottom) → lat: 85 to -85 (mercator projection limits)
  const lng = (x - 50) * 3.6; // -180 to 180
  const lat = (50 - y) * 1.7; // 85 to -85
  return { lat, lng };
}

/**
 * Check if coordinates are valid lat/lng
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
