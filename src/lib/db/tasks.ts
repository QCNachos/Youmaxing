import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type DailyTask = Database['public']['Tables']['daily_tasks']['Row'];
type DailyTaskInsert = Database['public']['Tables']['daily_tasks']['Insert'];
type DailyTaskUpdate = Database['public']['Tables']['daily_tasks']['Update'];

type WeeklyObjective = Database['public']['Tables']['weekly_objectives']['Row'];
type WeeklyObjectiveInsert = Database['public']['Tables']['weekly_objectives']['Insert'];
type WeeklyObjectiveUpdate = Database['public']['Tables']['weekly_objectives']['Update'];

type MonthlyObjective = Database['public']['Tables']['monthly_objectives']['Row'];
type MonthlyObjectiveInsert = Database['public']['Tables']['monthly_objectives']['Insert'];
type MonthlyObjectiveUpdate = Database['public']['Tables']['monthly_objectives']['Update'];

// =====================================================
// DAILY TASKS
// =====================================================

export async function getDailyTasks(userId: string, targetDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('target_date', targetDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDailyTasksForDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('target_date', startDate)
    .lte('target_date', endDate)
    .order('target_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createDailyTask(task: DailyTaskInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDailyTask(id: string, updates: DailyTaskUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDailyTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
  
  return updateDailyTask(id, { 
    status: newStatus,
    completed_at: completedAt 
  });
}

// =====================================================
// WEEKLY OBJECTIVES
// =====================================================

export async function getWeeklyObjectives(userId: string, targetWeekStart: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('weekly_objectives')
    .select('*')
    .eq('user_id', userId)
    .eq('target_week_start', targetWeekStart)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getWeeklyObjectivesForDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('weekly_objectives')
    .select('*')
    .eq('user_id', userId)
    .gte('target_week_start', startDate)
    .lte('target_week_start', endDate)
    .order('target_week_start', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createWeeklyObjective(objective: WeeklyObjectiveInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('weekly_objectives')
    .insert(objective)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWeeklyObjective(id: string, updates: WeeklyObjectiveUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('weekly_objectives')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeeklyObjective(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('weekly_objectives')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// MONTHLY OBJECTIVES
// =====================================================

export async function getMonthlyObjectives(userId: string, targetMonth: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_objectives')
    .select('*')
    .eq('user_id', userId)
    .eq('target_month', targetMonth)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMonthlyObjectivesForDateRange(userId: string, startMonth: string, endMonth: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_objectives')
    .select('*')
    .eq('user_id', userId)
    .gte('target_month', startMonth)
    .lte('target_month', endMonth)
    .order('target_month', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createMonthlyObjective(objective: MonthlyObjectiveInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_objectives')
    .insert(objective)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMonthlyObjective(id: string, updates: MonthlyObjectiveUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_objectives')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMonthlyObjective(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('monthly_objectives')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getWeekStart(date: Date): string {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getMonthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

