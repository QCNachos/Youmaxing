import type { AspectType } from '@/types/database';

export interface ThoughtLeader {
  id: string;
  name: string;
  handle: string; // Twitter/X handle
  avatar?: string;
  expertise: string[];
  bio: string;
}

export interface CuratedInsight {
  id: string;
  leaderId: string;
  content: string;
  source?: string;
  relevantAspects: AspectType[];
  tags: string[];
}

// Thought leaders organized by expertise
export const thoughtLeaders: ThoughtLeader[] = [
  // Business & Entrepreneurship
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    handle: '@elonmusk',
    expertise: ['business', 'technology', 'innovation'],
    bio: 'CEO of Tesla, SpaceX, and X. Building the future.',
  },
  {
    id: 'naval-ravikant',
    name: 'Naval Ravikant',
    handle: '@naval',
    expertise: ['business', 'finance', 'philosophy'],
    bio: 'Angel investor, philosopher. How to get rich without getting lucky.',
  },
  {
    id: 'paul-graham',
    name: 'Paul Graham',
    handle: '@paulg',
    expertise: ['business', 'startups', 'writing'],
    bio: 'Co-founder of Y Combinator. Essayist on startups and life.',
  },
  {
    id: 'sam-altman',
    name: 'Sam Altman',
    handle: '@sama',
    expertise: ['business', 'technology', 'AI'],
    bio: 'CEO of OpenAI. Former president of Y Combinator.',
  },

  // Health & Training
  {
    id: 'bryan-johnson',
    name: 'Bryan Johnson',
    handle: '@bryan_johnson',
    expertise: ['training', 'food', 'health', 'longevity'],
    bio: 'Founder of Blueprint. Measuring everything to reverse aging.',
  },
  {
    id: 'andrew-huberman',
    name: 'Andrew Huberman',
    handle: '@hubaboratory',
    expertise: ['training', 'health', 'neuroscience'],
    bio: 'Stanford neuroscientist. Host of Huberman Lab podcast.',
  },
  {
    id: 'peter-attia',
    name: 'Peter Attia',
    handle: '@PeterAttiaMD',
    expertise: ['health', 'longevity', 'food'],
    bio: 'Physician focused on longevity. Host of The Drive podcast.',
  },
  {
    id: 'david-goggins',
    name: 'David Goggins',
    handle: '@davidgoggins',
    expertise: ['training', 'sports', 'mindset'],
    bio: 'Ultra-endurance athlete. Author of Can\'t Hurt Me.',
  },
  {
    id: 'andy-galpin',
    name: 'Andy Galpin',
    handle: '@DrAndyGalpin',
    expertise: ['training', 'sports', 'science'],
    bio: 'Exercise physiologist. Expert on strength and conditioning.',
  },

  // Finance & Investing
  {
    id: 'ray-dalio',
    name: 'Ray Dalio',
    handle: '@RayDalio',
    expertise: ['finance', 'investing', 'economics'],
    bio: 'Founder of Bridgewater. Author of Principles.',
  },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    handle: '@WarrenBuffett',
    expertise: ['finance', 'investing', 'business'],
    bio: 'CEO of Berkshire Hathaway. The Oracle of Omaha.',
  },
  {
    id: 'morgan-housel',
    name: 'Morgan Housel',
    handle: '@morganhousel',
    expertise: ['finance', 'psychology', 'writing'],
    bio: 'Author of The Psychology of Money. Partner at Collaborative Fund.',
  },

  // Productivity & Self-Improvement
  {
    id: 'cal-newport',
    name: 'Cal Newport',
    handle: '@caborellas',
    expertise: ['business', 'productivity', 'focus'],
    bio: 'Computer science professor. Author of Deep Work.',
  },
  {
    id: 'james-clear',
    name: 'James Clear',
    handle: '@JamesClear',
    expertise: ['habits', 'productivity', 'self-improvement'],
    bio: 'Author of Atomic Habits. Expert on habit formation.',
  },
  {
    id: 'tim-ferriss',
    name: 'Tim Ferriss',
    handle: '@tferriss',
    expertise: ['business', 'productivity', 'lifestyle'],
    bio: 'Author of 4-Hour Workweek. Podcast host and investor.',
  },

  // Relationships & Psychology
  {
    id: 'esther-perel',
    name: 'Esther Perel',
    handle: '@EstherPerel',
    expertise: ['family', 'friends', 'relationships'],
    bio: 'Psychotherapist and author. Expert on modern relationships.',
  },
  {
    id: 'brene-brown',
    name: 'Brené Brown',
    handle: '@BreneBrown',
    expertise: ['family', 'friends', 'vulnerability'],
    bio: 'Research professor. Author on courage and vulnerability.',
  },
];

// Curated insights (mock data - would come from API in production)
export const curatedInsights: CuratedInsight[] = [
  // Business
  {
    id: 'naval-wealth-1',
    leaderId: 'naval-ravikant',
    content: 'Seek wealth, not money or status. Wealth is having assets that earn while you sleep.',
    relevantAspects: ['finance', 'business'],
    tags: ['wealth', 'passive-income', 'mindset'],
  },
  {
    id: 'paul-startup-1',
    leaderId: 'paul-graham',
    content: 'The way to get startup ideas is not to try to think of startup ideas. It\'s to look for problems, preferably problems you have yourself.',
    relevantAspects: ['business'],
    tags: ['startups', 'ideas', 'problem-solving'],
  },
  {
    id: 'elon-work-1',
    leaderId: 'elon-musk',
    content: 'Work like hell. If other people are putting in 40-hour work weeks and you\'re putting in 100-hour work weeks, you will achieve in 4 months what it takes them a year.',
    relevantAspects: ['business'],
    tags: ['work-ethic', 'hustle', 'success'],
  },

  // Health & Training
  {
    id: 'bryan-sleep-1',
    leaderId: 'bryan-johnson',
    content: 'Sleep is the foundation. Everything else - exercise, diet, supplements - is optimizing on top of sleep. Get that right first.',
    relevantAspects: ['training', 'food'],
    tags: ['sleep', 'recovery', 'foundation'],
  },
  {
    id: 'huberman-morning-1',
    leaderId: 'andrew-huberman',
    content: 'Get sunlight in your eyes within 30-60 minutes of waking. This sets your circadian rhythm and improves sleep, focus, and mood.',
    relevantAspects: ['training'],
    tags: ['morning-routine', 'circadian', 'sunlight'],
  },
  {
    id: 'goggins-mind-1',
    leaderId: 'david-goggins',
    content: 'When you think you\'re done, you\'re only at 40% of your capacity. The mind gives up before the body.',
    relevantAspects: ['training', 'sports'],
    tags: ['mindset', 'limits', 'pushing-through'],
  },
  {
    id: 'attia-zone2-1',
    leaderId: 'peter-attia',
    content: 'Zone 2 cardio is the most underrated form of exercise. 3-4 hours per week builds your metabolic foundation for longevity.',
    relevantAspects: ['training', 'sports'],
    tags: ['cardio', 'longevity', 'zone2'],
  },

  // Finance
  {
    id: 'buffett-invest-1',
    leaderId: 'warren-buffett',
    content: 'The stock market is a device for transferring money from the impatient to the patient.',
    relevantAspects: ['finance'],
    tags: ['investing', 'patience', 'long-term'],
  },
  {
    id: 'housel-money-1',
    leaderId: 'morgan-housel',
    content: 'Spending money to show people how much money you have is the fastest way to have less money.',
    relevantAspects: ['finance'],
    tags: ['spending', 'wealth', 'status'],
  },
  {
    id: 'dalio-principles-1',
    leaderId: 'ray-dalio',
    content: 'Pain + Reflection = Progress. The quality of your life depends on the quality of your decisions, which depends on the quality of your thinking.',
    relevantAspects: ['finance', 'business'],
    tags: ['principles', 'reflection', 'growth'],
  },

  // Productivity
  {
    id: 'newport-deep-1',
    leaderId: 'cal-newport',
    content: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It\'s a superpower in the 21st century.',
    relevantAspects: ['business'],
    tags: ['focus', 'deep-work', 'productivity'],
  },
  {
    id: 'clear-habits-1',
    leaderId: 'james-clear',
    content: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    relevantAspects: ['training', 'business'],
    tags: ['habits', 'systems', 'goals'],
  },

  // Relationships
  {
    id: 'perel-love-1',
    leaderId: 'esther-perel',
    content: 'The quality of your relationships determines the quality of your life.',
    relevantAspects: ['family', 'friends'],
    tags: ['relationships', 'connection', 'love'],
  },
  {
    id: 'brown-vulnerability-1',
    leaderId: 'brene-brown',
    content: 'Vulnerability is not winning or losing; it\'s having the courage to show up when you can\'t control the outcome.',
    relevantAspects: ['family', 'friends'],
    tags: ['vulnerability', 'courage', 'authenticity'],
  },
];

// Get leaders relevant to a specific aspect
export function getLeadersForAspect(aspect: AspectType): ThoughtLeader[] {
  return thoughtLeaders.filter(leader => 
    leader.expertise.includes(aspect) || 
    leader.expertise.some(e => e.toLowerCase().includes(aspect.toLowerCase()))
  );
}

// Get insights relevant to a specific aspect
export function getInsightsForAspect(aspect: AspectType): CuratedInsight[] {
  return curatedInsights.filter(insight => 
    insight.relevantAspects.includes(aspect)
  );
}

// Get a random insight for an aspect
export function getRandomInsightForAspect(aspect: AspectType): CuratedInsight | null {
  const insights = getInsightsForAspect(aspect);
  if (insights.length === 0) return null;
  return insights[Math.floor(Math.random() * insights.length)];
}

// Get leader by ID
export function getLeaderById(id: string): ThoughtLeader | undefined {
  return thoughtLeaders.find(leader => leader.id === id);
}

// Format an insight with leader attribution
export function formatInsightWithAttribution(insight: CuratedInsight): string {
  const leader = getLeaderById(insight.leaderId);
  if (!leader) return insight.content;
  return `"${insight.content}" — ${leader.name}`;
}




