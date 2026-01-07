'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  MoreVertical,
  Star,
  Clock,
  Upload,
  Link2,
  Sparkles,
  ArrowLeft,
  Home,
} from 'lucide-react';

// Folder/File types
export interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'note' | 'link';
  color?: string;
  icon?: string;
  children?: FolderItem[];
  content?: string; // For files/notes - content that enhances AI prompts
  url?: string; // For links (Google Drive, etc.)
  starred?: boolean;
  lastModified?: Date;
  aiContext?: string; // Summary for AI context
}

// Example folder structures for different aspects
export const businessFolders: FolderItem[] = [
  {
    id: 'admin',
    name: '0. ADMIN',
    type: 'folder',
    color: '#6366F1',
    children: [
      { id: 'admin-docs', name: 'Company Documents', type: 'file', aiContext: 'Legal company registration and bylaws' },
      { id: 'admin-contacts', name: 'Key Contacts', type: 'file', aiContext: 'Important business contacts list' },
    ],
  },
  {
    id: 'legal',
    name: '1. LEGAL',
    type: 'folder',
    color: '#8B5CF6',
    children: [
      { id: 'legal-contracts', name: 'Contracts', type: 'folder', children: [] },
      { id: 'legal-compliance', name: 'Compliance', type: 'folder', children: [] },
    ],
  },
  {
    id: 'finance',
    name: '2. FINANCE',
    type: 'folder',
    color: '#22C55E',
    children: [
      { id: 'finance-budget', name: 'Budget 2026', type: 'file', aiContext: 'Annual budget planning and forecasts' },
      { id: 'finance-invoices', name: 'Invoices', type: 'folder', children: [] },
      { id: 'finance-reports', name: 'Financial Reports', type: 'folder', children: [] },
    ],
  },
  {
    id: 'hr',
    name: '3. HR',
    type: 'folder',
    color: '#F59E0B',
    children: [
      { id: 'hr-team', name: 'Team Directory', type: 'file', aiContext: 'Current team members and roles' },
      { id: 'hr-policies', name: 'Policies', type: 'folder', children: [] },
    ],
  },
  {
    id: 'agents',
    name: '4. AGENTS',
    type: 'folder',
    color: '#EC4899',
    children: [
      { id: 'agent-sales', name: 'Sales Agent', type: 'file', aiContext: 'AI agent for sales automation', starred: true },
      { id: 'agent-support', name: 'Support Agent', type: 'file', aiContext: 'AI agent for customer support' },
      { id: 'agent-research', name: 'Research Agent', type: 'file', aiContext: 'AI agent for market research' },
    ],
  },
  {
    id: 'marketing',
    name: '5. MARKETING',
    type: 'folder',
    color: '#06B6D4',
    children: [
      { id: 'marketing-campaigns', name: 'Campaigns', type: 'folder', children: [] },
      { id: 'marketing-brand', name: 'Brand Assets', type: 'folder', children: [] },
      { id: 'marketing-social', name: 'Social Media', type: 'file', aiContext: 'Social media strategy and content calendar' },
    ],
  },
  {
    id: 'sales',
    name: '6. SALES',
    type: 'folder',
    color: '#EF4444',
    children: [
      { id: 'sales-pipeline', name: 'Pipeline', type: 'file', aiContext: 'Current sales pipeline and opportunities' },
      { id: 'sales-leads', name: 'Leads', type: 'folder', children: [] },
    ],
  },
  {
    id: 'projects',
    name: '7. PROJECT MANAGEMENT',
    type: 'folder',
    color: '#8B5CF6',
    children: [
      { id: 'proj-trading', name: '1. TRADING', type: 'folder', starred: true, children: [] },
      { id: 'proj-simulation', name: '2. SIMULATION APP', type: 'folder', children: [] },
      { id: 'proj-robot', name: '3. ROBOT LEAGUE APP', type: 'folder', children: [] },
      { id: 'proj-saas', name: '4. SAAS APP', type: 'folder', children: [] },
      { id: 'proj-art', name: '5. ART PROJECTS', type: 'folder', children: [] },
      { id: 'proj-memetic', name: '6. MEMETIC ENGINEERING', type: 'folder', children: [] },
      { id: 'proj-youmaxing', name: '7. YOUMAXING', type: 'folder', starred: true, children: [] },
      { id: 'proj-archived', name: '9. ARCHIVED', type: 'folder', children: [] },
    ],
  },
];

// Props
interface FolderBrowserProps {
  folders: FolderItem[];
  aspectColor: string;
  onSelectItem?: (item: FolderItem, path: FolderItem[]) => void;
  onAIQuery?: (context: string) => void;
  compact?: boolean;
  title?: string;
}

export function FolderBrowser({ 
  folders, 
  aspectColor, 
  onSelectItem, 
  onAIQuery,
  compact = false,
  title = 'Files & Folders',
}: FolderBrowserProps) {
  const { theme } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<FolderItem | null>(null);
  const [currentPath, setCurrentPath] = useState<FolderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Select an item
  const handleSelect = (item: FolderItem, path: FolderItem[]) => {
    setSelectedItem(item);
    setCurrentPath(path);
    onSelectItem?.(item, path);
  };

  // Get AI context from selected items
  const getAIContext = () => {
    if (!selectedItem) return '';
    
    let context = `Selected: ${selectedItem.name}\n`;
    if (selectedItem.aiContext) {
      context += `Context: ${selectedItem.aiContext}\n`;
    }
    if (currentPath.length > 0) {
      context += `Path: ${currentPath.map(p => p.name).join(' > ')}\n`;
    }
    return context;
  };

  // Ask AI about selected item
  const askAI = () => {
    const context = getAIContext();
    onAIQuery?.(context);
  };

  // Render a single item
  const renderItem = (item: FolderItem, depth: number = 0, path: FolderItem[] = []) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedItem?.id === item.id;
    const hasChildren = item.type === 'folder' && item.children && item.children.length > 0;
    const itemPath = [...path, item];

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
            }
            handleSelect(item, itemPath);
          }}
          className={cn(
            'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all group',
            isSelected 
              ? 'bg-white/10' 
              : 'hover:bg-white/5',
            compact ? 'text-sm' : 'text-sm'
          )}
          style={{ 
            paddingLeft: `${depth * 16 + 8}px`,
            ...(isSelected ? { backgroundColor: `${aspectColor}20` } : {})
          }}
        >
          {/* Expand/Collapse Icon */}
          {item.type === 'folder' ? (
            hasChildren ? (
              isExpanded ? (
                <ChevronDown className={cn(
                  "h-4 w-4 flex-shrink-0",
                  theme === 'light' ? "text-slate-400" : "text-white/40"
                )} />
              ) : (
                <ChevronRight className={cn(
                  "h-4 w-4 flex-shrink-0",
                  theme === 'light' ? "text-slate-400" : "text-white/40"
                )} />
              )
            ) : (
              <div className="w-4 h-4 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Icon */}
          {item.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen 
                className="h-4 w-4 flex-shrink-0" 
                style={{ color: item.color || aspectColor }} 
              />
            ) : (
              <Folder 
                className="h-4 w-4 flex-shrink-0" 
                style={{ color: item.color || aspectColor }} 
              />
            )
          ) : item.type === 'link' ? (
            <Link2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
          ) : (
            <FileText className={cn(
              "h-4 w-4 flex-shrink-0",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )} />
          )}

          {/* Name */}
          <span className={cn(
            'flex-1 truncate',
            isSelected 
              ? theme === 'light' ? 'text-slate-900 font-medium' : 'text-white font-medium'
              : theme === 'light' ? 'text-slate-700' : 'text-white/80'
          )}>
            {item.name}
          </span>

          {/* Star */}
          {item.starred && (
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
          )}

          {/* AI Context Indicator */}
          {item.aiContext && (
            <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        {/* Children */}
        {item.type === 'folder' && isExpanded && item.children && (
          <div className="overflow-hidden">
            {item.children.map(child => renderItem(child, depth + 1, itemPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', compact ? 'gap-2' : 'gap-3')}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" style={{ color: aspectColor }} />
          <h3 className={cn(
            "font-semibold text-sm",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7",
              theme === 'light' 
                ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                : "text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7",
              theme === 'light' 
                ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                : "text-white/40 hover:text-white hover:bg-white/10"
            )}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 bg-white/5 border-white/10 text-sm text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Breadcrumb */}
      {currentPath.length > 0 && (
        <div className="flex items-center gap-1 px-2 text-xs text-white/50 overflow-x-auto">
          <button 
            onClick={() => {
              setSelectedItem(null);
              setCurrentPath([]);
            }}
            className="hover:text-white/80 flex-shrink-0"
          >
            <Home className="h-3 w-3" />
          </button>
          {currentPath.map((item, i) => (
            <div key={item.id} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="h-3 w-3" />
              <span className={i === currentPath.length - 1 ? 'text-white/80' : ''}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1">
        {folders.map(folder => renderItem(folder))}
      </div>

      {/* Selected Item Actions */}
      {selectedItem && (
        <div className="px-2 py-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 truncate">Selected: {selectedItem.name}</p>
              {selectedItem.aiContext && (
                <p className="text-xs text-violet-400/70 truncate mt-0.5">
                  AI Context: {selectedItem.aiContext}
                </p>
              )}
            </div>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              style={{ 
                background: `linear-gradient(135deg, ${aspectColor}, ${aspectColor}80)` 
              }}
              onClick={askAI}
            >
              <Sparkles className="h-3 w-3" />
              Ask AI
            </Button>
          </div>
        </div>
      )}

      {/* Google Drive Link */}
      <div className="px-2 pb-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.71 3.5L1.15 15l4.58 8h13.54l4.58-8L17.29 3.5H7.71zm-.42 1h4.2l-6.05 12H1.73L7.29 4.5zm4.91 0h4.21l5.56 12h-4.21L12.2 4.5zm5.09 1.3l4.97 10.2h-3.9l-5.56-12h3.42l1.07 1.8zM6.29 17.5H18.5l-3.79 6H10.08l-3.79-6z"/>
          </svg>
          Connect Google Drive
        </Button>
      </div>
    </div>
  );
}



