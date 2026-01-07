# Testing Guide - App Store & Carousel Features

## 🧪 Test Scenario 1: New User Onboarding

### Steps:
1. **Sign up** with a new account
2. **Complete onboarding:**
   - Enter your name (should see +50 points)
   - Select 3-5 priority aspects
   - Select some goals
   - (Optional) Connect social accounts
   - Click "Start Maximizing"
3. **Verify:**
   - ✅ Redirected to dashboard
   - ✅ See success toast with points earned
   - ✅ Carousel shows your selected priorities

### Expected Results:
- Name saved to profile
- Priorities saved to preferences
- Points awarded and visible
- Onboarding marked complete

---

## 🧪 Test Scenario 2: Onboarding Persistence Bug Fix

### Steps:
1. **Complete onboarding** (as above)
2. **Logout** (Settings → Sign Out)
3. **Login again** with same account
4. **Verify:**
   - ✅ Goes directly to dashboard (NOT onboarding)
   - ✅ Your name is displayed
   - ✅ Your carousel apps are preserved

### Expected Results:
- Should NOT see onboarding again
- All preferences persist

---

## 🧪 Test Scenario 3: Apps Dialog - Basic Navigation

### Steps:
1. **Open Apps** (click Store icon in sidebar)
2. **Explore the dialog:**
   - See "Apps" title (not "App Store")
   - See "X/10 in carousel" badge
   - See all 10 V1 apps (Training, Food, Sports, Films, Finance, Business, Travel, Family, Friends, Events)
   - See 5 V2 apps with "Coming Soon" badge (Music, Books, Games, Kids, Pets)
3. **Test category filters:**
   - Click "All Apps" - see all 15 apps
   - Click "Health" - see Training, Food, Sports
   - Click "Entertainment" - see Films, Events, Music, Books, Games
   - Click "Productivity" - see Business
   - Click "Finance" - see Finance
   - Click "Lifestyle" - see Travel, Family, Friends, Kids, Pets

### Expected Results:
- Dialog opens smoothly
- All apps visible
- Category filtering works
- Coming soon apps clearly marked

---

## 🧪 Test Scenario 4: Carousel Management - Add/Remove Apps

### Steps:
1. **Open Apps dialog**
2. **Note current carousel count** (e.g., "5/10 in carousel")
3. **Add an app to carousel:**
   - Find an app NOT in carousel (no "In Carousel" badge)
   - Click the eye icon
   - Verify count increases (e.g., "6/10")
4. **Remove an app from carousel:**
   - Find an app IN carousel (has "In Carousel" badge)
   - Click the eye-off icon
   - Verify count decreases (e.g., "5/10")
5. **Click Save button**
6. **Verify success toast**

### Expected Results:
- Eye icon toggles apps in/out
- Count updates in real-time
- Save button persists changes

---

## 🧪 Test Scenario 5: Carousel Constraints

### Test 5A: Minimum Constraint (5 apps)
1. **Open Apps dialog**
2. **Remove apps until you have 5 in carousel**
3. **Try to remove one more**
4. **Verify:**
   - ✅ Error toast: "You must have at least 5 apps in your carousel"
   - ✅ App stays in carousel

### Test 5B: Maximum Constraint (10 apps)
1. **Open Apps dialog**
2. **Add apps until you have 10 in carousel**
3. **Try to add one more**
4. **Verify:**
   - ✅ Error toast: "You can have maximum 10 apps in your carousel"
   - ✅ App doesn't get added

### Expected Results:
- Min/max constraints enforced
- Clear error messages
- UI prevents invalid states

---

## 🧪 Test Scenario 6: Wishlist Feature

### Steps:
1. **Open Apps dialog**
2. **Find a "Coming Soon" app** (Music, Books, Games, Kids, or Pets)
3. **Click the bell icon**
4. **Verify:**
   - ✅ Success toast: "Added to wishlist! We'll notify you when it's ready."
   - ✅ Bell icon becomes filled
   - ✅ Footer shows "X wishlisted"
5. **Click bell icon again to remove**
6. **Verify:**
   - ✅ Toast: "Removed from wishlist"
   - ✅ Bell icon becomes outline
   - ✅ Wishlist count decreases
7. **Click Save**
8. **Close and reopen Apps dialog**
9. **Verify wishlist persists**

### Expected Results:
- Wishlist toggle works
- Count updates
- Preferences persist

---

## 🧪 Test Scenario 7: Carousel Display After Changes

### Steps:
1. **Open Apps dialog**
2. **Remove 2-3 apps from carousel** (e.g., remove Events, Family)
3. **Add 1-2 different apps** (if under 10)
4. **Click Save**
5. **Close dialog**
6. **Look at home carousel**
7. **Verify:**
   - ✅ Removed apps don't appear in carousel
   - ✅ Only selected apps are visible
8. **Refresh the page**
9. **Verify:**
   - ✅ Carousel still shows only selected apps
   - ✅ Preferences persisted

### Expected Results:
- Carousel immediately reflects changes
- Changes persist after refresh
- Smooth navigation through selected apps only

---

## 🧪 Test Scenario 8: Opening Apps from Dialog

### Steps:
1. **Open Apps dialog**
2. **Click "Open App" on a V1 app** (e.g., Training)
3. **Verify:**
   - ✅ Dialog closes
   - ✅ Navigates to the app page
4. **Go back to dashboard**
5. **Open Apps dialog**
6. **Try to click "Open App" on a V2 app** (should be disabled)
7. **Verify:**
   - ✅ Button is disabled/grayed out
   - ✅ Shows "Coming in V2"

### Expected Results:
- V1 apps open successfully
- V2 apps are disabled
- Navigation works smoothly

---

## 🧪 Test Scenario 9: Multiple Sessions

### Steps:
1. **Configure carousel** (add/remove apps, save)
2. **Logout**
3. **Login again**
4. **Verify carousel shows your configuration**
5. **Open Apps dialog**
6. **Verify:**
   - ✅ Carousel apps match what you saved
   - ✅ Wishlist apps are still wishlisted
   - ✅ Count is correct

### Expected Results:
- All preferences persist across sessions
- No data loss on logout/login

---

## 🧪 Test Scenario 10: Edge Cases

### Test 10A: Exactly 5 Apps
1. Set carousel to exactly 5 apps
2. Save and verify carousel works
3. Try to remove one (should fail)

### Test 10B: Exactly 10 Apps
1. Set carousel to exactly 10 apps
2. Save and verify carousel works
3. Try to add one (should fail)

### Test 10C: Fresh Account
1. Create new account
2. Skip onboarding priorities (or select none)
3. Verify default 5 apps appear in carousel
4. Open Apps and verify can customize

### Expected Results:
- System handles edge cases gracefully
- Always maintains valid state
- Clear user feedback

---

## 🐛 Known Issues to Watch For

1. **Onboarding not saving** - Should be FIXED now
2. **Carousel showing all apps** - Should respect user preferences now
3. **Preferences not persisting** - Should be FIXED now

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth UI transitions
- ✅ Data persists across sessions
- ✅ Constraints enforced
- ✅ Clear user feedback (toasts)
- ✅ Responsive and intuitive

---

## 🚨 If Something Fails

### Onboarding data not saving:
- Check browser console for errors
- Verify Supabase connection
- Check `user_preferences` table in Supabase

### Carousel not updating:
- Check browser console
- Verify `carousel_apps` field in database
- Try hard refresh (Cmd+Shift+R)

### Apps dialog issues:
- Check for JavaScript errors
- Verify all imports loaded
- Check network tab for API calls

---

**Happy Testing! 🎉**

Report any issues found during testing.

