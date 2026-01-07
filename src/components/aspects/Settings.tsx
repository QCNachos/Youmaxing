'use client';

import { useState } from 'react';
import { AspectLayout } from './AspectLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Shield,
  Sparkles,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Smile,
  Briefcase,
  Heart,
  Zap,
} from 'lucide-react';
import type { AITone } from '@/types/database';

const aiTones: { id: AITone; name: string; icon: React.ReactNode }[] = [
  { id: 'chill', name: 'Chill', icon: <Smile className="h-5 w-5" /> },
  { id: 'professional', name: 'Professional', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'motivational', name: 'Motivational', icon: <Zap className="h-5 w-5" /> },
  { id: 'friendly', name: 'Friendly', icon: <Heart className="h-5 w-5" /> },
];

export function Settings() {
  const [selectedTone, setSelectedTone] = useState<AITone>('chill');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic'>('anthropic');
  const [dailyMessages, setDailyMessages] = useState(3);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <AspectLayout aspectId="settings">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-2xl text-white font-bold">
                  YM
                </div>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or create a 3D avatar from photo
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input defaultValue="User" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="user@example.com" disabled />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                AI Companion
              </CardTitle>
              <CardDescription>Customize your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>AI Tone</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {aiTones.map((tone) => (
                    <Button
                      key={tone.id}
                      variant={selectedTone === tone.id ? 'default' : 'outline'}
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setSelectedTone(tone.id)}
                    >
                      {tone.icon}
                      <span>{tone.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>AI Provider</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedProvider === 'openai' ? 'default' : 'outline'}
                    className="h-auto py-4"
                    onClick={() => setSelectedProvider('openai')}
                  >
                    <div className="text-center">
                      <p className="font-medium">OpenAI</p>
                      <p className="text-xs text-muted-foreground mt-1">GPT-4</p>
                    </div>
                  </Button>
                  <Button
                    variant={selectedProvider === 'anthropic' ? 'default' : 'outline'}
                    className="h-auto py-4"
                    onClick={() => setSelectedProvider('anthropic')}
                  >
                    <div className="text-center">
                      <p className="font-medium">Anthropic</p>
                      <p className="text-xs text-muted-foreground mt-1">Claude</p>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      How many AI check-ins per day
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDailyMessages(Math.max(1, dailyMessages - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{dailyMessages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDailyMessages(Math.min(5, dailyMessages + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive AI recommendations and reminders
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Get a morning overview of your day
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reminder Nudges</p>
                  <p className="text-sm text-muted-foreground">
                    Gentle reminders for goals and events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                    </p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3D Avatar</CardTitle>
              <CardDescription>Customize your avatar appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-4xl">🧑</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline">Customize Avatar</Button>
                  <p className="text-sm text-muted-foreground">
                    Change colors, accessories, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Collection</p>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage analytics
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">AI Training</p>
                  <p className="text-sm text-muted-foreground">
                    Help improve AI with your interactions
                  </p>
                </div>
                <Switch />
              </div>
              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔗</span>
                  <span>Google</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <span>Instagram</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎵</span>
                  <span>Spotify</span>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AspectLayout>
  );
}




