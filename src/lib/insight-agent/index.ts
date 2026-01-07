/**
 * Insight Agent Module
 * 
 * Central export for the insight agent system.
 * For users WITH Claude Code: Automated browser analysis
 * For users WITHOUT Claude Code: Fallback to manual input + surveys
 */

export * from './types';
export * from './analysis-prompts';
export * from './recommendation-engine';

// Re-export for convenience
export { 
  PLATFORM_ANALYSIS,
  generateAnalysisPrompt,
  generateSinglePlatformPrompt,
} from './analysis-prompts';

export {
  generateAspectRecommendations,
  generateCrossAspectInsights,
} from './recommendation-engine';



