# Calendar Enhancement - Tasks & Objectives System

## Overview
Enhanced the calendar/calendar sidebar system to support **Daily Tasks**, **Weekly Objectives**, and **Monthly Objectives** with full database integration and consistent UI across all views.

## What Was Added

### 1. Database Integration (`src/lib/db/tasks.ts`)
Complete CRUD operations for:
- **Daily Tasks**: Tasks assigned to specific dates with status tracking (pending, in_progress, completed)
- **Weekly Objectives**: Week-long goals with progress tracking (0-100%)
- **Monthly Objectives**: Month-long goals with progress tracking (0-100%)

Features:
- Full Create, Read, Update, Delete operations
- Status toggling for tasks
- Date range queries
- Helper functions for date formatting

### 2. React Hook (`src/hooks/useTasksAndObjectives.ts`)
Custom hook that provides:
- Automatic data fetching based on selected date
- Real-time state management
- Error handling and loading states
- All CRUD operations for tasks and objectives
- Optimistic updates

### 3. Authentication Hook (`src/hooks/useAuth.ts`)
Simple authentication hook for getting current user:
- Session management
- Auth state changes listener
- Loading states

### 4. Enhanced Calendar Sidebar (`src/components/CalendarSidebarEnhanced.tsx`)
Completely rewritten sidebar with:

#### Features:
- **Three Tabs**: Events, Tasks, and Objectives
- **Personal/Job Filtering**: Filter all items by type
- **Full CRUD for Tasks**:
  - Add new tasks with form (title, description, aspect, type, priority, duration)
  - Edit existing tasks
  - Delete tasks with confirmation
  - Toggle task completion status with visual feedback
  - Real-time progress tracking
  
- **Full CRUD for Weekly Objectives**:
  - Add new weekly objectives
  - Edit existing objectives
  - Delete objectives with confirmation
  - Track progress percentage (0-100%)
  - Visual progress bars
  
- **Full CRUD for Monthly Objectives**:
  - Add new monthly objectives
  - Edit existing objectives
  - Delete objectives with confirmation
  - Track progress percentage (0-100%)
  - Visual progress bars

#### UI/UX Improvements:
- **Better Visual Hierarchy**: Clear separation between different types of items
- **Hover Actions**: Edit and delete buttons appear on hover
- **Loading States**: Spinner when fetching data
- **Error Handling**: Clear error messages displayed to users
- **Empty States**: Helpful prompts when no items exist
- **Scroll Areas**: Proper scrolling for large lists
- **Progress Indicators**: Visual progress bars and percentages
- **Priority Badges**: Color-coded priority indicators (low/medium/high)
- **Aspect Badges**: Color-coded aspect tags
- **Quick Stats**: Real-time stats footer showing events, completed tasks, and progress
- **Responsive Dialogs**: Clean, modal dialogs for adding/editing items

### 5. Database Types (`src/types/database.ts`)
Added TypeScript types for:
- `daily_tasks` table
- `weekly_objectives` table
- `monthly_objectives` table

All with proper Row, Insert, and Update types for type-safe database operations.

## Database Schema (Already Exists)

The following tables already exist in your Supabase database:

### daily_tasks
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- weekly_objective_id (uuid, nullable)
- title (text)
- description (text, nullable)
- aspect_id (text, foreign key to life_aspects)
- type ('personal' | 'job')
- target_date (date)
- status ('pending' | 'in_progress' | 'completed' | 'cancelled')
- priority ('low' | 'medium' | 'high')
- estimated_duration_minutes (integer, nullable)
- actual_duration_minutes (integer, nullable)
- completed_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### weekly_objectives
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- monthly_objective_id (uuid, nullable)
- title (text)
- description (text, nullable)
- aspect_id (text, foreign key to life_aspects)
- type ('personal' | 'job')
- target_week_start (date)
- status ('active' | 'completed' | 'cancelled')
- priority ('low' | 'medium' | 'high')
- progress_percentage (numeric, 0-100)
- completed_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### monthly_objectives
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- title (text)
- description (text, nullable)
- aspect_id (text, foreign key to life_aspects)
- type ('personal' | 'job')
- target_month (date)
- status ('active' | 'completed' | 'cancelled')
- priority ('low' | 'medium' | 'high')
- progress_percentage (numeric, 0-100)
- completed_at (timestamptz, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## How to Use

### In the Calendar Sidebar:

1. **Switch Tabs**: Click on Events, Tasks, or Goals tabs
2. **Filter by Type**: Use the Personal/Job/Both filter at the top
3. **Add Items**: Click the "+" buttons or "Add" buttons in each section
4. **Edit Items**: Hover over an item and click the edit icon
5. **Delete Items**: Hover over an item and click the trash icon
6. **Complete Tasks**: Click the checkmark circle to toggle task completion
7. **Update Progress**: Edit objectives to update their progress percentage

### Calendar Views:
- **Sidebar**: Always visible, shows data for selected date
- **Expanded Calendar View**: Click expand buttons for detailed views

## Next Steps (TODO)

### High Priority:
1. **Update Expanded Calendar View** in `src/app/(dashboard)/layout.tsx`:
   - Replace mock objectives with real database data
   - Add same CRUD functionality to expanded dialogs
   - Make expanded task/objectives dialogs fully functional
   
2. **Add Calendar Events to Database**:
   - Create database service for calendar_events table
   - Integrate with existing events system
   - Replace manual events state with database persistence

3. **Link Tasks/Objectives**:
   - Allow linking daily tasks to weekly objectives
   - Allow linking weekly objectives to monthly objectives
   - Show hierarchical relationships in UI

### Medium Priority:
4. **Recurring Tasks**:
   - Add support for recurring daily tasks
   - Template system for common tasks
   
5. **Task Time Tracking**:
   - Start/stop timer for tasks
   - Track actual duration vs estimated
   - Analytics on time usage

6. **Smart Suggestions**:
   - AI-powered task suggestions based on objectives
   - Auto-break down objectives into tasks
   - Priority recommendations

7. **Progress Tracking**:
   - Automatic progress calculation based on completed sub-tasks
   - Visual progress charts
   - Trend analysis

### Low Priority:
8. **Drag & Drop**:
   - Reorder tasks by priority
   - Drag tasks between days
   - Drag tasks into objectives

9. **Notifications**:
   - Task reminders
   - Objective deadline alerts
   - Achievement celebrations

10. **Sharing**:
    - Share objectives with friends
    - Collaborative tasks
    - Public accountability features

## Testing

To test the new features:
1. Open the calendar sidebar
2. Try adding a daily task
3. Try toggling its completion status
4. Try editing and deleting tasks
5. Switch to the Goals tab
6. Add monthly and weekly objectives
7. Update their progress percentages
8. Test the Personal/Job filters

## Technical Details

### State Management:
- Uses React hooks for local state
- Database as source of truth
- Optimistic updates for better UX

### Error Handling:
- Try-catch blocks in all async operations
- User-friendly error messages
- Console logging for debugging

### Performance:
- Memoized computations
- Efficient queries with date ranges
- Debounced updates (can be added)

### Type Safety:
- Full TypeScript coverage
- Database types auto-generated from schema
- Strict null checks

## Files Created/Modified

### Created:
- `src/lib/db/tasks.ts` - Database service layer
- `src/hooks/useTasksAndObjectives.ts` - React hook for tasks/objectives
- `src/hooks/useAuth.ts` - Authentication hook
- `src/components/CalendarSidebarEnhanced.tsx` - Enhanced sidebar component

### Modified:
- `src/components/CalendarSidebar.tsx` - Now delegates to enhanced version
- `src/types/database.ts` - Added daily_tasks, weekly_objectives, monthly_objectives types

### To Be Modified:
- `src/app/(dashboard)/layout.tsx` - Needs expanded calendar view update
- Any components using the old calendar system

## Architecture

```
User Interaction
      ↓
CalendarSidebarEnhanced (UI Component)
      ↓
useTasksAndObjectives (React Hook)
      ↓
src/lib/db/tasks.ts (Database Layer)
      ↓
Supabase Database
```

## Benefits

1. **Better Organization**: Clear separation of tasks by timeframe
2. **Goal Alignment**: Link daily tasks to bigger objectives
3. **Progress Visibility**: See progress at multiple levels
4. **Flexibility**: Personal vs Job separation
5. **Database Persistence**: All data saved and synced
6. **Type Safety**: Full TypeScript support
7. **Scalability**: Easy to add more features
8. **User Experience**: Intuitive UI with modern interactions

