/**
 * Claude Code Sync Instructions
 * 
 * These are prompts/instructions for Claude Code to collect streaming data
 * using the user's existing browser sessions.
 */

import type { StreamingService, SyncInstructions } from './types';

export const SYNC_INSTRUCTIONS: Record<StreamingService, SyncInstructions> = {
  netflix: {
    service: 'netflix',
    steps: [
      '1. Navigate to netflix.com/browse/my-list',
      '2. Scroll to load all items in My List',
      '3. For each item, extract: title, type (movie/series), poster image URL',
      '4. Navigate to netflix.com/browse/continue-watching if accessible',
      '5. Extract items with their progress percentage',
      '6. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.netflix.com/browse/my-list',
      continue_watching: 'https://www.netflix.com/browse',
      history: 'https://www.netflix.com/viewingactivity',
    },
  },
  
  prime_video: {
    service: 'prime_video',
    steps: [
      '1. Navigate to amazon.com/gp/video/watchlist',
      '2. Scroll to load the full watchlist',
      '3. For each item, extract: title, type, poster URL, ASIN if visible',
      '4. Navigate to amazon.com/gp/video/storefront for continue watching',
      '5. Look for "Continue Watching" row and extract items with progress',
      '6. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.amazon.com/gp/video/watchlist',
      continue_watching: 'https://www.amazon.com/gp/video/storefront',
    },
  },
  
  disney_plus: {
    service: 'disney_plus',
    steps: [
      '1. Navigate to disneyplus.com/watchlist',
      '2. Scroll to load all watchlist items',
      '3. For each item, extract: title, type, poster URL',
      '4. Navigate to disneyplus.com/home for continue watching',
      '5. Find "Continue Watching" section and extract items with progress',
      '6. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.disneyplus.com/watchlist',
      continue_watching: 'https://www.disneyplus.com/home',
    },
  },
  
  hbo_max: {
    service: 'hbo_max',
    steps: [
      '1. Navigate to max.com/my-stuff',
      '2. Scroll to load the full list',
      '3. For each item, extract: title, type, poster URL',
      '4. Navigate to max.com for continue watching section',
      '5. Extract items from "Continue Watching" with progress',
      '6. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.max.com/my-stuff',
      continue_watching: 'https://www.max.com',
    },
  },
  
  hulu: {
    service: 'hulu',
    steps: [
      '1. Navigate to hulu.com/my-stuff',
      '2. Scroll to load the full list',
      '3. For each item, extract: title, type, poster URL',
      '4. Navigate to hulu.com/hub/home for keep watching',
      '5. Extract items from "Keep Watching" section',
      '6. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.hulu.com/my-stuff',
      continue_watching: 'https://www.hulu.com/hub/home',
    },
  },
  
  apple_tv: {
    service: 'apple_tv',
    steps: [
      '1. Navigate to tv.apple.com/library',
      '2. Browse the library sections',
      '3. Extract items from watchlist/up next',
      '4. Navigate to tv.apple.com for continue watching',
      '5. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://tv.apple.com/library',
      continue_watching: 'https://tv.apple.com',
    },
  },
  
  peacock: {
    service: 'peacock',
    steps: [
      '1. Navigate to peacocktv.com/watch/my-stuff',
      '2. Scroll to load items',
      '3. Extract watchlist items with title, type, poster',
      '4. Check for continue watching section',
      '5. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.peacocktv.com/watch/my-stuff',
      continue_watching: 'https://www.peacocktv.com/watch',
    },
  },
  
  paramount_plus: {
    service: 'paramount_plus',
    steps: [
      '1. Navigate to paramountplus.com/account/my-list',
      '2. Scroll to load the full list',
      '3. Extract items with title, type, poster',
      '4. Navigate to paramountplus.com for continue watching',
      '5. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.paramountplus.com/account/my-list/',
      continue_watching: 'https://www.paramountplus.com',
    },
  },
  
  crunchyroll: {
    service: 'crunchyroll',
    steps: [
      '1. Navigate to crunchyroll.com/watchlist',
      '2. Scroll to load all items',
      '3. Extract anime with title, poster, progress if available',
      '4. Navigate to crunchyroll.com/history for watch history',
      '5. Return the collected data in the specified JSON format',
    ],
    urls: {
      watchlist: 'https://www.crunchyroll.com/watchlist',
      history: 'https://www.crunchyroll.com/history',
    },
  },
};

/**
 * Generate a complete prompt for Claude Code to sync a specific service
 */
export function generateSyncPrompt(service: StreamingService, userId: string): string {
  const instructions = SYNC_INSTRUCTIONS[service];
  
  return `
# Youmaxing Streaming Sync Task

You are helping the user sync their ${service.replace('_', ' ')} data to Youmaxing.
The user is already logged into ${service.replace('_', ' ')} in their browser.

## Instructions

${instructions.steps.join('\n')}

## Expected Output Format

After collecting the data, send a POST request to the Youmaxing API:

\`\`\`
POST /api/streaming-sync
Content-Type: application/json

{
  "user_id": "${userId}",
  "service": "${service}",
  "timestamp": "ISO timestamp",
  "data": {
    "watchlist": [
      {
        "title": "Show/Movie Title",
        "type": "movie" | "series",
        "service": "${service}",
        "poster_url": "https://...",
        "in_watchlist": true
      }
    ],
    "continue_watching": [
      {
        "title": "Show/Movie Title",
        "type": "series",
        "service": "${service}",
        "progress": 45,
        "in_watchlist": false
      }
    ],
    "recently_watched": []
  }
}
\`\`\`

## Important Notes

- Only collect data from the logged-in user's account
- Respect rate limits and scroll naturally
- If not logged in, skip and report in the error field
- Take a screenshot if you encounter any issues for debugging

## URLs to Visit

- Watchlist: ${instructions.urls.watchlist}
${instructions.urls.continue_watching ? `- Continue Watching: ${instructions.urls.continue_watching}` : ''}
${instructions.urls.history ? `- History: ${instructions.urls.history}` : ''}

Please proceed with the sync now.
`;
}

/**
 * Generate instructions for syncing all enabled services
 */
export function generateBatchSyncPrompt(
  services: StreamingService[],
  userId: string
): string {
  return `
# Youmaxing Streaming Batch Sync

You will sync data from multiple streaming services for the user.
Process each service one at a time.

## Services to Sync

${services.map((s, i) => `${i + 1}. ${s.replace('_', ' ').toUpperCase()}`).join('\n')}

## Process

For each service:
1. Navigate to the service's watchlist page
2. Check if the user is logged in
3. If logged in, collect the data
4. If not logged in, skip and note in the response
5. Send the collected data to the API

## API Endpoint

POST each service's data to: /api/streaming-sync

After completing all services, provide a summary of what was synced successfully.

---

${services.map(s => generateSyncPrompt(s, userId)).join('\n\n---\n\n')}
`;
}


