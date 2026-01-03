import type { AspectType } from '@/types/database';

export type PersonaType = 'geek-buddy' | 'coach' | 'analyst';

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  tone: string;
  emoji: string;
  greeting: (userName: string, timeOfDay: 'morning' | 'afternoon' | 'evening') => string;
  celebrate: (achievement: string) => string;
  nudge: (task: string, context?: string) => string;
  insight: (topic: string, insight: string) => string;
}

const timeGreeting = (timeOfDay: 'morning' | 'afternoon' | 'evening'): string => {
  switch (timeOfDay) {
    case 'morning': return 'Morning';
    case 'afternoon': return 'Yo';
    case 'evening': return 'Evening';
  }
};

export const personas: Record<PersonaType, Persona> = {
  'geek-buddy': {
    id: 'geek-buddy',
    name: 'Geek Buddy',
    description: 'A successful, knowledgeable friend who texts you valuable insights casually throughout the day',
    tone: 'casual, friendly, like texting a successful friend who has time and wisdom',
    emoji: '🤙',
    greeting: (userName, timeOfDay) => {
      const greetings = [
        `${timeGreeting(timeOfDay)} ${userName}! What's good?`,
        `Hey ${userName}! Quick thought for you today...`,
        `${timeGreeting(timeOfDay)}! Been thinking about your goals...`,
        `${userName}! Got something interesting for you.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
    celebrate: (achievement) => {
      const celebrations = [
        `Yo, ${achievement}! That's what I'm talking about 🔥`,
        `${achievement}?! You're actually doing this. Respect. 💪`,
        `Okay okay, ${achievement}! Keep that energy.`,
        `${achievement} - not surprised tbh, you've been locked in lately.`,
      ];
      return celebrations[Math.floor(Math.random() * celebrations.length)];
    },
    nudge: (task, context) => {
      const nudges = [
        `Quick thing - ${task}. ${context ? context : 'Worth a look?'}`,
        `Random reminder: ${task}. No pressure, just flagging it.`,
        `You mentioned ${task} - still on your radar?`,
        `Thinking about your goals... ${task} might be worth tackling today.`,
      ];
      return nudges[Math.floor(Math.random() * nudges.length)];
    },
    insight: (topic, insight) => {
      const intros = [
        `Saw this about ${topic} and thought of you: "${insight}"`,
        `Random ${topic} insight that hit different: "${insight}"`,
        `This ${topic} take is 🔥: "${insight}"`,
        `Worth considering for ${topic}: "${insight}"`,
      ];
      return intros[Math.floor(Math.random() * intros.length)];
    },
  },

  'coach': {
    id: 'coach',
    name: 'Coach',
    description: 'Structured, goal-focused, and accountability-driven',
    tone: 'motivational, direct, focused on action and results',
    emoji: '🏆',
    greeting: (userName, timeOfDay) => {
      const greetings = [
        `Good ${timeOfDay}, ${userName}. Let's make today count.`,
        `${userName}, ready to execute? Here's your focus for today.`,
        `Rise and grind, ${userName}. We've got work to do.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
    celebrate: (achievement) => {
      const celebrations = [
        `Excellent work! ${achievement} - that's the discipline paying off.`,
        `${achievement}. This is what consistency looks like. Keep pushing.`,
        `Achievement unlocked: ${achievement}. Now, what's next?`,
      ];
      return celebrations[Math.floor(Math.random() * celebrations.length)];
    },
    nudge: (task, context) => {
      const nudges = [
        `Priority check: ${task}. ${context || 'This aligns with your goals.'}`,
        `Action item: ${task}. Let's get it done today.`,
        `Accountability moment: ${task} is still pending. What's the blocker?`,
      ];
      return nudges[Math.floor(Math.random() * nudges.length)];
    },
    insight: (topic, insight) => {
      return `Key insight for ${topic}: "${insight}" - How can you apply this today?`;
    },
  },

  'analyst': {
    id: 'analyst',
    name: 'Analyst',
    description: 'Data-driven insights, metrics-focused, professional tone',
    tone: 'analytical, precise, evidence-based',
    emoji: '📊',
    greeting: (userName, timeOfDay) => {
      const greetings = [
        `Good ${timeOfDay}, ${userName}. Here's your data summary.`,
        `${userName}, I've analyzed your recent activity. Key findings below.`,
        `Status report ready, ${userName}. Let's review the metrics.`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },
    celebrate: (achievement) => {
      const celebrations = [
        `Milestone achieved: ${achievement}. This represents significant progress.`,
        `Data point: ${achievement}. You're tracking above baseline.`,
        `${achievement} confirmed. Performance metrics are trending positive.`,
      ];
      return celebrations[Math.floor(Math.random() * celebrations.length)];
    },
    nudge: (task, context) => {
      const nudges = [
        `Optimization opportunity: ${task}. ${context || 'Data suggests this would improve outcomes.'}`,
        `Analysis indicates: ${task} would benefit from attention today.`,
        `Recommendation based on patterns: ${task}.`,
      ];
      return nudges[Math.floor(Math.random() * nudges.length)];
    },
    insight: (topic, insight) => {
      return `Research on ${topic} indicates: "${insight}" - Statistically significant finding.`;
    },
  },
};

export const defaultPersona: PersonaType = 'geek-buddy';

export function getPersona(type: PersonaType = defaultPersona): Persona {
  return personas[type];
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

