# Youmaxing - Films & Entertainment Hub TODO

## 🎬 Films/Series Feature - TMDB Integration

### API Setup
- [ ] **Get TMDB API Key**: Register at [themoviedb.org](https://www.themoviedb.org/settings/api) and add to `.env`:
  ```
  TMDB_API_KEY=your_key_here
  ```
- [ ] **Test TMDB API Routes**: 
  - `/api/films/search` - Search movies/series
  - `/api/films/providers` - Get streaming availability by country

### Database Migrations
- [ ] **Run migration 00005_films_enhanced.sql** on Supabase:
  - Adds tier column to watchlist (legendary, amazing, very_good, good, okay, not_good, not_interested)
  - Adds franchise, tmdb_id, poster_url, streaming_providers, genres, release_year
  - Adds country_code to user_preferences

### Films Mini-App
- [x] Films.tsx component with tier-based categorization
- [x] TMDB search integration in add dialog
- [x] Streaming provider badges display
- [x] Franchise filtering (Star Wars, GoT, LotR, etc.)
- [x] Tier-based grouping in library view
- [ ] **Persist to Supabase**: Connect watchlist state to database
- [ ] **User country detection**: Auto-detect or let user set country for streaming providers
- [ ] **Poster images**: Add TMDB image CDN integration (https://image.tmdb.org/t/p/w500/)
- [ ] **Refresh providers**: Background job to update streaming availability weekly

### Recommendation Engine
- [ ] **AI Recommendations**: Use Claude/GPT to analyze user's tier ratings and suggest
- [ ] **Recommendation pacing**: 2-3 recommendations per week logic
- [ ] **"Touch grass" message**: When user has watched all highly-rated content
- [ ] **Rewatch suggestions**: Surface old favorites periodically

---

## 🛍️ App Store

### Current Status
- [x] AppStore component with modal dialog
- [x] App Store icon in sidebar (above Calendar)
- [x] Mock apps (Music, Books, Games, Kids, Pets)
- [x] Install/uninstall flow

### Remaining
- [ ] **Persist installed apps**: Save to Supabase user_installed_apps table
- [ ] **OAuth connections**: Handle Spotify/other OAuth tokens
- [ ] **App activation**: Navigate to installed apps

---

## 🎵 Music (Spotify Integration)

### Setup
- [ ] **Spotify Developer App**: Create at [developer.spotify.com](https://developer.spotify.com/dashboard)
  ```
  SPOTIFY_CLIENT_ID=your_id
  SPOTIFY_CLIENT_SECRET=your_secret
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- [ ] **OAuth Flow**: `/api/spotify/auth` and `/api/spotify/callback`

### Features
- [ ] Music.tsx component
- [ ] Top tracks/artists display
- [ ] Playlist management
- [ ] AI music recommendations

---

## 👥 Social Features

### Database (00006_entertainment_social.sql)
- [ ] Run migration for:
  - `friend_connections` table
  - `shared_content` table  
  - `user_points` table
  - `tips` table

### Components
- [ ] ShareModal.tsx - Share watchlist/recommendations
- [ ] SocialFeed.tsx - Activity feed
- [ ] PointsDisplay.tsx - Show user's points in header

### Points System
- [ ] Award points for engagement (add item, rate, share)
- [ ] Tipping friends functionality
- [ ] Daily limits

---

## 🔐 Environment Variables Needed

```env
# TMDB (Required for Films)
TMDB_API_KEY=

# Spotify (Optional, for Music app)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📋 Priority Order

1. **TMDB API Key** - Add key and test search works
2. **Database migration** - Run 00005_films_enhanced.sql
3. **Test Films mini-app** - Add some movies, verify display
4. **User country** - Add country setting for streaming providers
5. **Persist watchlist** - Connect to Supabase
6. **App Store persistence** - Save installed apps
7. **Social features** - Lower priority, after core Films works

---

## 🐛 Known Issues

- Films component uses mock data until Supabase is connected
- TMDB API calls will fail without API key
- Poster images show placeholder icons until TMDB images are integrated
- App Store apps are mock data

---

## 🧠 Insight Agent (Claude Code Browser Analysis)

### Overview
For users with Claude Code, the Insight Agent can browse their logged-in accounts (Facebook, Netflix, LinkedIn, etc.) to extract **insights** (not raw data) that power personalized recommendations.

### Setup
- [ ] **Run migration 00007_insight_agent.sql** - Creates tables for insights

### How It Works
1. User enables "I have Claude Code" toggle
2. User selects platforms to analyze (Facebook, Netflix, LinkedIn, etc.)
3. User clicks "Analyze" → gets instructions to paste in Claude
4. Claude browses each platform using user's logged-in sessions
5. Claude extracts HIGH-LEVEL insights (interests, preferences, patterns)
6. Insights are sent to `/api/insights/ingest`
7. Profile is built → powers recommendations across all mini-apps

### Where to Control Permissions

1. **Global Settings** → `/settings` → Insight Agent tab
   - Enable/disable Claude Code
   - Select all platforms to analyze
   - Set auto-refresh frequency
   - Choose privacy level (minimal/standard/detailed)
   - View insights, clear data

2. **Per Mini-App** → Each mini-app has a brain icon for quick access
   - Films → Netflix, Prime Video, YouTube, Spotify
   - Training → Strava, MyFitnessPal, Google Calendar
   - Business → LinkedIn, Google Drive, Gmail, Notion
   - Friends/Family → Facebook, Instagram
   - Travel → Instagram, Gmail (bookings)
   - Finance → Mint, Robinhood

### Privacy Model
- **Never stored**: Personal data, names, messages, financial specifics
- **Only stored**: Derived insights ("interested in hiking", "prefers sci-fi")
- **User control**: Choose which platforms to analyze per aspect

### For Users WITHOUT Claude Code
- Quick survey/questionnaire
- Manual preference rating
- OAuth integrations where available (Spotify, etc.)

### Files
- `/src/lib/insight-agent/` - Types, prompts, recommendation engine
- `/src/components/InsightAgent.tsx` - Full UI component
- `/src/components/settings/InsightAgentSettings.tsx` - Settings page section
- `/src/components/aspects/InsightPermissions.tsx` - Per-mini-app controls
- `/src/app/(dashboard)/settings/page.tsx` - Settings page
- `/src/app/api/insights/ingest/route.ts` - API to receive insights
- `/supabase/migrations/00007_insight_agent.sql` - Database schema

---

## 📝 User's Film Ratings Reference

From the original request, the user provided their tier ratings:

**LEGENDARY**: Game of Thrones, Lord of the Rings, The Big Short, Braveheart, National Treasures

**AMAZING**: Star Wars, Mandalorian, Rings of Power, Vikings, Wheel of Time, House of the Dragon, Westworld, Yellowstone, Alexander, The Dark Knight, American Pie, Moneyball

**VERY GOOD**: The Queen's Gambit, Altered Carbon, Peaky Blinders, Andor, Book of Boba Fett, Breaking Bad, The Last Kingdom, The Hobbits, Silicon Valley, Prison Break, One Tree Hill, The Man in the High Castle, Centurion, The Eagle, The Count of Monte Cristo, Italian Job, Wolf of Wall Street, Harry Potter, Snowpiercer, Dune, Matrix, Mask of Zorro, Hangover, Back to the Future

**GOOD**: The 100, Ahsoka, Obi-Wan Kenobi, Gladiator, 3 Body Problem, How I Met Your Mother/Father, Young Sheldon, Fresh Off the Boat, Big Bang Theory, Spartacus, House of Cards, South Park, The Summer I Turned Pretty, Fargo, Outlander, Running Point, The Great, Witcher, The Expanse, Ozark, Black Sails, Marco Polo, The Last Legion, Medici, 21, Lincoln Lawyer, Ocean's 11, Never Back Down

**OKAY**: Stranger Things, Arrested Development, Desperate Housewives, Billions, Schitt's Creek, Homeland, Modern Family, Friends, Narcos, Mr. Robot, Brooklyn Nine-Nine

**WATCHLIST (Recommended)**: Chernobyl, South Park, Industry, The White Lotus, Foundation, His Dark Materials, Shōgun, The Last Samurai, The Americans, Shadow and Bone, Disclaimer, Silo, The White Queen/Princess/Spanish Princess, Fight Club

