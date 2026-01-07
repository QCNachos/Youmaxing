# Calendar System - Complete Guide 📅

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Natural Language Chat](#natural-language-chat)
5. [User Interface](#user-interface)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Usage Examples](#usage-examples)
9. [Migration Guide](#migration-guide)
10. [Troubleshooting](#troubleshooting)
11. [Event Terminology](#event-terminology)

---

## Overview

The YOUMAXING calendar system is a comprehensive time management and goal tracking solution that integrates:
- **Daily Tasks** - Actionable todo items with completion tracking
- **Weekly Objectives** - Mid-term goals with progress tracking
- **Monthly Goals** - Long-term objectives with milestones
- **Calendar Events** - Time-based scheduling with reminders
- **Natural Language Interface** - Chat-based CRUD operations
- **Full Database Integration** - Persistent storage via Supabase

---

## Features

### ✅ Core Functionality

#### Daily Tasks
- Create, edit, delete, and complete tasks
- Set priority levels (low, medium, high)
- Estimate duration in minutes
- Categorize by life aspect (Training, Food, Finance, etc.)
- Distinguish between Personal and Job tasks
- Real-time status updates

#### Weekly Objectives
- Set weekly goals with progress tracking
- Track completion percentage (0-100%)
- Link to life aspects
- Priority management
- Week-based organization

#### Monthly Goals
- Long-term goal setting
- Progress tracking with milestones
- Monthly organization
- Priority-based sorting

#### Calendar Events
- Schedule time-specific events
- Set date and time
- Categorize by aspect
- Link related tasks and objectives

### 🎨 User Experience

#### Sidebar View
- Compact calendar widget
- Quick task creation
- Event overview
- Objective tracking
- Tab-based navigation (Events, Tasks, Objectives)

#### Expanded View
- Large modal dialog (max-w-4xl)
- Full CRUD operations
- Inline editing and deletion
- Stats dashboard showing:
  - Task completion rate
  - Weekly progress average
  - Monthly progress average
- Hover actions for quick management
- Empty states with helpful prompts

### 🤖 Natural Language Interface

Chat with the AI to manage your calendar:

```
"Add a workout task for tomorrow"
"Show my tasks for today"
"Create weekly objective to read 3 books"
"Schedule a meeting tomorrow at 2pm"
"List my monthly goals"
```

15 different operations supported via natural language!

### 🎯 Smart Features

#### Job vs Personal Distinction
- **Job/Work items**: No aspect/category needed (auto-assigned to business)
- **Personal items**: Choose from life aspects (Training, Food, Finance, etc.)
- Visual badges distinguish type:
  - Job: Blue gradient with briefcase icon 💼
  - Personal: Purple gradient with user icon + colored aspect badge

#### Priority System
- High: Red (urgent, important tasks)
- Medium: Yellow (standard priority)
- Low: Green (when you have time)

#### Progress Tracking
- Task completion checkboxes
- Objective progress bars
- Goal completion percentages
- Visual progress indicators

---

## Architecture

### File Structure

```
src/
├── components/
│   ├── CalendarSidebar.tsx                    # Wrapper component
│   ├── CalendarSidebarEnhanced.tsx           # Main sidebar implementation
│   ├── ExpandedObjectivesDialogEnhanced.tsx  # Large expanded view
│   └── CalendarDashboard.tsx                 # Dashboard integration
├── hooks/
│   ├── useTasksAndObjectives.ts              # Data management hook
│   ├── useCalendarChat.ts                    # Natural language processing
│   └── useAuth.ts                            # Authentication
├── lib/
│   ├── db/
│   │   └── tasks.ts                          # Database service layer
│   ├── calendar-tools.ts                     # Tool definitions for LLM
│   └── aspects.ts                            # Life aspect configuration
└── types/
    └── database.ts                           # TypeScript type definitions

supabase/migrations/
└── 00013_fix_life_aspects.sql               # Critical aspect ID migration
```

### Component Hierarchy

```
App Layout
└── CalendarSidebar (wrapper)
    └── CalendarSidebarEnhanced
        ├── Calendar Widget
        ├── Tabs (Events, Tasks, Objectives)
        ├── Add Dialogs (Event, Task, Weekly, Monthly)
        └── Expand Button → ExpandedObjectivesDialogEnhanced
            ├── Stats Header
            ├── Tabs (Daily, Weekly, Monthly)
            ├── Item Lists with CRUD
            └── Form Dialogs
```

### Data Flow

```
User Action → Component → Hook (useTasksAndObjectives) → Service (tasks.ts) → Supabase → Database

Natural Language → GlobalChat → useCalendarChat → calendar-tools → executeCalendarTool → Service → Database
```

---

## Natural Language Chat

### How It Works

1. **Intent Detection**: Message analyzed for calendar keywords
2. **Pattern Matching**: Extracts action, entity type, and parameters
3. **Tool Execution**: Calls appropriate database operation
4. **Response Formatting**: Returns friendly, formatted response

### Supported Commands

#### Daily Tasks
```
✅ Create: "Add a workout task for tomorrow"
✅ List: "Show my tasks for today"
✅ Complete: "Mark task as done"
✅ Delete: "Remove my gym task"
```

#### Weekly Objectives
```
✅ Create: "Create weekly objective to read 3 books"
✅ List: "Show my weekly objectives"
✅ Update: "Update weekly progress to 60%"
✅ Delete: "Delete weekly objective"
```

#### Monthly Goals
```
✅ Create: "Add monthly goal to save $1000"
✅ List: "List my monthly goals"
✅ Update: "Set goal progress to 75%"
✅ Delete: "Remove monthly goal"
```

#### Calendar Events
```
✅ Create: "Schedule meeting tomorrow at 2pm"
✅ List: "Show my events for today"
```

### Smart Parsing

The system automatically detects:

**Dates:**
- "today" → Current date
- "tomorrow" → +1 day
- "Friday" → Next Friday
- "January 15" → 2024-01-15
- "2024-01-15" → Exact date

**Times:**
- "7am" → 07:00
- "2:30pm" → 14:30
- "14:30" → 14:30

**Aspects (from keywords):**
- "gym", "workout" → training
- "dinner", "hangout" → friends
- "budget", "invest" → finance
- "meeting", "work" → business

**Priorities:**
- "urgent", "important" → high
- "low priority" → low

**Type:**
- "work", "job" → job type
- Default → personal type

### Tool Definitions

15 tools available for LLM function calling:

1. `create_task`
2. `list_tasks`
3. `update_task`
4. `complete_task`
5. `delete_task`
6. `create_weekly_objective`
7. `list_weekly_objectives`
8. `update_weekly_objective`
9. `delete_weekly_objective`
10. `create_monthly_goal`
11. `list_monthly_goals`
12. `update_monthly_goal`
13. `delete_monthly_goal`
14. `create_calendar_event`
15. `list_calendar_events`

Each tool has a complete OpenAPI-compatible schema for function calling with OpenAI, Anthropic, or other LLM providers.

---

## User Interface

### Sidebar Calendar

**Location**: Right side of dashboard
**Size**: Compact, always visible
**Features**:
- Month/year navigation
- Date selection
- Mini calendar grid
- Tab navigation (Events, Tasks, Objectives)

#### Events Tab
- List of scheduled events for selected date
- Time display
- Aspect badges
- "Add Event" button
- Click event → Navigate to aspect

#### Tasks Tab
- Daily tasks list
- Completion checkboxes
- Priority indicators
- Duration estimates
- Type badges (Job/Personal)
- Aspect badges (Personal only)
- Progress bar showing completion %
- "Add Task" button

#### Objectives Tab
- Weekly objectives section
- Monthly goals section
- Progress bars for each
- "Add" buttons for each type
- "View All" expand button

### Expanded View

**Trigger**: Click expand button in objectives tab
**Size**: max-w-4xl modal
**Height**: max-h-[85vh] scrollable

**Features**:
- Stats header showing:
  - X/Y Tasks completed
  - Weekly progress average
  - Monthly progress average
- Tab navigation (Daily, Weekly, Monthly)
- Full CRUD operations inline
- Hover actions (edit, delete)
- Progress bars
- Empty states with prompts
- Form dialogs for add/edit

**Benefits over sidebar**:
- More space for many items
- Easier management
- Better overview
- Inline actions
- Professional appearance

---

## Database Schema

### Tables

#### `daily_tasks`
```sql
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  aspect_id TEXT REFERENCES life_aspects(id) NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `weekly_objectives`
```sql
CREATE TABLE weekly_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  week_start_date DATE NOT NULL,
  aspect_id TEXT REFERENCES life_aspects(id) NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `monthly_objectives`
```sql
CREATE TABLE monthly_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  month_start_date DATE NOT NULL,
  aspect_id TEXT REFERENCES life_aspects(id) NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `calendar_events`
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  aspect TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'personal',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `life_aspects`
```sql
CREATE TABLE life_aspects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data (after migration 00013)
INSERT INTO life_aspects (id, name, color) VALUES
  ('training', 'Training', '#FF6B6B'),
  ('food', 'Food & Nutrition', '#4ECDC4'),
  ('finance', 'Finance', '#45B7D1'),
  ('business', 'Business & Career', '#96CEB4'),
  ('friends', 'Friends & Social', '#FFEAA7'),
  ('sleep', 'Sleep & Recovery', '#DFE6E9');
```

### Relationships

```
user (auth.users)
  ├── daily_tasks (1:many)
  ├── weekly_objectives (1:many)
  ├── monthly_objectives (1:many)
  └── calendar_events (1:many)

life_aspects
  ├── daily_tasks.aspect_id (1:many)
  ├── weekly_objectives.aspect_id (1:many)
  └── monthly_objectives.aspect_id (1:many)
```

---

## API Reference

### Database Service Functions (`src/lib/db/tasks.ts`)

#### Daily Tasks

```typescript
// Fetch tasks for a date
async function fetchDailyTasks(date: Date): Promise<DailyTask[]>

// Create task
async function createDailyTask(data: {
  title: string;
  date: Date;
  description?: string;
  aspect_id: AspectType;
  type: 'personal' | 'job';
  priority?: 'low' | 'medium' | 'high';
  estimated_duration_minutes?: number;
}): Promise<DailyTask>

// Update task
async function updateDailyTask(
  id: string,
  updates: Partial<DailyTask>
): Promise<void>

// Delete task
async function deleteDailyTask(id: string): Promise<void>
```

#### Weekly Objectives

```typescript
async function fetchWeeklyObjectives(date: Date): Promise<WeeklyObjective[]>
async function createWeeklyObjective(data: CreateWeeklyObjective): Promise<WeeklyObjective>
async function updateWeeklyObjective(id: string, updates: Partial<WeeklyObjective>): Promise<void>
async function deleteWeeklyObjective(id: string): Promise<void>
```

#### Monthly Goals

```typescript
async function fetchMonthlyObjectives(date: Date): Promise<MonthlyObjective[]>
async function createMonthlyObjective(data: CreateMonthlyObjective): Promise<MonthlyObjective>
async function updateMonthlyObjective(id: string, updates: Partial<MonthlyObjective>): Promise<void>
async function deleteMonthlyObjective(id: string): Promise<void>
```

### Calendar Tools (`src/lib/calendar-tools.ts`)

```typescript
// Execute a tool by name
async function executeCalendarTool(
  toolName: string,
  parameters: Record<string, any>
): Promise<ToolResult>

// Format response for chat
function formatToolResponse(result: ToolResult): string

// Get system prompt for LLM
function getCalendarSystemPrompt(): string

// Tool definitions for function calling
const CALENDAR_TOOLS: readonly ToolDefinition[]
```

### Hooks

#### useTasksAndObjectives

```typescript
const {
  // Data
  tasks,
  weeklyObjectives,
  monthlyObjectives,
  loading,
  error,
  
  // Task operations
  addTask,
  editTask,
  removeTask,
  toggleTask,
  
  // Weekly operations
  addWeeklyObjective,
  editWeeklyObjective,
  removeWeeklyObjective,
  
  // Monthly operations
  addMonthlyObjective,
  editMonthlyObjective,
  removeMonthlyObjective,
  
  // Refresh data
  refresh,
} = useTasksAndObjectives(selectedDate);
```

#### useCalendarChat

```typescript
const {
  // Process natural language
  processMessage,
  
  // Execute specific tool
  executeTool,
  
  // State
  processing,
  error,
  
  // Available tools
  tools,
} = useCalendarChat();
```

---

## Usage Examples

### Creating a Task (UI)

```typescript
import { useTasksAndObjectives } from '@/hooks/useTasksAndObjectives';

function MyComponent() {
  const { addTask } = useTasksAndObjectives(new Date());
  
  const handleCreateTask = async () => {
    await addTask({
      title: 'Morning workout',
      description: 'Cardio and weights',
      aspect_id: 'training',
      type: 'personal',
      priority: 'high',
      estimated_duration_minutes: 60
    });
  };
  
  return <button onClick={handleCreateTask}>Add Task</button>;
}
```

### Using Natural Language (Chat)

```typescript
import { useCalendarChat } from '@/hooks/useCalendarChat';

function ChatComponent() {
  const { processMessage } = useCalendarChat();
  
  const handleMessage = async (message: string) => {
    const { response } = await processMessage(
      "Add a workout task for tomorrow"
    );
    console.log(response);
    // "✅ Task created: 'workout' for January 7, 2024"
  };
}
```

### Direct Tool Execution

```typescript
import { executeCalendarTool } from '@/lib/calendar-tools';

const result = await executeCalendarTool('create_task', {
  title: 'Review PRs',
  date: '2024-01-07',
  type: 'job',
  priority: 'high'
});

console.log(result.message);
// "✅ Task created: 'Review PRs' for January 7, 2024"
```

---

## Migration Guide

### Critical Migration: 00013_fix_life_aspects.sql

**Problem**: Database had wrong aspect IDs (health, nutrition) vs frontend (training, food)

**Solution**: Run migration to update life_aspects table

#### Step 1: Backup (Optional but Recommended)

```bash
# Via Supabase CLI
supabase db dump -f backup.sql
```

#### Step 2: Run Migration

**Option A: Supabase CLI**
```bash
cd /Users/antoine/2. CODING/Youmaxing
supabase migration up
```

**Option B: Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase/migrations/00013_fix_life_aspects.sql`
3. Paste and run

#### Migration Contents

```sql
-- 1. Delete existing data (due to foreign keys)
DELETE FROM daily_tasks;
DELETE FROM weekly_objectives;
DELETE FROM monthly_objectives;
DELETE FROM template_events;

-- 2. Delete old aspects
DELETE FROM life_aspects;

-- 3. Insert correct aspects
INSERT INTO life_aspects (id, name, color) VALUES
  ('training', 'Training & Fitness', '#FF6B6B'),
  ('food', 'Food & Nutrition', '#4ECDC4'),
  ('finance', 'Finance & Money', '#45B7D1'),
  ('business', 'Business & Career', '#96CEB4'),
  ('friends', 'Friends & Social', '#FFEAA7'),
  ('sleep', 'Sleep & Recovery', '#DFE6E9');
```

**Note**: This deletes existing tasks/objectives. Save important data first if needed!

#### Step 3: Verify

```sql
SELECT * FROM life_aspects;
-- Should show: training, food, finance, business, friends, sleep
```

---

## Troubleshooting

### Common Issues

#### 1. "Failed to create task" (409 Conflict)

**Cause**: Aspect ID mismatch between frontend and database

**Fix**: Run migration `00013_fix_life_aspects.sql`

```bash
supabase migration up
```

#### 2. "Add Event" button missing

**Cause**: Browser cache

**Fix**: Hard refresh
- Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

#### 3. Dialog accessibility warning

**Issue**: `Warning: Missing Description for DialogContent`

**Status**: ✅ Fixed in latest version (all dialogs have DialogDescription)

#### 4. Aspect not showing for Job items

**Status**: ✅ This is correct behavior! Job items don't need aspects

**Explanation**: Work tasks auto-assign to 'business' aspect internally

#### 5. Can't see calendar changes

**Causes**:
1. Not refreshing after operations
2. Date mismatch
3. Filter applied

**Fixes**:
1. Check `useTasksAndObjectives` is properly subscribed to date changes
2. Verify selected date matches task date
3. Check if aspect filter is active

#### 6. Migration foreign key error

**Error**: `violates foreign key constraint "template_events_aspect_id_fkey"`

**Fix**: Updated migration now deletes `template_events` first

**Solution**: Use latest version of `00013_fix_life_aspects.sql`

---

## Event Terminology

### Two Types of "Events"

#### 1. Calendar Events (Scheduling)
**Location**: Calendar sidebar → Events tab
**Purpose**: Time management and scheduling

**Examples**:
- "Gym Session at 7:00 AM"
- "Team Meeting at 2:00 PM"
- "Doctor appointment"

**Features**:
- Time-specific
- Date-specific
- Has aspect/category
- Priority level

#### 2. Social Events (Mini-App / Entertainment)
**Location**: Mini-Apps section
**Purpose**: Social activities and entertainment

**Examples**:
- 🎬 Cinema - "Dune 2"
- 🎵 Concert - "Taylor Swift"
- 🎭 Theater shows
- 🎫 Sports events

**Features**:
- Venue/location
- Ticket info
- Friend list
- Photos/memories

### How They Work Together

**Best Practice**: Use BOTH for special occasions

1. **Mini-App Event**: Track experience, tickets, friends, costs
2. **Calendar Event**: Schedule time, set reminders

**Example**:
```
Mini-App: "Coldplay Concert"
├─ Venue: "Madison Square Garden"
├─ Ticket: $150
└─ Friends: Sarah, Mike

+

Calendar: "Concert with Sarah & Mike"
├─ Time: 8:00 PM
├─ Aspect: Friends
└─ Priority: High
```

---

## Best Practices

### Task Management

1. **Use descriptive titles**: "Review PRs for feature-auth" not "Review code"
2. **Set realistic durations**: Help with time management
3. **Update progress**: Keep objectives current
4. **Prioritize ruthlessly**: Not everything is high priority
5. **Use aspects consistently**: Helps with insights and analytics

### Goal Setting

1. **SMART goals**: Specific, Measurable, Achievable, Relevant, Time-bound
2. **Break down**: Large goals → Weekly objectives → Daily tasks
3. **Track progress**: Update percentages regularly
4. **Review weekly**: Are you on track?
5. **Celebrate wins**: Mark completed goals!

### Natural Language Tips

1. **Be specific**: "Add gym task tomorrow" not "add task"
2. **Include context**: "High priority work meeting Friday 2pm"
3. **Use keywords**: "Add", "Show", "Create", "List", "Update"
4. **Natural phrasing**: Talk like you would to a person
5. **Check results**: Verify the AI understood correctly

---

## Future Enhancements

### Planned Features

#### Short Term
- [ ] Recurring tasks (daily, weekly, monthly)
- [ ] Task dependencies ("Complete X before Y")
- [ ] Reminders and notifications
- [ ] Drag & drop rescheduling
- [ ] Bulk operations via chat

#### Medium Term
- [ ] AI task suggestions based on patterns
- [ ] Analytics dashboard (productivity insights)
- [ ] Time tracking (start/stop timers)
- [ ] Templates (morning routine, workout plan, etc.)
- [ ] Integration with external calendars (Google, Outlook)

#### Long Term
- [ ] Smart scheduling ("Find best time for this")
- [ ] Habit tracking and streaks
- [ ] Achievement system and badges
- [ ] Team collaboration features
- [ ] Advanced AI coaching and insights

---

## Contributing

### Adding New Features

1. **Database**: Add migration in `supabase/migrations/`
2. **Types**: Update `src/types/database.ts`
3. **Service**: Add functions to `src/lib/db/tasks.ts`
4. **Hook**: Update `useTasksAndObjectives` if needed
5. **UI**: Add to `CalendarSidebarEnhanced` and `ExpandedObjectivesDialogEnhanced`
6. **Tools**: Add tool definition to `calendar-tools.ts` for chat support
7. **Docs**: Update this guide!

### Code Style

- Use TypeScript for type safety
- Follow existing patterns
- Add JSDoc comments
- Handle errors gracefully
- Include loading states
- Test edge cases

---

## Summary

The YOUMAXING calendar system provides:

✅ Complete task and goal management
✅ Beautiful, intuitive UI
✅ Full database integration
✅ Natural language interface
✅ Smart type handling (Job vs Personal)
✅ Progress tracking and analytics
✅ Consistent experience across views
✅ Production-ready architecture
✅ Extensible design

**Start using it now!** Open your app, create a task, and maximize your potential! 🚀

---

*Last updated: January 2024*
*Version: 2.0*
*Author: YOUMAXING Team*

