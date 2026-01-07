'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  User,
  Brain,
  Bell,
  Shield,
  Palette,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

// Lazy load settings components for faster initial load
const ProfileSettings = lazy(() => import('@/components/settings/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const InsightAgentSettings = lazy(() => import('@/components/settings/InsightAgentSettings').then(m => ({ default: m.InsightAgentSettings })));
const NotificationsSettings = lazy(() => import('@/components/settings/NotificationsSettings').then(m => ({ default: m.NotificationsSettings })));
const PrivacySettings = lazy(() => import('@/components/settings/PrivacySettings').then(m => ({ default: m.PrivacySettings })));
const AppearanceSettings = lazy(() => import('@/components/settings/AppearanceSettings').then(m => ({ default: m.AppearanceSettings })));
const BillingSettings = lazy(() => import('@/components/settings/BillingSettings').then(m => ({ default: m.BillingSettings })));

function SettingsContent() {
  // TODO: Get actual user ID from auth
  const userId = 'demo-user-id';
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value);
  };

  // Prevent any parent click handlers
  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'insights', label: 'Insight Agent', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];
  
  return (
    <div className="fixed inset-0 bg-background overflow-hidden z-[100]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>
      
      <main className="h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Tab Navigation */}
            <TabsList 
              className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 flex-wrap gap-1"
              onClick={handleTabClick}
            >
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background rounded-lg"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <ProfileSettings userId={userId} />
                </div>
              </Suspense>
            </TabsContent>
            
            {/* Insight Agent Tab */}
            <TabsContent value="insights" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <InsightAgentSettings userId={userId} />
                </div>
              </Suspense>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <NotificationsSettings userId={userId} />
                </div>
              </Suspense>
            </TabsContent>
            
            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <PrivacySettings />
                </div>
              </Suspense>
            </TabsContent>
            
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <AppearanceSettings />
                </div>
              </Suspense>
            </TabsContent>
            
            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
                <div className="space-y-4">
                  <BillingSettings />
                </div>
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-background z-[100]" />}>
      <SettingsContent />
    </Suspense>
  );
}
