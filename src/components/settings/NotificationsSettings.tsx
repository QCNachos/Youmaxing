'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { aspects } from '@/lib/aspects';

interface NotificationsSettingsProps {
  userId: string;
}

export function NotificationsSettings({ userId }: NotificationsSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyDigest: true,
    weeklyReport: true,
    aspectReminders: true,
    socialUpdates: true,
    achievementAlerts: true,
  });

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        // Map database fields to local state
        // Note: Full notification preferences coming soon
        const enabled = data.notifications_enabled ?? true;
        setPreferences({
          emailNotifications: enabled,
          pushNotifications: false,
          dailyDigest: enabled,
          weeklyReport: enabled,
          aspectReminders: enabled,
          socialUpdates: enabled,
          achievementAlerts: enabled,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .update({
          notifications_enabled: preferences.emailNotifications || preferences.dailyDigest,
          // Note: Additional notification preferences coming soon
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        toast.error('Failed to save preferences');
        return;
      }

      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground">Control how and when you receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
            </div>
            <Switch 
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts on your device
                </p>
              </div>
            </div>
            <Switch 
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
          <CardDescription>What you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Digest</p>
              <p className="text-sm text-muted-foreground">
                Summary of your day's activities and goals
              </p>
            </div>
            <Switch 
              checked={preferences.dailyDigest}
              onCheckedChange={(checked) => updatePreference('dailyDigest', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Report</p>
              <p className="text-sm text-muted-foreground">
                Progress overview and insights
              </p>
            </div>
            <Switch 
              checked={preferences.weeklyReport}
              onCheckedChange={(checked) => updatePreference('weeklyReport', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aspect Reminders</p>
              <p className="text-sm text-muted-foreground">
                Reminders for scheduled activities
              </p>
            </div>
            <Switch 
              checked={preferences.aspectReminders}
              onCheckedChange={(checked) => updatePreference('aspectReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Social Updates</p>
              <p className="text-sm text-muted-foreground">
                Activity from friends and connections
              </p>
            </div>
            <Switch 
              checked={preferences.socialUpdates}
              onCheckedChange={(checked) => updatePreference('socialUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Achievement Alerts</p>
              <p className="text-sm text-muted-foreground">
                Celebrate your milestones and wins
              </p>
            </div>
            <Switch 
              checked={preferences.achievementAlerts}
              onCheckedChange={(checked) => updatePreference('achievementAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Set times when you don't want to be disturbed</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure quiet hours to pause notifications during specific times
          </p>
          <Button variant="outline" disabled>
            Configure Quiet Hours
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Coming soon
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
}

