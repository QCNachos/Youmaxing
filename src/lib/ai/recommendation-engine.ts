import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { 
  fetchTwitterTrends, 
  processAndAnalyzeTrends, 
  toTwitterTrendRecord,
  type TrendAnalysis 
} from './twitter';
import { 
  recommendationSystemPrompt, 
  buildRecommendationPrompt,
  tonePrompts 
} from './prompts';
import type { 
  AIRecommendation, 
  AITone, 
  AIProvider, 
  AspectType,
  TwitterTrend,
  UserProfile,
  UserPreferences,
} from '@/types/database';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// User data aggregation for context
export interface UserDataContext {
  profile: UserProfile;
  preferences: UserPreferences;
  recentActivity: {
    training: { count: number; lastWorkout?: string; streak?: number };
    food: { mealsLogged: number; lastMeal?: string };
    finance: { recentTransactions: number; savingsProgress?: number };
    friends: { lastContact: Record<string, string> };
    // Add more as needed
  };
  interests: string[];
}

export interface GeneratedRecommendation {
  title: string;
  content: string;
  aspect: AspectType;
  action_type: 'info' | 'action' | 'reminder' | 'trending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  trend_context?: string;
  source: 'user_data' | 'twitter_trend' | 'hybrid';
}

// Main recommendation engine class
export class RecommendationEngine {
  private cachedTrends: TrendAnalysis[] = [];
  private trendsLastFetched: Date | null = null;
  private readonly TREND_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Fetch and cache Twitter trends
  async getLatestTrends(forceRefresh = false): Promise<TrendAnalysis[]> {
    const now = new Date();
    
    if (
      !forceRefresh && 
      this.trendsLastFetched && 
      (now.getTime() - this.trendsLastFetched.getTime()) < this.TREND_CACHE_DURATION
    ) {
      return this.cachedTrends;
    }

    const rawTrends = await fetchTwitterTrends();
    this.cachedTrends = await processAndAnalyzeTrends(rawTrends);
    this.trendsLastFetched = now;
    
    return this.cachedTrends;
  }

  // Filter trends relevant to user's aspects
  filterTrendsForUser(
    trends: TrendAnalysis[], 
    userAspects: AspectType[]
  ): TrendAnalysis[] {
    return trends.filter(trend => 
      trend.related_aspects.some(aspect => userAspects.includes(aspect))
    );
  }

  // Generate recommendations using AI
  async generateRecommendations(
    userData: UserDataContext,
    existingRecTitles: string[] = [],
    provider: AIProvider = 'openai'
  ): Promise<GeneratedRecommendation[]> {
    // Get latest trends
    const allTrends = await this.getLatestTrends();
    
    // Filter to user-relevant trends
    const relevantTrends = this.filterTrendsForUser(
      allTrends, 
      userData.preferences.aspect_priorities
    );

    // Build the prompt
    const prompt = buildRecommendationPrompt({
      userTone: userData.profile.ai_tone,
      userAspects: userData.preferences.aspect_priorities,
      userData: {
        displayName: userData.profile.display_name,
        recentActivity: userData.recentActivity,
        interests: userData.interests,
      },
      trends: relevantTrends.slice(0, 5).map(t => ({
        topic: t.topic,
        category: t.category,
        insights: t.key_insights,
        sentiment: t.sentiment,
      })),
      existingRecommendations: existingRecTitles,
    });

    // Call AI based on provider preference
    const rawResponse = provider === 'anthropic' 
      ? await this.callClaude(prompt)
      : await this.callOpenAI(prompt);

    // Parse and validate response
    return this.parseAIResponse(rawResponse, relevantTrends);
  }

  // Call OpenAI GPT-4
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: recommendationSystemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || '{"recommendations": []}';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate recommendations with OpenAI');
    }
  }

  // Call Anthropic Claude
  private async callClaude(prompt: string): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: recommendationSystemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const textBlock = response.content.find(block => block.type === 'text');
      return textBlock?.type === 'text' ? textBlock.text : '{"recommendations": []}';
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate recommendations with Claude');
    }
  }

  // Parse AI response into typed recommendations
  private parseAIResponse(
    response: string, 
    trends: TrendAnalysis[]
  ): GeneratedRecommendation[] {
    try {
      const parsed = JSON.parse(response);
      const recommendations = parsed.recommendations || parsed;
      
      if (!Array.isArray(recommendations)) {
        console.error('Invalid AI response format');
        return [];
      }

      return recommendations.map((rec: Record<string, unknown>) => {
        // Determine source based on trend_context
        let source: 'user_data' | 'twitter_trend' | 'hybrid' = 'user_data';
        if (rec.trend_context) {
          const matchesTrend = trends.some(t => 
            (rec.title as string)?.toLowerCase().includes(t.topic.toLowerCase()) ||
            (rec.content as string)?.toLowerCase().includes(t.topic.toLowerCase())
          );
          source = matchesTrend ? 'twitter_trend' : 'hybrid';
        }

        return {
          title: String(rec.title || 'New Insight'),
          content: String(rec.content || ''),
          aspect: (rec.aspect as AspectType) || 'events',
          action_type: (rec.action_type as 'info' | 'action' | 'reminder' | 'trending') || 'info',
          priority: (rec.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
          action_url: rec.action_url as string | undefined,
          trend_context: rec.trend_context as string | undefined,
          source,
        };
      });
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [];
    }
  }

  // Generate quick insight for a specific aspect
  async generateAspectInsight(
    aspect: AspectType,
    userData: UserDataContext,
    provider: AIProvider = 'openai'
  ): Promise<GeneratedRecommendation | null> {
    const trends = await this.getLatestTrends();
    const aspectTrends = trends.filter(t => t.related_aspects.includes(aspect));

    const prompt = `
Generate ONE focused recommendation for the ${aspect} aspect.

User tone: ${tonePrompts[userData.profile.ai_tone]}

User's ${aspect} data: ${JSON.stringify(userData.recentActivity[aspect as keyof typeof userData.recentActivity] || {})}

Relevant trends: ${aspectTrends.slice(0, 2).map(t => t.topic).join(', ') || 'None'}

Respond with a single JSON object (not array):
{
  "title": "...",
  "content": "...",
  "action_type": "info|action|reminder|trending",
  "priority": "low|medium|high|urgent",
  "trend_context": "optional - if based on a trend"
}`;

    const rawResponse = provider === 'anthropic'
      ? await this.callClaude(prompt)
      : await this.callOpenAI(prompt);

    try {
      const parsed = JSON.parse(rawResponse);
      return {
        ...parsed,
        aspect,
        source: parsed.trend_context ? 'hybrid' : 'user_data',
      };
    } catch {
      return null;
    }
  }

  // Convert to database format
  toRecommendationRecord(
    rec: GeneratedRecommendation,
    userId: string
  ): Omit<AIRecommendation, 'id' | 'created_at'> {
    return {
      user_id: userId,
      aspect: rec.aspect,
      title: rec.title,
      content: rec.content,
      action_type: rec.action_type,
      priority: rec.priority,
      action_url: rec.action_url,
      trend_context: rec.trend_context,
      source: rec.source,
      acted_on: false,
      dismissed: false,
    };
  }

  // Get trend records for database
  getTrendRecords(): Omit<TwitterTrend, 'id' | 'created_at'>[] {
    return this.cachedTrends.map(toTwitterTrendRecord);
  }
}

// Singleton instance
let engineInstance: RecommendationEngine | null = null;

export function getRecommendationEngine(): RecommendationEngine {
  if (!engineInstance) {
    engineInstance = new RecommendationEngine();
  }
  return engineInstance;
}

// Quick helper for one-off recommendation generation
export async function generateUserRecommendations(
  userData: UserDataContext,
  existingRecTitles: string[] = []
): Promise<GeneratedRecommendation[]> {
  const engine = getRecommendationEngine();
  return engine.generateRecommendations(
    userData, 
    existingRecTitles, 
    userData.profile.ai_provider
  );
}










