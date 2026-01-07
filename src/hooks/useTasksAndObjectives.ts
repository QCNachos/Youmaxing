import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  toggleTaskStatus,
  getWeeklyObjectives,
  createWeeklyObjective,
  updateWeeklyObjective,
  deleteWeeklyObjective,
  getMonthlyObjectives,
  createMonthlyObjective,
  updateMonthlyObjective,
  deleteMonthlyObjective,
  formatDateForDB,
  getWeekStart,
  getMonthStart,
} from '@/lib/db/tasks';
import type { Database } from '@/types/database';

type DailyTask = Database['public']['Tables']['daily_tasks']['Row'];
type DailyTaskInsert = Database['public']['Tables']['daily_tasks']['Insert'];
type WeeklyObjective = Database['public']['Tables']['weekly_objectives']['Row'];
type WeeklyObjectiveInsert = Database['public']['Tables']['weekly_objectives']['Insert'];
type MonthlyObjective = Database['public']['Tables']['monthly_objectives']['Row'];
type MonthlyObjectiveInsert = Database['public']['Tables']['monthly_objectives']['Insert'];

export function useTasksAndObjectives(date: Date) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [weeklyObjectives, setWeeklyObjectives] = useState<WeeklyObjective[]>([]);
  const [monthlyObjectives, setMonthlyObjectives] = useState<MonthlyObjective[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetDate = formatDateForDB(date);
  const targetWeekStart = getWeekStart(new Date(date));
  const targetMonth = getMonthStart(new Date(date));

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dailyTasksData, weeklyObjectivesData, monthlyObjectivesData] = await Promise.all([
          getDailyTasks(user.id, targetDate),
          getWeeklyObjectives(user.id, targetWeekStart),
          getMonthlyObjectives(user.id, targetMonth),
        ]);

        setTasks(dailyTasksData || []);
        setWeeklyObjectives(weeklyObjectivesData || []);
        setMonthlyObjectives(monthlyObjectivesData || []);
      } catch (err) {
        console.error('Error fetching tasks and objectives:', err);
        setError('Failed to load tasks and objectives');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, targetDate, targetWeekStart, targetMonth]);

  // Daily Tasks CRUD
  const addTask = async (taskData: Omit<DailyTaskInsert, 'user_id' | 'target_date'>) => {
    if (!user) return;

    try {
      const newTask = await createDailyTask({
        ...taskData,
        user_id: user.id,
        target_date: targetDate,
      });
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
      throw err;
    }
  };

  const editTask = async (id: string, updates: Partial<DailyTask>) => {
    try {
      const updatedTask = await updateDailyTask(id, updates);
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      throw err;
    }
  };

  const removeTask = async (id: string) => {
    try {
      await deleteDailyTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      throw err;
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const updatedTask = await toggleTaskStatus(id, task.status);
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      console.error('Error toggling task:', err);
      setError('Failed to toggle task status');
      throw err;
    }
  };

  // Weekly Objectives CRUD
  const addWeeklyObjective = async (objectiveData: Omit<WeeklyObjectiveInsert, 'user_id' | 'target_week_start'>) => {
    if (!user) return;

    try {
      const newObjective = await createWeeklyObjective({
        ...objectiveData,
        user_id: user.id,
        target_week_start: targetWeekStart,
      });
      setWeeklyObjectives([...weeklyObjectives, newObjective]);
      return newObjective;
    } catch (err) {
      console.error('Error creating weekly objective:', err);
      setError('Failed to create weekly objective');
      throw err;
    }
  };

  const editWeeklyObjective = async (id: string, updates: Partial<WeeklyObjective>) => {
    try {
      const updatedObjective = await updateWeeklyObjective(id, updates);
      setWeeklyObjectives(weeklyObjectives.map(o => (o.id === id ? updatedObjective : o)));
      return updatedObjective;
    } catch (err) {
      console.error('Error updating weekly objective:', err);
      setError('Failed to update weekly objective');
      throw err;
    }
  };

  const removeWeeklyObjective = async (id: string) => {
    try {
      await deleteWeeklyObjective(id);
      setWeeklyObjectives(weeklyObjectives.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error deleting weekly objective:', err);
      setError('Failed to delete weekly objective');
      throw err;
    }
  };

  // Monthly Objectives CRUD
  const addMonthlyObjective = async (objectiveData: Omit<MonthlyObjectiveInsert, 'user_id' | 'target_month'>) => {
    if (!user) return;

    try {
      const newObjective = await createMonthlyObjective({
        ...objectiveData,
        user_id: user.id,
        target_month: targetMonth,
      });
      setMonthlyObjectives([...monthlyObjectives, newObjective]);
      return newObjective;
    } catch (err) {
      console.error('Error creating monthly objective:', err);
      setError('Failed to create monthly objective');
      throw err;
    }
  };

  const editMonthlyObjective = async (id: string, updates: Partial<MonthlyObjective>) => {
    try {
      const updatedObjective = await updateMonthlyObjective(id, updates);
      setMonthlyObjectives(monthlyObjectives.map(o => (o.id === id ? updatedObjective : o)));
      return updatedObjective;
    } catch (err) {
      console.error('Error updating monthly objective:', err);
      setError('Failed to update monthly objective');
      throw err;
    }
  };

  const removeMonthlyObjective = async (id: string) => {
    try {
      await deleteMonthlyObjective(id);
      setMonthlyObjectives(monthlyObjectives.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error deleting monthly objective:', err);
      setError('Failed to delete monthly objective');
      throw err;
    }
  };

  return {
    // Data
    tasks,
    weeklyObjectives,
    monthlyObjectives,
    loading,
    error,

    // Daily Tasks
    addTask,
    editTask,
    removeTask,
    toggleTask,

    // Weekly Objectives
    addWeeklyObjective,
    editWeeklyObjective,
    removeWeeklyObjective,

    // Monthly Objectives
    addMonthlyObjective,
    editMonthlyObjective,
    removeMonthlyObjective,
  };
}

