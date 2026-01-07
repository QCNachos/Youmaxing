'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, Download, Trash2, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function PrivacySettings() {
  const [downloading, setDownloading] = useState(false);
  const [preferences, setPreferences] = useState({
    dataCollection: true,
    aiTraining: false,
    profileVisibility: true,
    activitySharing: true,
  });

  const handleDownloadData = async () => {
    setDownloading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Fetch all user data
      const [profile, preferences, activities, insights] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
        supabase.from('activities').select('*').eq('user_id', user.id),
        supabase.from('user_insights').select('*').eq('user_id', user.id),
      ]);

      const userData = {
        profile: profile.data,
        preferences: preferences.data,
        activities: activities.data,
        insights: insights.data,
        exportDate: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youmaxing-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Your data has been downloaded');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Failed to download data');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is currently disabled. Please contact support.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Privacy & Security</h2>
        <p className="text-muted-foreground">Manage your data and privacy settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>Control how your data is used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Collection</p>
              <p className="text-sm text-muted-foreground">
                Allow anonymous usage analytics to improve the app
              </p>
            </div>
            <Switch 
              checked={preferences.dataCollection}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, dataCollection: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AI Training</p>
              <p className="text-sm text-muted-foreground">
                Help improve AI with your interactions
              </p>
            </div>
            <Switch 
              checked={preferences.aiTraining}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, aiTraining: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibility Settings
          </CardTitle>
          <CardDescription>Control who can see your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profile Visibility</p>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch 
              checked={preferences.profileVisibility}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, profileVisibility: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Activity Sharing</p>
              <p className="text-sm text-muted-foreground">
                Share your activities in the social feed
              </p>
            </div>
            <Switch 
              checked={preferences.activitySharing}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, activitySharing: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="outline" disabled>
              Change Password
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Password management coming soon
            </p>
          </div>

          <div>
            <Button variant="outline" disabled>
              Enable Two-Factor Authentication
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              2FA coming soon for enhanced security
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Data
          </CardTitle>
          <CardDescription>Export or manage your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Download a copy of all your data including profile, activities, and insights
            </p>
            <Button 
              variant="outline" 
              onClick={handleDownloadData}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download My Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-2">
              Account deletion is currently disabled. Contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="link" className="h-auto p-0 text-sm" asChild>
            <a href="/privacy-policy" target="_blank">Privacy Policy</a>
          </Button>
          <br />
          <Button variant="link" className="h-auto p-0 text-sm" asChild>
            <a href="/terms-of-service" target="_blank">Terms of Service</a>
          </Button>
          <br />
          <Button variant="link" className="h-auto p-0 text-sm" asChild>
            <a href="/cookie-policy" target="_blank">Cookie Policy</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

