/**
 * Analysis Prompts for Claude Code
 * 
 * These prompts guide Claude Code to extract INSIGHTS from various platforms.
 * Privacy-focused: We only extract patterns and preferences, not personal data.
 */

import type { AnalysisPlatform, AnalysisTask, InsightCategory } from './types';

// What to analyze on each platform
export const PLATFORM_ANALYSIS: Record<AnalysisPlatform, AnalysisTask> = {
  // ============================================
  // SOCIAL PLATFORMS
  // ============================================
  
  facebook: {
    platform: 'facebook',
    objectives: [
      'Identify interests from liked pages and groups',
      'Understand social activity level from post frequency',
      'Extract event preferences from past event attendance',
      'Analyze friend interaction patterns (close friends vs acquaintances)',
    ],
    urls: [
      'https://www.facebook.com/me',
      'https://www.facebook.com/me/likes',
      'https://www.facebook.com/events/going',
    ],
    insight_categories: ['interests', 'social_circle', 'entertainment_prefs'],
  },
  
  instagram: {
    platform: 'instagram',
    objectives: [
      'Identify visual interests from saved posts and liked content',
      'Understand content consumption patterns',
      'Extract travel interests from location tags',
      'Analyze food/restaurant preferences from food posts',
    ],
    urls: [
      'https://www.instagram.com/',
      'https://www.instagram.com/accounts/saved/',
    ],
    insight_categories: ['interests', 'travel_interests', 'food_preferences'],
  },
  
  linkedin: {
    platform: 'linkedin',
    objectives: [
      'Extract professional interests and skills',
      'Understand career trajectory and goals',
      'Identify industry interests from followed companies',
      'Analyze learning interests from courses and content engagement',
    ],
    urls: [
      'https://www.linkedin.com/feed/',
      'https://www.linkedin.com/in/me/',
      'https://www.linkedin.com/my-items/saved-posts/',
    ],
    insight_categories: ['work_patterns', 'learning_interests', 'interests'],
  },
  
  twitter: {
    platform: 'twitter',
    objectives: [
      'Identify topics of interest from followed accounts',
      'Understand engagement patterns and interests',
      'Extract news/content consumption preferences',
    ],
    urls: [
      'https://twitter.com/home',
      'https://twitter.com/i/bookmarks',
    ],
    insight_categories: ['interests', 'entertainment_prefs'],
  },
  
  // ============================================
  // ENTERTAINMENT PLATFORMS
  // ============================================
  
  netflix: {
    platform: 'netflix',
    objectives: [
      'Identify preferred genres from viewing history',
      'Understand viewing patterns (binge vs casual)',
      'Extract content format preferences (movies vs series)',
      'Analyze viewing time patterns',
    ],
    urls: [
      'https://www.netflix.com/browse',
      'https://www.netflix.com/viewingactivity',
    ],
    insight_categories: ['entertainment_prefs'],
  },
  
  spotify: {
    platform: 'spotify',
    objectives: [
      'Extract music genre preferences',
      'Identify listening patterns (time of day, mood)',
      'Understand podcast interests if applicable',
      'Analyze playlist themes for mood/activity preferences',
    ],
    urls: [
      'https://open.spotify.com/',
      'https://open.spotify.com/collection/playlists',
    ],
    insight_categories: ['entertainment_prefs', 'interests'],
  },
  
  youtube: {
    platform: 'youtube',
    objectives: [
      'Identify content interests from watch history',
      'Extract learning interests from educational content',
      'Understand entertainment preferences',
      'Analyze subscription patterns for interests',
    ],
    urls: [
      'https://www.youtube.com/',
      'https://www.youtube.com/feed/history',
      'https://www.youtube.com/feed/subscriptions',
    ],
    insight_categories: ['interests', 'entertainment_prefs', 'learning_interests'],
  },
  
  prime_video: {
    platform: 'prime_video',
    objectives: [
      'Identify genre preferences from watchlist and history',
      'Understand viewing completion patterns',
      'Extract content format preferences',
    ],
    urls: [
      'https://www.amazon.com/gp/video/watchlist',
      'https://www.amazon.com/gp/video/storefront',
    ],
    insight_categories: ['entertainment_prefs'],
  },
  
  // ============================================
  // PRODUCTIVITY PLATFORMS
  // ============================================
  
  google_drive: {
    platform: 'google_drive',
    objectives: [
      'Understand work patterns from recent files',
      'Identify project types and interests',
      'Extract collaboration patterns',
      'Analyze document types for role/work style',
    ],
    urls: [
      'https://drive.google.com/drive/my-drive',
      'https://drive.google.com/drive/recent',
    ],
    insight_categories: ['work_patterns', 'interests'],
  },
  
  google_calendar: {
    platform: 'google_calendar',
    objectives: [
      'Understand schedule patterns and availability',
      'Identify meeting frequency and types',
      'Extract work-life balance indicators',
      'Analyze recurring commitments',
    ],
    urls: [
      'https://calendar.google.com/',
    ],
    insight_categories: ['work_patterns', 'social_circle'],
  },
  
  gmail: {
    platform: 'gmail',
    objectives: [
      'Identify newsletter subscriptions for interests',
      'Understand communication patterns',
      'Extract shopping/service preferences from receipts',
      'Analyze travel bookings for travel style',
    ],
    urls: [
      'https://mail.google.com/mail/',
    ],
    insight_categories: ['interests', 'travel_interests', 'financial_behavior'],
  },
  
  notion: {
    platform: 'notion',
    objectives: [
      'Understand productivity style from workspace organization',
      'Identify projects and goals',
      'Extract learning/reading interests',
      'Analyze planning preferences',
    ],
    urls: [
      'https://www.notion.so/',
    ],
    insight_categories: ['work_patterns', 'learning_interests'],
  },
  
  // ============================================
  // HEALTH & FITNESS
  // ============================================
  
  strava: {
    platform: 'strava',
    objectives: [
      'Extract workout preferences and frequency',
      'Understand fitness goals and progress',
      'Identify preferred activities',
      'Analyze performance trends',
    ],
    urls: [
      'https://www.strava.com/dashboard',
      'https://www.strava.com/athlete/training',
    ],
    insight_categories: ['health_fitness'],
  },
  
  myfitnesspal: {
    platform: 'myfitnesspal',
    objectives: [
      'Understand dietary preferences and restrictions',
      'Extract nutrition goals',
      'Identify eating patterns',
      'Analyze food logging consistency',
    ],
    urls: [
      'https://www.myfitnesspal.com/',
    ],
    insight_categories: ['health_fitness', 'food_preferences'],
  },
  
  // ============================================
  // FINANCE
  // ============================================
  
  mint: {
    platform: 'mint',
    objectives: [
      'Understand spending categories (high level only)',
      'Identify financial goals',
      'Extract savings patterns',
      'Analyze budget adherence style',
    ],
    urls: [
      'https://mint.intuit.com/overview',
    ],
    insight_categories: ['financial_behavior'],
  },
  
  robinhood: {
    platform: 'robinhood',
    objectives: [
      'Understand investment interest level',
      'Identify investment style (conservative vs aggressive)',
      'Extract sector interests',
    ],
    urls: [
      'https://robinhood.com/',
    ],
    insight_categories: ['financial_behavior'],
  },
};

/**
 * Generate a complete analysis prompt for Claude Code
 */
export function generateAnalysisPrompt(
  userId: string,
  platforms: AnalysisPlatform[],
  apiEndpoint: string
): string {
  const tasks = platforms.map(p => PLATFORM_ANALYSIS[p]);
  
  return `
# Youmaxing Insight Analysis Agent

You are acting as a personal insight analyst for a Youmaxing user. Your job is to 
browse their logged-in accounts and extract HIGH-LEVEL INSIGHTS about their 
preferences, interests, and patterns. 

## CRITICAL PRIVACY RULES

1. **NEVER extract personal data** - No names, photos, messages, or private content
2. **Only derive patterns and preferences** - "Interested in hiking" NOT "Went hiking with John"
3. **No financial specifics** - "Tends to save" NOT "Has $X in savings"
4. **No private communications** - Don't read messages or emails content
5. **Only logged-in sessions** - Skip platforms where user isn't logged in

## Platforms to Analyze

${tasks.map((task, i) => `
### ${i + 1}. ${task.platform.toUpperCase().replace('_', ' ')}

**URLs to visit:**
${task.urls.map(u => `- ${u}`).join('\n')}

**What to look for:**
${task.objectives.map(o => `- ${o}`).join('\n')}

**Insight categories:** ${task.insight_categories.join(', ')}
`).join('\n')}

## Output Format

After analyzing each platform, send insights to the API:

\`\`\`
POST ${apiEndpoint}/api/insights/ingest
Content-Type: application/json

{
  "user_id": "${userId}",
  "platform": "platform_name",
  "timestamp": "ISO timestamp",
  "logged_in": true,
  "insights": [
    {
      "category": "interests",
      "confidence": 0.85,
      "value": "hiking and outdoor activities",
      "evidence": "Member of 3 hiking groups, frequently likes outdoor content"
    },
    {
      "category": "entertainment_prefs",
      "confidence": 0.9,
      "value": {
        "preferred_genres": ["sci-fi", "documentary"],
        "binge_watcher": true
      },
      "evidence": "Watch history shows 80% sci-fi, completes series in 1-2 days"
    }
  ]
}
\`\`\`

## Process

1. For each platform, navigate to the URLs
2. Check if user is logged in - if not, skip and report logged_in: false
3. Observe and analyze the content (scroll to load more if needed)
4. Extract HIGH-LEVEL insights only
5. Send to the API endpoint
6. Move to next platform
7. After all platforms, provide a summary

## Example Insights (what to extract)

Good insights:
- "Interested in technology and startups" (from LinkedIn follows)
- "Prefers sci-fi and thriller genres" (from Netflix history)
- "Active social life, attends 2-3 events per month" (from Facebook events)
- "Morning workout person, prefers running" (from Strava)
- "Budget-conscious, focused on saving" (from Mint categories)

Bad insights (don't do these):
- "Friends with John Smith" (personal data)
- "Has $5000 in savings" (financial specifics)
- "Messaged Sarah about dinner" (private communication)
- "Works at XYZ Company" (specific employer data)

## Ready?

Please proceed with the analysis. Navigate to each platform, extract insights, 
and send them to the API. Skip any platform where the user isn't logged in.
`;
}

/**
 * Generate a quick analysis prompt for a single platform
 */
export function generateSinglePlatformPrompt(
  userId: string,
  platform: AnalysisPlatform,
  apiEndpoint: string
): string {
  const task = PLATFORM_ANALYSIS[platform];
  
  return `
# Quick Analysis: ${platform.toUpperCase().replace('_', ' ')}

Analyze this platform for Youmaxing user insights.

## URLs to Visit
${task.urls.map(u => `- ${u}`).join('\n')}

## What to Look For
${task.objectives.map(o => `- ${o}`).join('\n')}

## Privacy Rules
- NO personal data, names, or specific details
- Only high-level patterns and preferences
- Skip if not logged in

## Send Results To
POST ${apiEndpoint}/api/insights/ingest

\`\`\`json
{
  "user_id": "${userId}",
  "platform": "${platform}",
  "timestamp": "ISO timestamp",
  "logged_in": true/false,
  "insights": [...]
}
\`\`\`

Proceed with analysis now.
`;
}



