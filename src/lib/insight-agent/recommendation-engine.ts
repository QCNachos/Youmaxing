/**
 * Insight-Powered Recommendation Engine
 * 
 * Uses the aggregated user insight profile to generate personalized
 * recommendations across all mini-apps.
 */

import type { UserInsightProfile, InsightCategory } from './types';
import type { AspectType } from '@/types/database';

// Mapping from insight categories to aspects
const INSIGHT_TO_ASPECT: Record<InsightCategory, AspectType[]> = {
  interests: ['films', 'travel', 'events', 'business'],
  social_circle: ['friends', 'family', 'events'],
  work_patterns: ['business'],
  entertainment_prefs: ['films'],
  health_fitness: ['training', 'food'],
  financial_behavior: ['finance'],
  travel_interests: ['travel'],
  food_preferences: ['food'],
  learning_interests: ['business'],
};

export interface AspectRecommendation {
  aspect: AspectType;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  action?: {
    type: 'add_item' | 'suggest_goal' | 'schedule_event' | 'try_feature';
    payload?: any;
  };
}

/**
 * Generate recommendations for a specific aspect based on user insights
 */
export function generateAspectRecommendations(
  profile: UserInsightProfile,
  aspect: AspectType
): AspectRecommendation[] {
  switch (aspect) {
    case 'films':
      return generateFilmRecommendations(profile);
    case 'training':
      return generateTrainingRecommendations(profile);
    case 'food':
      return generateFoodRecommendations(profile);
    case 'friends':
      return generateFriendsRecommendations(profile);
    case 'travel':
      return generateTravelRecommendations(profile);
    case 'finance':
      return generateFinanceRecommendations(profile);
    case 'business':
      return generateBusinessRecommendations(profile);
    case 'events':
      return generateEventsRecommendations(profile);
    default:
      return [];
  }
}

/**
 * Generate cross-aspect recommendations based on patterns
 */
export function generateCrossAspectInsights(
  profile: UserInsightProfile
): string[] {
  const insights: string[] = [];
  
  // Entertainment + Social
  if (profile.entertainment.binge_watcher && profile.social.social_activity_level === 'low') {
    insights.push(
      "You seem to enjoy solo entertainment - consider joining a virtual watch party to combine your love of shows with social connection."
    );
  }
  
  // Health + Work
  if (profile.work.productivity_peak === 'morning' && profile.health.activity_level === 'sedentary') {
    insights.push(
      "Your morning productivity peak could be enhanced with a quick workout before work - even 15 minutes can boost focus."
    );
  }
  
  // Interests + Events
  if (profile.interests.length > 0) {
    const topInterests = profile.interests.slice(0, 3).map(i => i.topic);
    insights.push(
      `Based on your interests in ${topInterests.join(', ')}, we'll prioritize relevant events and content.`
    );
  }
  
  // Travel + Finance
  if (profile.travel.travel_frequency === 'frequently' && profile.financial.spending_style === 'frugal') {
    insights.push(
      "You love to travel but are budget-conscious - we'll focus on value destinations and travel hacking tips."
    );
  }
  
  return insights;
}

// ============================================
// ASPECT-SPECIFIC RECOMMENDATION GENERATORS
// ============================================

function generateFilmRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { entertainment, interests } = profile;
  
  // Genre-based recommendations
  if (entertainment.preferred_genres.length > 0) {
    const topGenres = entertainment.preferred_genres.slice(0, 3);
    recs.push({
      aspect: 'films',
      title: `${topGenres[0]} Picks for You`,
      description: `Based on your viewing history, here are top ${topGenres[0].toLowerCase()} picks`,
      confidence: 0.9,
      reasoning: `Your Netflix and streaming history shows strong preference for ${topGenres.join(', ')}`,
      action: {
        type: 'suggest_goal',
        payload: { genres: topGenres },
      },
    });
  }
  
  // Binge watcher suggestions
  if (entertainment.binge_watcher) {
    recs.push({
      aspect: 'films',
      title: 'Weekend Binge Series',
      description: 'Complete series perfect for a weekend marathon',
      confidence: 0.85,
      reasoning: 'You tend to watch shows in quick succession - here are completed series',
    });
  }
  
  // Interest-based film suggestions
  const relevantInterests = interests.filter(i => 
    ['history', 'science', 'technology', 'nature', 'true crime', 'sports'].some(
      topic => i.topic.toLowerCase().includes(topic)
    )
  );
  
  if (relevantInterests.length > 0) {
    recs.push({
      aspect: 'films',
      title: 'Documentaries You\'ll Love',
      description: `Based on your interest in ${relevantInterests[0].topic}`,
      confidence: 0.8,
      reasoning: `Your ${relevantInterests[0].sources.join(' and ')} activity shows interest in this topic`,
    });
  }
  
  return recs;
}

function generateTrainingRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { health, work } = profile;
  
  // Activity level based
  if (health.activity_level === 'sedentary') {
    recs.push({
      aspect: 'training',
      title: 'Start with 10-Minute Walks',
      description: 'Small steps to build an exercise habit',
      confidence: 0.9,
      reasoning: 'Current activity level is low - starting small builds sustainable habits',
    });
  }
  
  // Work schedule alignment
  if (work.productivity_peak === 'morning') {
    recs.push({
      aspect: 'training',
      title: 'Morning Workout Routine',
      description: 'Quick 20-min routine before your productive morning hours',
      confidence: 0.85,
      reasoning: 'Your productivity peaks in the morning - exercise before can enhance it',
    });
  } else if (work.productivity_peak === 'evening') {
    recs.push({
      aspect: 'training',
      title: 'Lunchtime Workout',
      description: 'Midday exercise to boost afternoon energy',
      confidence: 0.85,
      reasoning: 'Since you\'re more productive in the evening, a lunch workout won\'t disrupt your flow',
    });
  }
  
  return recs;
}

function generateFoodRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { health, travel } = profile;
  
  // Dietary restrictions
  if (health.dietary_restrictions.length > 0) {
    recs.push({
      aspect: 'food',
      title: 'Meals for Your Diet',
      description: `Recipes compatible with: ${health.dietary_restrictions.join(', ')}`,
      confidence: 0.95,
      reasoning: 'Filtering recommendations based on your dietary needs',
    });
  }
  
  // Travel-inspired cuisine
  if (travel.preferred_destinations.length > 0) {
    recs.push({
      aspect: 'food',
      title: `Try ${travel.preferred_destinations[0]} Cuisine`,
      description: 'Recipes from places you love to visit',
      confidence: 0.75,
      reasoning: `Your travel interest in ${travel.preferred_destinations[0]} suggests you might enjoy its food`,
    });
  }
  
  return recs;
}

function generateFriendsRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { social, entertainment } = profile;
  
  if (social.communication_style === 'minimal') {
    recs.push({
      aspect: 'friends',
      title: 'Reconnection Reminder',
      description: 'Set a weekly reminder to reach out to 1-2 close friends',
      confidence: 0.8,
      reasoning: 'Your communication style suggests you might benefit from gentle prompts',
    });
  }
  
  if (entertainment.binge_watcher) {
    recs.push({
      aspect: 'friends',
      title: 'Virtual Watch Party',
      description: 'Invite friends to watch a show together remotely',
      confidence: 0.75,
      reasoning: 'Combine your love of shows with friend time',
    });
  }
  
  return recs;
}

function generateTravelRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { travel, financial, interests } = profile;
  
  // Style-based destinations
  if (travel.travel_style) {
    const styleToDestinations: Record<string, string[]> = {
      adventure: ['New Zealand', 'Costa Rica', 'Iceland', 'Nepal'],
      relaxation: ['Maldives', 'Bali', 'Greece', 'Portugal'],
      cultural: ['Japan', 'Italy', 'Morocco', 'Peru'],
      luxury: ['Dubai', 'Monaco', 'Switzerland', 'Maldives'],
      budget: ['Thailand', 'Vietnam', 'Portugal', 'Mexico'],
    };
    
    const destinations = styleToDestinations[travel.travel_style] || [];
    if (destinations.length > 0) {
      recs.push({
        aspect: 'travel',
        title: `${travel.travel_style.charAt(0).toUpperCase() + travel.travel_style.slice(1)} Destinations`,
        description: `Top picks: ${destinations.slice(0, 3).join(', ')}`,
        confidence: 0.85,
        reasoning: `Your travel style suggests you'd enjoy ${travel.travel_style} trips`,
      });
    }
  }
  
  // Interest-aligned travel
  const travelInterests = interests.filter(i =>
    ['hiking', 'food', 'history', 'art', 'nature', 'beaches'].some(
      t => i.topic.toLowerCase().includes(t)
    )
  );
  
  if (travelInterests.length > 0) {
    recs.push({
      aspect: 'travel',
      title: `Trips for ${travelInterests[0].topic} Lovers`,
      description: 'Destinations matching your interests',
      confidence: 0.8,
      reasoning: `Your interest in ${travelInterests[0].topic} from ${travelInterests[0].sources.join(', ')}`,
    });
  }
  
  return recs;
}

function generateFinanceRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { financial, work } = profile;
  
  if (financial.investment_interest) {
    recs.push({
      aspect: 'finance',
      title: 'Investment Learning Path',
      description: 'Resources to improve your investment knowledge',
      confidence: 0.85,
      reasoning: 'Your account activity shows interest in investing',
    });
  }
  
  if (financial.spending_style === 'generous' && financial.financial_goals.length === 0) {
    recs.push({
      aspect: 'finance',
      title: 'Set a Savings Goal',
      description: 'Even small goals help build financial security',
      confidence: 0.75,
      reasoning: 'A savings goal could balance your generous spending style',
    });
  }
  
  return recs;
}

function generateBusinessRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { work, interests } = profile;
  
  // Skill development
  if (work.skill_focus.length > 0) {
    recs.push({
      aspect: 'business',
      title: `Level Up: ${work.skill_focus[0]}`,
      description: 'Resources to develop this skill further',
      confidence: 0.85,
      reasoning: `Your LinkedIn activity shows focus on ${work.skill_focus.join(', ')}`,
    });
  }
  
  // Industry insights
  if (work.industry_interests.length > 0) {
    recs.push({
      aspect: 'business',
      title: `${work.industry_interests[0]} Trends`,
      description: 'Latest news and insights from your industry',
      confidence: 0.8,
      reasoning: `Your professional interest in ${work.industry_interests[0]}`,
    });
  }
  
  return recs;
}

function generateEventsRecommendations(profile: UserInsightProfile): AspectRecommendation[] {
  const recs: AspectRecommendation[] = [];
  const { interests, social } = profile;
  
  // Interest-based events
  if (interests.length > 0) {
    recs.push({
      aspect: 'events',
      title: `${interests[0].topic} Events Near You`,
      description: 'Local events matching your top interests',
      confidence: 0.85,
      reasoning: `Your interest in ${interests[0].topic} (from ${interests[0].sources.join(', ')})`,
    });
  }
  
  // Group size preference
  if (social.preferred_group_size === 'small') {
    recs.push({
      aspect: 'events',
      title: 'Intimate Gatherings',
      description: 'Small group events and workshops',
      confidence: 0.8,
      reasoning: 'You seem to prefer smaller group settings',
    });
  } else if (social.preferred_group_size === 'large') {
    recs.push({
      aspect: 'events',
      title: 'Big Events & Festivals',
      description: 'Large-scale events happening soon',
      confidence: 0.8,
      reasoning: 'You enjoy larger social gatherings',
    });
  }
  
  return recs;
}



