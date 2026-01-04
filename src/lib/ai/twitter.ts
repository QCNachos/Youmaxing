import type { AspectType, TwitterTrend } from '@/types/database';

// Twitter/X API configuration
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// Categories we care about for Youmaxing users
const TREND_CATEGORIES = {
  finance: ['crypto', 'bitcoin', 'ethereum', 'stocks', 'investing', 'etf', 'trading', 'market', 'fed', 'inflation', 'defi'],
  health: ['longevity', 'biohacking', 'supplements', 'workout', 'nutrition', 'sleep', 'fasting', 'wellness', 'fitness'],
  tech: ['ai', 'startup', 'tech', 'software', 'saas', 'product', 'innovation', 'web3'],
  business: ['entrepreneur', 'founder', 'business', 'networking', 'productivity', 'remote', 'freelance'],
  lifestyle: ['travel', 'minimalism', 'habits', 'mindfulness', 'meditation', 'journaling'],
  entertainment: ['netflix', 'movie', 'series', 'gaming', 'streaming', 'podcast'],
  sports: ['nba', 'nfl', 'soccer', 'football', 'basketball', 'mma', 'ufc'],
  general: []
} as const;

// Influential accounts to monitor for cutting-edge insights
const INFLUENTIAL_ACCOUNTS = {
  finance: ['elonmusk', 'APompliano', 'naval', 'chaikitheory', 'balaborusg'],
  health: ['BryanJohnson', 'hubaborusman', 'FoundMyFitness', 'PeterAttiaMD', 'drjasonfung'],
  tech: ['paulg', 'sama', 'levelsio', 'dhh', 'patrickc'],
  business: ['alexhormozi', 'SahilBloom', 'ShaneParrish', 'JamesClear'],
  lifestyle: ['timferriss', 'RyanHoliday', 'MarkManson'],
};

// Category to Aspect mapping
const CATEGORY_TO_ASPECTS: Record<string, AspectType[]> = {
  finance: ['finance', 'business'],
  health: ['training', 'food'],
  tech: ['business'],
  business: ['business', 'finance'],
  lifestyle: ['travel', 'events'],
  entertainment: ['films'],
  sports: ['sports', 'training'],
  general: ['events'],
};

export interface RawTrendData {
  name: string;
  url?: string;
  tweet_volume?: number;
  query?: string;
}

export interface TrendAnalysis {
  topic: string;
  category: keyof typeof TREND_CATEGORIES;
  relevance_score: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  key_insights: string[];
  influential_accounts: string[];
  related_aspects: AspectType[];
  is_emerging: boolean;
  tweet_volume?: number;
}

// Fetch trending topics from Twitter API
export async function fetchTwitterTrends(woeid: number = 1): Promise<RawTrendData[]> {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn('Twitter Bearer Token not configured, using mock data');
    return getMockTrends();
  }

  try {
    const response = await fetch(`${TWITTER_API_BASE}/trends/place.json?id=${woeid}`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.trends || [];
  } catch (error) {
    console.error('Error fetching Twitter trends:', error);
    return getMockTrends();
  }
}

// Search for tweets about specific topics
export async function searchTweets(query: string, maxResults: number = 10): Promise<unknown[]> {
  if (!TWITTER_BEARER_TOKEN) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: `${query} -is:retweet lang:en`,
      max_results: String(maxResults),
      'tweet.fields': 'author_id,created_at,public_metrics,context_annotations',
    });

    const response = await fetch(`${TWITTER_API_BASE}/tweets/search/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twitter search error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error searching tweets:', error);
    return [];
  }
}

// Analyze and categorize a trend
export function categorizeTrend(trendName: string): keyof typeof TREND_CATEGORIES {
  const lowerTrend = trendName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(TREND_CATEGORIES)) {
    if (keywords.some(keyword => lowerTrend.includes(keyword))) {
      return category as keyof typeof TREND_CATEGORIES;
    }
  }
  
  return 'general';
}

// Analyze sentiment from tweets (simplified - in production use NLP)
export function analyzeSentiment(tweets: string[]): 'positive' | 'negative' | 'neutral' | 'mixed' {
  const positiveWords = ['bullish', 'amazing', 'great', 'love', 'excited', 'growth', 'success', 'win'];
  const negativeWords = ['bearish', 'crash', 'fail', 'bad', 'worried', 'decline', 'loss', 'scam'];
  
  let positive = 0;
  let negative = 0;
  
  tweets.forEach(tweet => {
    const lower = tweet.toLowerCase();
    positiveWords.forEach(word => { if (lower.includes(word)) positive++; });
    negativeWords.forEach(word => { if (lower.includes(word)) negative++; });
  });
  
  if (positive > negative * 2) return 'positive';
  if (negative > positive * 2) return 'negative';
  if (positive > 0 && negative > 0) return 'mixed';
  return 'neutral';
}

// Process raw trends into analyzed trends
export async function processAndAnalyzeTrends(rawTrends: RawTrendData[]): Promise<TrendAnalysis[]> {
  const analyzedTrends: TrendAnalysis[] = [];
  
  for (const trend of rawTrends.slice(0, 20)) {
    const category = categorizeTrend(trend.name);
    
    // Skip generic/irrelevant trends
    if (category === 'general' && !isRelevantGeneralTrend(trend.name)) {
      continue;
    }
    
    const relatedAspects = CATEGORY_TO_ASPECTS[category] || ['events'];
    const influentialForCategory = INFLUENTIAL_ACCOUNTS[category as keyof typeof INFLUENTIAL_ACCOUNTS] || [];
    
    // Calculate relevance score based on volume and category importance
    const volumeScore = trend.tweet_volume ? Math.min(trend.tweet_volume / 10000, 50) : 25;
    const categoryScore = category !== 'general' ? 30 : 10;
    const relevanceScore = Math.round(volumeScore + categoryScore + Math.random() * 20);
    
    analyzedTrends.push({
      topic: trend.name,
      category,
      relevance_score: relevanceScore,
      sentiment: 'neutral', // Would be enriched with actual tweet analysis
      key_insights: generateInsights(trend.name, category),
      influential_accounts: influentialForCategory.slice(0, 3),
      related_aspects: relatedAspects,
      is_emerging: (trend.tweet_volume || 0) < 50000,
      tweet_volume: trend.tweet_volume,
    });
  }
  
  // Sort by relevance
  return analyzedTrends.sort((a, b) => b.relevance_score - a.relevance_score);
}

// Check if a general trend might still be relevant
function isRelevantGeneralTrend(trendName: string): boolean {
  const relevantPatterns = [
    /\d{4}/, // Years (might be predictions, reviews)
    /new/i,
    /launch/i,
    /announce/i,
  ];
  return relevantPatterns.some(pattern => pattern.test(trendName));
}

// Generate insights based on trend and category
function generateInsights(topic: string, category: string): string[] {
  const baseInsights: Record<string, string[]> = {
    finance: [
      'Market sentiment is shifting around this topic',
      'Early adopters are positioning for potential movement',
      'Consider researching before mainstream coverage',
    ],
    health: [
      'Health influencers are discussing this approach',
      'New research or protocols being shared',
      'Worth investigating the evidence behind claims',
    ],
    tech: [
      'Tech community is buzzing about this development',
      'Could impact how we work or build products',
      'Early signal worth monitoring',
    ],
    business: [
      'Business leaders are taking note',
      'Potential opportunity or shift in the market',
      'Network discussions are heating up',
    ],
    lifestyle: [
      'Lifestyle shift gaining traction',
      'People are rethinking their approach',
      'Worth considering for personal optimization',
    ],
    entertainment: [
      'Entertainment buzz is building',
      'Might be worth adding to your watchlist',
      'Cultural moment developing',
    ],
    sports: [
      'Sports world is reacting',
      'Could affect upcoming events or results',
      'Fan discussions intensifying',
    ],
    general: [
      'Trending topic worth awareness',
    ],
  };
  
  return baseInsights[category] || baseInsights.general;
}

// Mock trends for development/testing
function getMockTrends(): RawTrendData[] {
  return [
    { name: 'Bitcoin ETF', tweet_volume: 125000 },
    { name: 'Bryan Johnson Protocol', tweet_volume: 45000 },
    { name: '#Longevity', tweet_volume: 32000 },
    { name: 'AI Agents', tweet_volume: 89000 },
    { name: 'Ozempic', tweet_volume: 156000 },
    { name: 'Cold Plunge', tweet_volume: 28000 },
    { name: 'Nvidia Stock', tweet_volume: 67000 },
    { name: '#RemoteWork', tweet_volume: 41000 },
    { name: 'Intermittent Fasting', tweet_volume: 35000 },
    { name: 'Solana', tweet_volume: 78000 },
    { name: '#Productivity', tweet_volume: 22000 },
    { name: 'Sleep Optimization', tweet_volume: 18000 },
  ];
}

// Convert analyzed trends to database format
export function toTwitterTrendRecord(analysis: TrendAnalysis): Omit<TwitterTrend, 'id' | 'created_at'> {
  const now = new Date().toISOString();
  return {
    topic: analysis.topic,
    category: analysis.category,
    relevance_score: analysis.relevance_score,
    tweet_volume: analysis.tweet_volume,
    sentiment: analysis.sentiment,
    key_insights: analysis.key_insights,
    influential_accounts: analysis.influential_accounts,
    related_aspects: analysis.related_aspects,
    is_emerging: analysis.is_emerging,
    first_seen_at: now,
    last_updated_at: now,
  };
}








