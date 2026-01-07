# YOUMAXING 🚀

> Maximize every aspect of your life with AI-powered insights and intelligent life management.

YOUMAXING is a comprehensive personal development platform that helps you track, optimize, and maximize every area of your life - from fitness and nutrition to finance, social life, and career growth.

## ✨ Features

- 🤖 **AI-Powered Insights** - Get personalized recommendations across all life aspects
- 📅 **Smart Calendar System** - Task management with natural language interface
- 💪 **Life Aspects** - Track Training, Food, Finance, Business, Friends, Sleep, and more
- 🎯 **Goal Tracking** - Daily tasks, weekly objectives, and monthly goals
- 💬 **Natural Language Chat** - Talk to the AI to manage your calendar
- 📊 **Progress Analytics** - Visual dashboards and completion tracking
- 🎨 **Beautiful UI** - Modern, responsive design with dark/light themes
- 🔐 **Secure & Private** - Your data is protected with Supabase RLS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Youmaxing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials and API keys.

4. **Run database migrations**
   ```bash
   # If using Supabase CLI
   supabase migration up
   
   # Or apply via Supabase Dashboard SQL Editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📚 Documentation

All comprehensive documentation is in the [`docs/`](./docs/) folder:

- **[📖 Docs Index](./docs/README.md)** - Start here for documentation navigation
- **[📅 Calendar Complete Guide](./docs/CALENDAR_COMPLETE_GUIDE.md)** - Everything about the calendar system
- **[🚀 Setup Instructions](./docs/SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[🔒 Security](./docs/SECURITY.md)** - Security policies and best practices
- **[📊 Implementation Status](./docs/IMPLEMENTATION_STATUS.md)** - Current feature status

## 🎯 Key Features

### Calendar & Task Management
- Daily task tracking with completion status
- Weekly objectives with progress bars
- Monthly goals with milestone tracking
- Calendar events with time scheduling
- Natural language commands ("Add a workout task for tomorrow")

### AI Chat Integration
Talk naturally to manage your calendar:
```
"Add a gym task for tomorrow"
"Show my tasks for today"
"Create weekly objective to read 3 books"
"Schedule a meeting tomorrow at 2pm"
```

### Life Aspects
Track and optimize different areas of your life:
- 💪 Training & Fitness
- 🍎 Food & Nutrition
- 💰 Finance & Money
- 💼 Business & Career
- 👥 Friends & Social
- 😴 Sleep & Recovery

### Smart Features
- Job vs Personal task distinction
- Priority levels (High, Medium, Low)
- Progress tracking and analytics
- Aspect-based categorization
- Duration estimates

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **3D Graphics**: Three.js / React Three Fiber
- **Date Handling**: date-fns
- **State Management**: Zustand

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # React components
│   │   ├── 3d/                # Three.js 3D components
│   │   ├── aspects/           # Life aspect components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── db/               # Database service layer
│   │   ├── ai/               # AI integration
│   │   └── ...
│   └── types/                # TypeScript type definitions
├── supabase/
│   └── migrations/           # Database migrations
├── docs/                     # 📚 All documentation
└── public/                   # Static assets
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

See `env.example` for required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anon key
# ... more in env.example
```

## 🗄️ Database

This project uses Supabase (PostgreSQL) with:
- Row Level Security (RLS) policies
- Real-time subscriptions
- Automated migrations
- Type-safe queries

**Important**: Run the critical migration for calendar features:
```bash
supabase migration up
# Or see docs/RUN_MIGRATION_NOW.md for detailed instructions
```

## 🚢 Deployment

Deploy to Vercel (recommended):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

See [docs/DEPLOYMENT_SUMMARY.md](./docs/DEPLOYMENT_SUMMARY.md) for detailed deployment instructions.

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines in the docs folder.

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ by the YOUMAXING Team**

🌟 Star this repo if you find it helpful!

📚 [Read the Full Documentation](./docs/README.md) | 📅 [Calendar Guide](./docs/CALENDAR_COMPLETE_GUIDE.md)
