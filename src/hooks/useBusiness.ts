'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ProjectStatus = 'idea' | 'planning' | 'active' | 'paused' | 'completed';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface BusinessProject {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  priority: ProjectPriority;
  deadline: string | null;
  created_at: string;
}

export interface ProjectInsert {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  deadline?: string;
}

export function useBusiness() {
  const [projects, setProjects] = useState<BusinessProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(async (options?: {
    status?: ProjectStatus;
    priority?: ProjectPriority;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        return;
      }

      let query = supabase
        .from('business_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel('business_projects_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_projects',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchProjects();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchProjects]);

  // Create a project
  const createProject = useCallback(async (project: ProjectInsert): Promise<BusinessProject | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_projects')
        .insert({
          user_id: user.id,
          name: project.name,
          description: project.description || null,
          status: project.status || 'idea',
          priority: project.priority || 'medium',
          deadline: project.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
      return null;
    }
  }, []);

  // Update a project
  const updateProject = useCallback(async (id: string, updates: Partial<ProjectInsert>): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('business_projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } as BusinessProject : p
      ));
      return true;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
      return false;
    }
  }, []);

  // Quick status update
  const updateStatus = useCallback(async (id: string, status: ProjectStatus): Promise<boolean> => {
    return updateProject(id, { status });
  }, [updateProject]);

  // Delete a project
  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('business_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
      return false;
    }
  }, []);

  // Get projects by status
  const getProjectsByStatus = useCallback((status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  }, [projects]);

  // Get stats
  const getStats = useCallback(() => {
    const statusCounts: Record<ProjectStatus, number> = {
      idea: 0,
      planning: 0,
      active: 0,
      paused: 0,
      completed: 0,
    };

    projects.forEach(p => {
      statusCounts[p.status]++;
    });

    const upcomingDeadlines = projects
      .filter(p => p.deadline && new Date(p.deadline) > new Date())
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3);

    return {
      total: projects.length,
      statusCounts,
      activeCount: statusCounts.active,
      upcomingDeadlines,
    };
  }, [projects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    updateStatus,
    deleteProject,
    getProjectsByStatus,
    getStats,
  };
}
