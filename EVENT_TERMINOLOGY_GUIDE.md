# Event Terminology - Clarification Guide

## 📅 The Two Types of "Events"

We use the term "event" in two different contexts in the app. Here's how to distinguish them:

---

## 1. **Calendar Events** (Scheduling)

**Location**: Calendar sidebar and calendar view  
**Purpose**: Time management and scheduling  
**Icon**: 📅 Calendar  

### What They Are:
- Scheduled items on your calendar
- Time-based activities
- Personal or work appointments
- Daily planning entries

### Examples:
- "Gym Session at 7:00 AM"
- "Team Meeting at 2:00 PM"
- "Dinner with friends at 7:00 PM"
- "Doctor appointment at 10:00 AM"
- "Client call at 3:00 PM"

### Features:
- ✅ Time-specific
- ✅ Date-specific
- ✅ Has aspect/category (Training, Friends, Business, etc.)
- ✅ Priority level
- ✅ Personal or Job type

### User Actions:
- "Add Event" button in Events tab
- Schedule on specific date/time
- Categorize by life aspect
- Set reminders (future)

---

## 2. **Social Events** (Mini-App / Going Out)

**Location**: Mini-Apps section  
**Purpose**: Social activities and entertainment  
**Icon**: 🎉 Entertainment  

### What They Are:
- Social outings
- Entertainment activities
- Cultural experiences
- Ticketed events
- Going out with friends

### Examples:
- 🎬 Cinema - "Dune 2" at AMC Theater
- 🎵 Concert - "Taylor Swift - Eras Tour"
- 🎭 Theater - "Hamilton" on Broadway
- 🎫 Sports - "Lakers vs Warriors"
- 🍽️ Restaurant reservation - "Nobu"
- 🎪 Festival - "Coachella 2024"

### Features:
- ✅ Venue/location
- ✅ Ticket information
- ✅ Cost/price
- ✅ Friend list (who's going)
- ✅ Reviews and ratings
- ✅ Booking links
- ✅ Photos and memories

### User Actions:
- Browse entertainment options
- Track tickets
- Invite friends
- Share experiences
- Rate/review after attending

---

## 🔄 How They Can Work Together

**Scenario**: You bought tickets to see a concert

### Step 1: Social Event (Mini-App)
```
Add event to "Going Out" mini-app:
- Event: "Coldplay Concert"
- Venue: "Madison Square Garden"
- Date: March 15, 2024
- Ticket: $150
- Going with: Sarah, Mike
```

### Step 2: Calendar Event (Schedule)
```
Add to Calendar:
- Title: "Coldplay Concert"
- Date: March 15, 2024
- Time: 8:00 PM
- Aspect: Friends
- Type: Personal
- Priority: High
```

**Result**: The social event is tracked with all details, and the calendar event ensures you don't forget and can plan around it!

---

## 💡 Quick Reference

### Use **Calendar Event** When:
- [ ] You need to schedule something
- [ ] You want time blocking
- [ ] It's part of daily planning
- [ ] You need a reminder for a specific time
- [ ] It's a routine activity (gym, work, calls)

### Use **Social Event (Mini-App)** When:
- [ ] It's entertainment/going out
- [ ] You have tickets
- [ ] Multiple friends are involved
- [ ] You want to track costs
- [ ] You want to save memories/photos
- [ ] It's a special occasion

---

## 🎯 Recommended Workflow

### For Regular Activities:
**Just use Calendar Events**
- Daily gym sessions → Calendar
- Work meetings → Calendar  
- Phone calls → Calendar
- Errands → Calendar

### For Special Outings:
**Use BOTH - Mini-App + Calendar**
1. **Mini-App**: Track the experience, tickets, friends, costs
2. **Calendar**: Schedule it, block time, set reminders

### Examples:

#### ✅ Good: Regular Gym Session
```
Calendar Event: "Morning Workout"
├─ Time: 7:00 AM
├─ Aspect: Training
└─ Type: Personal
```
*No need for mini-app - it's a routine activity*

#### ✅ Good: Concert Night
```
Mini-App Event: "The Weeknd - After Hours Tour"
├─ Venue: "SoFi Stadium"
├─ Ticket: $200
├─ Friends: Alex, Jamie
└─ Notes: "VIP Section - Row 5"

+

Calendar Event: "Concert with Alex & Jamie"
├─ Time: 7:30 PM
├─ Aspect: Friends
└─ Priority: High
```
*Both systems work together for full tracking!*

---

## 🏗️ Future Improvements

### Potential Features:
1. **Auto-link**: Mini-app events automatically create calendar events
2. **Sync**: Update one, update both
3. **Smart suggestions**: "Want to add this to your calendar?"
4. **Past events**: Import past mini-app events to calendar for tracking
5. **Integration**: "You have a concert in 2 days" notification

---

## 📝 Naming Suggestions (Optional)

If the distinction still feels confusing, consider these alternatives:

### Option 1: Keep as-is
- **Calendar Event** (scheduling)
- **Social Event** or **Going Out** (mini-app)

### Option 2: More Specific
- **Calendar Event** (scheduling)
- **Entertainment Event** or **Outing** (mini-app)

### Option 3: Different Terms
- **Appointment** or **Schedule Item** (calendar)
- **Event** or **Experience** (mini-app)

---

## ✅ Current Implementation

### Calendar Section:
- **Events Tab**: Shows calendar events (time-based scheduling)
- **Add Event Button**: Creates calendar events
- **Displays**: Date, time, aspect, priority

### Mini-Apps Section:
- **Going Out/Events Mini-App**: Social and entertainment events
- **Features**: Tickets, venues, friends, costs
- **Displays**: Location, price, attendees

### Both Are Valuable:
- **Calendar** = Time management & planning
- **Mini-App** = Experience tracking & memories

---

**Bottom Line**: 
- If it's about **WHEN** → Calendar Event
- If it's about **WHAT/WHO/WHERE** → Social Event (Mini-App)
- Special occasions? → Use BOTH! 🎉


