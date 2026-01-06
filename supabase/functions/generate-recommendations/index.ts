// Supabase Edge Function for generating recommendations
// Deploy with: supabase functions deploy generate-recommendations

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter API configuration
const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

// Categories for trend classification
const TREND_CATEGORIES = {
  finance: ['crypto', 'bitcoin', 'ethereum', 'stocks', 'investing', 'etf', 'trading', 'market', 'fed', 'inflation', 'defi'],
  health: ['longevity', 'biohacking', 'supplements', 'workout', 'nutrition', 'sleep', 'fasting', 'wellness', 'fitness'],
  tech: ['ai', 'startup', 'tech', 'software', 'saas', 'product', 'innovation', 'web3'],
  business: ['entrepreneur', 'founder', 'business', 'networking', 'productivity', 'remote', 'freelance'],
  lifestyle: ['travel', 'minimalism', 'habits', 'mindfulness', 'meditation', 'journaling'],
  entertainment: ['netflix', 'movie', 'series', 'gaming', 'streaming', 'podcast'],
  sports: ['nba', 'nfl', 'soccer', 'football', 'basketball', 'mma', 'ufc'],
};

const CATEGORY_TO_ASPECTS = {
  finance: ['finance', 'business'],
  health: ['training', 'food'],
  tech: ['business'],
  business: ['business', 'finance'],
  lifestyle: ['travel', 'events'],
  entertainment: ['films'],
  sports: ['sports', 'training'],
  general: ['events'],
};

// AI Tone prompts
const TONE_PROMPTS = {
  chill: `You're a laid-back friend who's always looking out. Keep it casual, use conversational language. No pressure, just helpful vibes.`,
  professional: `You're a knowledgeable advisor who respects the user's time. Be concise, data-driven, and actionable.`,
  motivational: `You're an encouraging coach who believes in the user's potential. Be energetic but not over-the-top.`,
  friendly: `You're a supportive buddy who genuinely cares. Warm, empathetic, and helpful.`,
};

interface TrendData {
  name: string;
  tweet_volume?: number;
}

interface AnalyzedTrend {
  topic: string;
  category: string;
  relevance_score: number;
  key_insights: string[];
  related_aspects: string[];
  is_emerging: boolean;
}

// Fetch Twitter trends
async function fetchTrends(): Promise<TrendData[]> {
  if (!TWITTER_BEARER_TOKEN) {
    // Return mock data for development
    return [
      { name: 'Bitcoin ETF', tweet_volume: 125000 },
      { name: 'Bryan Johnson Protocol', tweet_volume: 45000 },
      { name: '#Longevity', tweet_volume: 32000 },
      { name: 'AI Agents', tweet_volume: 89000 },
      { name: 'Cold Plunge', tweet_volume: 28000 },
      { name: 'Nvidia Stock', tweet_volume: 67000 },
      { name: 'Intermittent Fasting', tweet_volume: 35000 },
      { name: 'Solana', tweet_volume: 78000 },
    ];
  }

  try {
    const response = await fetch('https://api.twitter.com/2/trends/place.json?id=1', {
      headers: { 'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}` },
    });
    const data = await response.json();
    return data[0]?.trends || [];
  } catch (error) {
    console.error('Twitter API error:', error);
    return [];
  }
}

// Categorize trends
function categorizeTrend(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(TREND_CATEGORIES)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'general';
}

// Analyze trends
function analyzeTrends(rawTrends: TrendData[]): AnalyzedTrend[] {
  return rawTrends.slice(0, 15).map(trend => {
    const category = categorizeTrend(trend.name);
    const aspects = CATEGORY_TO_ASPECTS[category as keyof typeof CATEGORY_TO_ASPECTS] || ['events'];
    
    return {
      topic: trend.name,
      category,
      relevance_score: Math.min((trend.tweet_volume || 10000) / 1000, 100),
      key_insights: [`Trending topic in ${category}`, 'Early signal worth monitoring'],
      related_aspects: aspects,
      is_emerging: (trend.tweet_volume || 0) < 50000,
    };
  }).filter(t => t.category !== 'general' || t.relevance_score > 50);
}

// Generate recommendations with OpenAI
async function generateWithOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{"recommendations": []}';
}

// Generate recommendations with Claude
async function generateWithClaude(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  return textBlock?.text || '{"recommendations": []}';
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get request body
    const { user_id, force_refresh = false } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile and preferences
    const [profileRes, prefsRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', user_id).single(),
      supabase.from('user_preferences').select('*').eq('user_id', user_id).single(),
    ]);

    const profile = profileRes.data;
    const preferences = prefsRes.data;

    if (!profile || !preferences) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing recommendations to avoid duplicates
    const existingRecsRes = await supabase
      .from('ai_recommendations')
      .select('title')
      .eq('user_id', user_id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(10);

    const existingTitles = (existingRecsRes.data || []).map(r => r.title);

    // Fetch user activity data
    const [trainingRes, financeRes, friendsRes] = await Promise.all([
      supabase.from('training_logs').select('*').eq('user_id', user_id).order('completed_at', { ascending: false }).limit(5),
      supabase.from('finances').select('*').eq('user_id', user_id).order('date', { ascending: false }).limit(10),
      supabase.from('friends').select('*').eq('user_id', user_id),
    ]);

    // Analyze user data
    const userData = {
      displayName: profile.display_name,
      training: {
        count: trainingRes.data?.length || 0,
        lastWorkout: trainingRes.data?.[0]?.completed_at,
        daysSinceLastWorkout: trainingRes.data?.[0] 
          ? Math.floor((Date.now() - new Date(trainingRes.data[0].completed_at).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
      finance: {
        recentTransactions: financeRes.data?.length || 0,
        totalSpent: financeRes.data?.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0) || 0,
      },
      friends: {
        total: friendsRes.data?.length || 0,
        needsContact: friendsRes.data?.filter(f => {
          if (!f.last_contact) return true;
          const days = Math.floor((Date.now() - new Date(f.last_contact).getTime()) / (1000 * 60 * 60 * 24));
          return days > 14;
        }).map(f => f.name) || [],
      },
    };

    // Fetch and analyze Twitter trends
    const rawTrends = await fetchTrends();
    const analyzedTrends = analyzeTrends(rawTrends);

    // Filter trends to user's aspects
    const userAspects = preferences.aspect_priorities || [];
    const relevantTrends = analyzedTrends.filter(t => 
      t.related_aspects.some(a => userAspects.includes(a))
    );

    // Build the AI prompt
    const systemPrompt = `You are the AI brain behind Youmaxing, a life management platform. Generate personalized recommendations by combining user data with trending intelligence from X/Twitter.

KEY PRINCIPLES:
- Match the user's communication style
- Surface early signals before they go mainstream
- Make complex trends accessible and actionable
- Connect dots between user data and external signals

Respond with JSON: {"recommendations": [...]}`;

    const userPrompt = `
USER TONE: ${TONE_PROMPTS[profile.ai_tone as keyof typeof TONE_PROMPTS] || TONE_PROMPTS.chill}

USER ASPECTS: ${userAspects.join(', ')}

USER DATA:
${JSON.stringify(userData, null, 2)}

TRENDING ON X/TWITTER:
${relevantTrends.slice(0, 5).map(t => `- ${t.topic} (${t.category}): ${t.key_insights.join('. ')}`).join('\n')}

AVOID THESE RECENT RECOMMENDATIONS:
${existingTitles.join(', ')}

Generate 3-5 personalized recommendations. Each should have:
- title: Catchy title (max 60 chars)
- content: Recommendation body (max 200 chars)
- aspect: Which aspect this relates to
- action_type: 'info' | 'action' | 'reminder' | 'trending'
- priority: 'low' | 'medium' | 'high' | 'urgent'
- trend_context: If based on a trend, brief context

Mix user-data insights with relevant trending info. Prioritize trends that give an early edge.`;

    // Generate with preferred provider
    const rawResponse = profile.ai_provider === 'anthropic'
      ? await generateWithClaude(userPrompt, systemPrompt)
      : await generateWithOpenAI(userPrompt, systemPrompt);

    // Parse response
    let recommendations = [];
    try {
      const parsed = JSON.parse(rawResponse);
      recommendations = parsed.recommendations || parsed || [];
    } catch {
      console.error('Failed to parse AI response');
    }

    // Store recommendations in database
    const recsToInsert = recommendations.map((rec: Record<string, unknown>) => ({
      user_id,
      aspect: rec.aspect || 'events',
      title: rec.title,
      content: rec.content,
      action_type: rec.action_type || 'info',
      priority: rec.priority || 'medium',
      action_url: rec.action_url,
      trend_context: rec.trend_context,
      source: rec.trend_context ? 'twitter_trend' : 'user_data',
      acted_on: false,
      dismissed: false,
    }));

    if (recsToInsert.length > 0) {
      await supabase.from('ai_recommendations').insert(recsToInsert);
    }

    // Store trends for analytics
    const trendsToUpsert = analyzedTrends.map(t => ({
      topic: t.topic,
      category: t.category,
      relevance_score: t.relevance_score,
      sentiment: 'neutral',
      key_insights: t.key_insights,
      influential_accounts: [],
      related_aspects: t.related_aspects,
      is_emerging: t.is_emerging,
      first_seen_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    }));

    await supabase.from('twitter_trends').upsert(trendsToUpsert, { onConflict: 'topic' });

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: recsToInsert,
        trends_analyzed: analyzedTrends.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});










