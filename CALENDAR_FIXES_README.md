# Calendar System Fixes - Implementation Guide

## 🔧 Issues Fixed

1. ✅ **Database aspect mismatch** - Frontend and database now use same aspect IDs
2. ✅ **Failed to create tasks/objectives** - Fixed foreign key constraints
3. ✅ **Clarified Events terminology** - Renamed for clarity
4. ✅ **Tab order** - Reordered to Daily, Weekly, Monthly  
5. ✅ **Expanded view integration** - New component with database support
6. ✅ **Settings aspect excluded** - Not a valid life aspect for tasks

## 🚀 Required Steps

### Step 1: Run the Database Migration

**IMPORTANT:** You need to run this migration to fix the aspect IDs mismatch.

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/00013_fix_life_aspects.sql
```

**Or using Supabase CLI:**
```bash
cd /Users/antoine/2. CODING/Youmaxing
supabase db push
```

**What this migration does:**
- Clears old aspect IDs (health, nutrition, career, etc.)
- Inserts correct aspect IDs matching frontend (training, food, sports, films, finance, business, travel, family, friends, events)
- Note: This will clear any existing tasks/objectives since they reference invalid aspect IDs

### Step 2: Verify the Migration

After running the migration, verify in Supabase:

```sql
-- Check life_aspects table
SELECT * FROM life_aspects ORDER BY display_order;

-- Should show:
-- training, food, sports, films, finance, business, travel, family, friends, events
```

### Step 3: Update Your Layout (Optional but Recommended)

To use the new enhanced expanded objectives dialog in your dashboard layout:

**In `/Users/antoine/2. CODING/Youmaxing/src/app/(dashboard)/layout.tsx`:**

1. **Add the import at the top:**
```typescript
import { ExpandedObjectivesDialog } from '@/components/ExpandedObjectivesDialog';
```

2. **Replace the existing expanded objectives dialog** (around line 559-618) with:
```typescript
<ExpandedObjectivesDialog
  open={objectivesExpanded}
  onOpenChange={setObjectivesExpanded}
  selectedDate={selectedDate}
/>
```

3. **You can remove** the `mockObjectives` constant (around line 106-121) as it's no longer needed.

## 📊 What's Changed

### Life Aspects (Database)

**OLD (incorrect):**
- health, nutrition, finance, career, relationships, family, learning, entertainment, travel, lifestyle

**NEW (correct - matches frontend):**
- training, food, sports, films, finance, business, travel, family, friends, events

### Events Terminology Clarification

- **"Events" mini-app** = Social/Entertainment events (concerts, cinema, going out, parties)
- **"Calendar events"** = Scheduled items in your calendar (can be linked to any aspect)

The "Events" aspect in tasks/objectives refers to social/entertainment events that you plan through the Events mini-app.

### Component Updates

1. **CalendarSidebarEnhanced** (already in use via CalendarSidebar)
   - Excludes 'settings' from aspect dropdown  
   - Defaults to 'training' aspect
   - Uses `validAspects` filter

2. **ExpandedObjectivesDialog** (new component)
   - Reordered tabs: Daily → Weekly → Monthly
   - Full database integration
   - Delete functionality for all items
   - Toggle task completion
   - Shows aspect badges and priority indicators
   - Scrollable lists
   - Empty states with helpful messages

## 🧪 Testing Checklist

### Test in Sidebar:

- [ ] Click on a date in the calendar
- [ ] Go to Tasks tab
- [ ] Click "+ Add Task"
- [ ] Fill out form (should not show "settings" in aspect dropdown)
- [ ] Click "Add" - should succeed without error
- [ ] Task should appear in the list
- [ ] Click checkmark to toggle completion
- [ ] Hover and click edit icon
- [ ] Hover and click delete icon

### Test Weekly Objectives:

- [ ] Go to Goals tab
- [ ] Click "+ Add" under Weekly Objectives
- [ ] Fill out form
- [ ] Click "Add" - should succeed
- [ ] Objective should appear with progress bar
- [ ] Hover and delete

### Test Monthly Objectives:

- [ ] In Goals tab
- [ ] Click "+ Add" under Monthly Goals
- [ ] Fill out form  
- [ ] Click "Add" - should succeed
- [ ] Objective should appear with progress bar
- [ ] Hover and delete

### Test Expanded View (if you updated the layout):

- [ ] Click expand button on objectives sidebar card
- [ ] Dialog opens with tabs
- [ ] First tab is "Daily Tasks" (not monthly)
- [ ] All your tasks/objectives appear
- [ ] Can delete items
- [ ] Can toggle task completion
- [ ] Shows proper aspect colors and badges

## 🎯 Expected Behavior After Fixes

### Adding Tasks:
```
✅ Select any aspect except Settings
✅ Choose Personal or Job
✅ Set priority (low/medium/high)
✅ Add time estimate
✅ Save successfully to database
✅ Appears in task list immediately
```

### Adding Weekly Objectives:
```
✅ Select any aspect except Settings
✅ Set progress percentage (0-100)
✅ Save successfully to database
✅ Appears with progress bar
✅ Can update progress by editing
```

### Adding Monthly Objectives:
```
✅ Same as weekly objectives
✅ Associated with the current month
✅ Unique per month/aspect/type
```

## ⚠️ Important Notes

### Unique Constraints:

The database has unique constraints:
- **Monthly**: One objective per `(user, month, aspect, type)`
- **Weekly**: One objective per `(user, week_start, aspect, type)`

This means you can only have ONE monthly business/personal objective per month per aspect. If you try to create a duplicate, you'll get an error.

**Solution**: Either:
1. Edit the existing objective instead of creating a new one
2. Choose a different aspect
3. Change the type (Personal vs Job)

### Valid Aspects for Tasks/Objectives:

- training ✅
- food ✅
- sports ✅
- films ✅
- finance ✅
- business ✅
- travel ✅
- family ✅
- friends ✅
- events ✅
- settings ❌ (UI only, not a life aspect)

### Migration Safety:

The migration will:
- ✅ Clear existing daily_tasks, weekly_objectives, monthly_objectives
- ✅ Not affect other tables (calendar_events, training_logs, etc.)
- ✅ Preserve calendar_events (they have separate aspect field)

If you have important test data, back it up first:
```sql
-- Backup (run before migration)
CREATE TABLE daily_tasks_backup AS SELECT * FROM daily_tasks;
CREATE TABLE weekly_objectives_backup AS SELECT * FROM weekly_objectives;
CREATE TABLE monthly_objectives_backup AS SELECT * FROM monthly_objectives;
```

## 📝 Summary of Files Created/Modified

### Created:
- `supabase/migrations/00013_fix_life_aspects.sql` - Fixes aspect IDs
- `src/components/ExpandedObjectivesDialog.tsx` - New enhanced dialog

### Modified:
- `src/components/CalendarSidebarEnhanced.tsx` - Fixed aspect dropdown
- `src/components/CalendarSidebar.tsx` - Uses enhanced version

### To Modify (Optional):
- `src/app/(dashboard)/layout.tsx` - Replace expanded dialog

## 🎉 After Setup

Once you've run the migration and tested:

1. ✅ You can create daily tasks
2. ✅ You can create weekly objectives
3. ✅ You can create monthly objectives
4. ✅ Everything persists to database
5. ✅ Proper error handling
6. ✅ Clean, intuitive UI
7. ✅ Consistent across sidebar and expanded views

## 🤝 Need Help?

If you encounter any issues:

1. **Check Supabase logs** for database errors
2. **Check browser console** for frontend errors
3. **Verify migration ran** by checking life_aspects table
4. **Ensure you're logged in** - tasks require authentication
5. **Check RLS policies** - might need to add policies for new tables

Common issues:
- "Foreign key violation" = Migration not run yet
- "User not authenticated" = Need to log in
- "Unique constraint violation" = Duplicate objective for same month/aspect/type

## 📚 Next Steps

After everything works:

1. Consider adding **RLS policies** for security:
```sql
-- Example RLS policy for daily_tasks
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON daily_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON daily_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Similar for weekly_objectives and monthly_objectives
```

2. Add **calendar events** database integration (not yet implemented)
3. Implement **task linking** to objectives
4. Add **recurring tasks** functionality
5. Implement **time tracking** for tasks

Your calendar system is now properly integrated with the database and ready to use! 🚀

