/**
 * Schema Validator for AI Tool Outputs
 * 
 * This module ensures AI-generated data matches database schemas before insertion.
 * Pattern: AI Output → Validate → Transform → Insert
 * 
 * This prevents issues where:
 * - AI outputs extra fields that don't exist in DB
 * - AI misses required fields
 * - AI uses wrong data types
 * - AI uses different field names than expected
 */

// Define the exact schema for each database table the AI can write to
// This acts as the "contract" between AI output and database

export interface TrainingLogSchema {
  user_id: string;
  title: string;
  type: string | null;
  duration_minutes: number | null;
  intensity: string | null;
  notes: string | null;
  completed_at: string | null;
}

export interface CalendarEventSchema {
  user_id: string;
  title: string;
  description: string | null;
  aspect: string;
  type: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  priority: string;
  status: string;
}

export interface MealSchema {
  user_id: string;
  name: string;
  type: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  sugar: number | null;
  notes: string | null;
  logged_at: string | null;
}

// Validation result type
interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validate and transform AI output for training_logs table
 */
export function validateTrainingLog(
  userId: string,
  aiOutput: Record<string, unknown>
): ValidationResult<TrainingLogSchema> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract and validate title (required)
  let title = aiOutput.title as string | undefined;
  if (!title) {
    // Try to construct from type and duration
    const type = aiOutput.type as string || 'workout';
    const duration = aiOutput.duration_minutes as number || aiOutput.duration as number;
    title = duration ? `${duration}min ${type}` : `${type} session`;
    warnings.push(`Title was missing, generated: "${title}"`);
  }

  // Extract and validate type
  let type = aiOutput.type as string | undefined;
  const validTypes = ['cardio', 'strength', 'flexibility', 'hiit', 'sports', 'other'];
  if (type && !validTypes.includes(type.toLowerCase())) {
    // Try to map common variations
    const typeMap: Record<string, string> = {
      'run': 'cardio',
      'running': 'cardio',
      'jog': 'cardio',
      'jogging': 'cardio',
      'walk': 'cardio',
      'walking': 'cardio',
      'cycle': 'cardio',
      'cycling': 'cardio',
      'bike': 'cardio',
      'biking': 'cardio',
      'swim': 'cardio',
      'swimming': 'cardio',
      'weights': 'strength',
      'lifting': 'strength',
      'gym': 'strength',
      'yoga': 'flexibility',
      'stretching': 'flexibility',
      'stretch': 'flexibility',
      'crossfit': 'hiit',
      'interval': 'hiit',
      'soccer': 'sports',
      'football': 'sports',
      'basketball': 'sports',
      'tennis': 'sports',
      'hockey': 'sports',
    };
    type = typeMap[type.toLowerCase()] || 'other';
    warnings.push(`Type "${aiOutput.type}" mapped to "${type}"`);
  }
  type = type?.toLowerCase() || 'other';

  // Extract duration - handle various formats
  let duration: number | null = null;
  if (aiOutput.duration_minutes !== undefined) {
    duration = Number(aiOutput.duration_minutes);
  } else if (aiOutput.duration !== undefined) {
    duration = Number(aiOutput.duration);
  } else if (aiOutput.duration_seconds !== undefined) {
    duration = Math.round(Number(aiOutput.duration_seconds) / 60);
  } else if (aiOutput.time !== undefined) {
    // Try to parse time strings like "25 min" or "1h 30m"
    const timeStr = String(aiOutput.time);
    const minMatch = timeStr.match(/(\d+)\s*(?:min|m\b)/i);
    const hourMatch = timeStr.match(/(\d+)\s*(?:hour|h\b)/i);
    if (minMatch) duration = parseInt(minMatch[1]);
    if (hourMatch) duration = (duration || 0) + parseInt(hourMatch[1]) * 60;
  }
  if (duration !== null && (isNaN(duration) || duration < 0)) {
    warnings.push(`Invalid duration "${aiOutput.duration_minutes}", set to null`);
    duration = null;
  }

  // Extract intensity
  let intensity = aiOutput.intensity as string | undefined;
  const validIntensities = ['low', 'medium', 'high', 'light', 'moderate', 'intense', 'easy', 'hard'];
  if (intensity) {
    intensity = intensity.toLowerCase();
    // Normalize intensity values
    const intensityMap: Record<string, string> = {
      'easy': 'low',
      'light': 'low',
      'moderate': 'medium',
      'hard': 'high',
      'intense': 'high',
      'very hard': 'high',
    };
    intensity = intensityMap[intensity] || intensity;
    if (!['low', 'medium', 'high'].includes(intensity)) {
      intensity = 'medium';
    }
  } else {
    intensity = 'medium';
  }

  // Build notes - include any extra context the AI provided
  const noteParts: string[] = [];
  if (aiOutput.notes) noteParts.push(String(aiOutput.notes));
  if (aiOutput.pace) noteParts.push(`Pace: ${aiOutput.pace}`);
  if (aiOutput.distance) noteParts.push(`Distance: ${aiOutput.distance}`);
  if (aiOutput.calories_burned) noteParts.push(`Calories: ${aiOutput.calories_burned}`);
  if (aiOutput.conditions) noteParts.push(`Conditions: ${aiOutput.conditions}`);
  if (aiOutput.location) noteParts.push(`Location: ${aiOutput.location}`);
  const notes = noteParts.length > 0 ? noteParts.join('. ') : null;

  // Build validated schema object
  const validatedData: TrainingLogSchema = {
    user_id: userId,
    title: title,
    type: type,
    duration_minutes: duration,
    intensity: intensity,
    notes: notes,
    completed_at: new Date().toISOString(),
  };

  return {
    success: errors.length === 0,
    data: validatedData,
    errors,
    warnings,
  };
}

/**
 * Validate and transform AI output for calendar_events table
 */
export function validateCalendarEvent(
  userId: string,
  aiOutput: Record<string, unknown>
): ValidationResult<CalendarEventSchema> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title is required
  const title = aiOutput.title as string;
  if (!title) {
    errors.push('Title is required for calendar events');
  }

  // Start date is required
  let startDate = aiOutput.start_date as string || aiOutput.startDate as string || aiOutput.date as string;
  if (!startDate) {
    errors.push('Start date is required for calendar events');
    startDate = new Date().toISOString();
  }

  // Validate and default other fields
  const description = (aiOutput.description as string) || null;
  const aspect = (aiOutput.aspect as string) || 'events';
  const type = (aiOutput.type as string) || 'event';
  const endDate = (aiOutput.end_date as string) || (aiOutput.endDate as string) || null;
  const allDay = Boolean(aiOutput.all_day ?? aiOutput.allDay ?? false);
  const priority = (aiOutput.priority as string) || 'medium';
  const status = (aiOutput.status as string) || 'scheduled';

  const validatedData: CalendarEventSchema = {
    user_id: userId,
    title: title || 'Untitled Event',
    description,
    aspect,
    type,
    start_date: startDate,
    end_date: endDate,
    all_day: allDay,
    priority,
    status,
  };

  return {
    success: errors.length === 0,
    data: validatedData,
    errors,
    warnings,
  };
}

/**
 * Validate and transform AI output for meals table
 */
export function validateMeal(
  userId: string,
  aiOutput: Record<string, unknown>
): ValidationResult<MealSchema> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Name is required
  let name = aiOutput.name as string;
  if (!name) {
    name = aiOutput.title as string || aiOutput.food as string || 'Meal';
    if (!aiOutput.name) warnings.push(`Meal name was missing, using: "${name}"`);
  }

  // Parse numeric values safely
  const parseNumber = (val: unknown): number | null => {
    if (val === undefined || val === null || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const validatedData: MealSchema = {
    user_id: userId,
    name: name,
    type: (aiOutput.type as string) || (aiOutput.meal_type as string) || null,
    calories: parseNumber(aiOutput.calories),
    protein: parseNumber(aiOutput.protein),
    carbs: parseNumber(aiOutput.carbs) || parseNumber(aiOutput.carbohydrates),
    fat: parseNumber(aiOutput.fat) || parseNumber(aiOutput.fats),
    fiber: parseNumber(aiOutput.fiber),
    sodium: parseNumber(aiOutput.sodium),
    sugar: parseNumber(aiOutput.sugar),
    notes: (aiOutput.notes as string) || null,
    logged_at: new Date().toISOString(),
  };

  return {
    success: errors.length === 0,
    data: validatedData,
    errors,
    warnings,
  };
}

/**
 * Log validation results for debugging
 */
export function logValidation(
  toolName: string,
  aiOutput: Record<string, unknown>,
  result: ValidationResult<unknown>
): void {
  console.log(`[Schema Validator] ${toolName}:`);
  console.log('  AI Output:', JSON.stringify(aiOutput, null, 2));
  console.log('  Validated:', JSON.stringify(result.data, null, 2));
  if (result.warnings.length > 0) {
    console.log('  Warnings:', result.warnings);
  }
  if (result.errors.length > 0) {
    console.error('  Errors:', result.errors);
  }
}
