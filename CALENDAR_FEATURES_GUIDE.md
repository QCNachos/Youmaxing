# Calendar Features Guide

## 🎯 What's New

Your calendar system now has **three powerful layers** of task management:

### 📅 Daily Tasks
Quick, actionable items for each day
- ✅ Add/Edit/Delete tasks
- 🔄 Toggle completion status
- ⏱️ Estimate time duration
- 🎯 Set priority (low/medium/high)
- 🏷️ Tag with aspect (Training, Business, etc.)
- 👤 Mark as Personal or Job-related

### 🗓️ Weekly Objectives
Goals for the week ahead
- 📊 Track progress (0-100%)
- 📝 Add detailed descriptions
- 🎯 Set priorities
- 🔗 Link to monthly objectives (coming soon)
- 📈 Visual progress bars

### 📆 Monthly Objectives
Big picture goals for the month
- 📊 Track progress (0-100%)
- 📝 Detailed descriptions
- 🎯 Priority management
- 🔗 Link to weekly objectives (coming soon)
- 📈 Visual progress tracking

## 🖥️ User Interface

### Calendar Sidebar Layout

```
┌─────────────────────────────────┐
│  ◀  December 2024  ▶           │
├─────────────────────────────────┤
│                                 │
│      📅 Calendar Grid           │
│                                 │
├─────────────────────────────────┤
│  Show: [Both][Personal][Job]    │
├─────────────────────────────────┤
│ [Events] [Tasks] [Goals]        │  ← Tabs
├─────────────────────────────────┤
│                                 │
│  📋 Task List / Goal List       │
│  (scrollable area)              │
│                                 │
│  + Add New Button               │
│                                 │
├─────────────────────────────────┤
│   5 Events | 3 Done | 75%       │  ← Quick Stats
└─────────────────────────────────┘
```

### Tasks Tab View

```
Today's Tasks                    3/5
━━━━━━━━━━━━━━━━━━━━ 60%

✅ Morning workout (H)            [✏️][🗑️]
✅ Review design docs (M)         [✏️][🗑️]
◯ Team meeting prep (H)           [✏️][🗑️]
◯ Write blog post (L)             [✏️][🗑️]
◯ Call client (M)                 [✏️][🗑️]

        + Add Task
```

### Goals Tab View

```
MONTHLY GOALS                     + Add

Launch Mobile App            65%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[high] [Business]                 [✏️][🗑️]

Improve Fitness              80%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[medium] [Training]               [✏️][🗑️]


WEEKLY OBJECTIVES                 + Add

Complete UI Design           70%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[high] [Business]                 [✏️][🗑️]

Strength Training            60%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[medium] [Training]               [✏️][🗑️]
```

## 📱 Add Task Dialog

```
┌─────────────────────────────────┐
│  Add Task              [X]      │
├─────────────────────────────────┤
│                                 │
│  Title                          │
│  ┌───────────────────────────┐ │
│  │ Morning workout            │ │
│  └───────────────────────────┘ │
│                                 │
│  Description (Optional)         │
│  ┌───────────────────────────┐ │
│  │ 30 min cardio + stretch    │ │
│  └───────────────────────────┘ │
│                                 │
│  Aspect        Type             │
│  [Training ▼]  [Personal ▼]    │
│                                 │
│  Priority      Duration         │
│  [High ▼]      [30] min         │
│                                 │
│           [Add]                 │
│                                 │
└─────────────────────────────────┘
```

## ✨ Key Features

### 1. **Hover Actions**
- Hover over any task or objective to see edit/delete buttons
- No cluttered interface - actions appear when you need them

### 2. **Quick Toggle**
- Click the circle ◯ next to tasks to mark complete ✅
- Instant visual feedback with strikethrough and color change

### 3. **Progress Tracking**
- See your daily progress bar at the top of tasks
- Track objective completion with percentage bars
- Quick stats at the bottom show overall progress

### 4. **Smart Filtering**
- Filter everything by Personal or Job
- Keep work and life separate, or view both
- Filter applies across all tabs

### 5. **Color Coding**
- **Priority Badges**:
  - 🔴 High (Red)
  - 🟡 Medium (Yellow)  
  - 🟢 Low (Green)
- **Aspect Tags**: Color-matched to your life aspects
- **Type Badges**: Gradient colors (Personal = Purple, Job = Blue)

### 6. **Smart Dates**
- Tasks automatically assigned to selected date
- Weekly objectives track by week start (Monday)
- Monthly objectives track by month

## 🎮 How to Use

### Adding a Daily Task
1. Click on a date in the calendar
2. Go to the "Tasks" tab
3. Click "+ Add Task"
4. Fill in the details:
   - Title (required)
   - Description (optional)
   - Aspect: Which area of life?
   - Type: Personal or Job?
   - Priority: How important?
   - Duration: How long will it take?
5. Click "Add"

### Adding a Weekly Objective
1. Go to the "Goals" tab
2. Click "+ Add" under "Weekly Objectives"
3. Fill in:
   - Title (required)
   - Description (optional)
   - Aspect, Type, Priority
   - Progress: Start at 0%
4. Click "Add"

### Adding a Monthly Objective
1. Go to the "Goals" tab
2. Click "+ Add" under "Monthly Goals"
3. Fill in the same fields
4. Click "Add"

### Editing Items
1. Hover over any task or objective
2. Click the pencil icon ✏️
3. Make your changes
4. Click "Save"

### Deleting Items
1. Hover over any task or objective
2. Click the trash icon 🗑️
3. Confirm deletion
4. Item is removed

### Completing Tasks
1. Click the circle ◯ next to a task
2. It turns into ✅ and strikes through
3. Progress bar updates automatically
4. Click again to mark incomplete

### Updating Progress
1. Edit any objective
2. Update the "Progress (%)" field
3. Save changes
4. Progress bar updates visually

## 🔄 Data Flow

```
1. You interact with the UI
          ↓
2. Component updates local state
          ↓
3. Database function is called
          ↓
4. Supabase saves to database
          ↓
5. Data is fetched back
          ↓
6. UI updates with new data
```

**Everything is saved to the database!** 
- Your tasks persist across sessions
- Sync across devices (future)
- Never lose your data

## 🎨 Design Philosophy

### Minimalist
- Clean interface, no clutter
- Actions hidden until needed
- Focus on content

### Intuitive
- Clear labels and icons
- Consistent patterns
- No learning curve

### Responsive
- Smooth animations
- Instant feedback
- Loading states when needed

### Accessible
- High contrast colors
- Clear hierarchy
- Keyboard friendly (future enhancement)

## 📊 Quick Stats Footer

Always visible at the bottom:
```
┌─────────────────────────────────┐
│   5         3          60%      │
│ Events    Done     Progress     │
└─────────────────────────────────┘
```

- **Events**: Number of events today
- **Done**: Number of completed tasks
- **Progress**: Completion percentage

## 🚀 Coming Soon

- ✅ Expanded Calendar View integration
- 🔗 Link tasks to objectives
- ⏰ Task time tracking
- 🤖 AI-powered suggestions
- 📊 Progress analytics
- 🔔 Reminders & notifications
- 📤 Share objectives with friends
- 🔄 Recurring tasks
- 📱 Mobile optimizations

## 💡 Pro Tips

1. **Use Priority Wisely**: Not everything can be high priority
2. **Break Down Objectives**: Turn big monthly goals into weekly objectives
3. **Daily Review**: Check your tasks every morning
4. **Update Progress**: Keep objective progress up to date
5. **Use Descriptions**: Add context for future reference
6. **Filter by Context**: Use Personal/Job filters for focus time
7. **Aspect Tagging**: Tag correctly for better insights later

## ❓ FAQ

**Q: Where is my data stored?**
A: In your Supabase database, securely tied to your user account.

**Q: Can I see past tasks?**
A: Yes! Select any date in the calendar to see its tasks.

**Q: What happens if I delete an objective with linked tasks?**
A: Currently, tasks remain (nullable relationship). Full linking coming soon.

**Q: Can I reorder tasks?**
A: Not yet - drag & drop is on the roadmap!

**Q: Do tasks have reminders?**
A: Not yet, but notifications are planned!

**Q: Can I duplicate tasks?**
A: Not yet, but recurring tasks are planned!

## 🎉 Enjoy Your Enhanced Calendar!

You now have a powerful, database-backed task and objective management system. Start by adding your first task and watch your productivity soar!

