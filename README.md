# Twiq - Gamified Social Network

A production-ready Twitter clone with gamification features built with React, Vite, shadcn/ui, TailwindCSS, and Supabase.

## 🚀 Features

### Core Social Features
- **Tweet System**: Post tweets with 280 character limit, media uploads, and threading
- **Social Interactions**: Like, retweet, reply, and follow other users
- **Real-time Feed**: Public, following, and popular tweet feeds with infinite scroll
- **User Profiles**: Customizable profiles with bio, avatar, and activity stats

### Gamification System
- **XP & Levels**: Earn experience points for various activities and level up
- **Quest System**: Complete daily, weekly, and monthly challenges
- **Leaderboard**: Compete with other users for top XP rankings
- **Daily Login Streaks**: Bonus XP for consecutive daily logins
- **Achievement Notifications**: Real-time notifications for accomplishments

### Modern UI/UX
- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Mobile-first design that works on all devices
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Error Handling**: Comprehensive error boundaries and fallback states
- **Loading States**: Skeleton loaders and progress indicators

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Components**: shadcn/ui, TailwindCSS
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Context, Zustand
- **Routing**: React Router DOM
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key to `.env`

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: User profiles with XP and level tracking
- **tweets**: Tweet content with threading support
- **likes/retweets**: Social interaction tracking
- **follows**: User relationship management
- **quests**: Gamification quest definitions
- **user_quests**: Individual quest progress tracking
- **xp_events**: XP earning history
- **daily_logins**: Login streak tracking
- **notifications**: User notification system

## 🎮 Gamification Features

### XP System
- **Tweet Posted**: +10 XP
- **Like Received**: +5 XP
- **Retweet Received**: +10 XP
- **Daily Login**: +20 XP (with streak bonuses)
- **Quest Completion**: Variable XP based on difficulty

### Quest Types
- **Daily Quests**: Reset every 24 hours
- **Weekly Quests**: Reset every 7 days
- **Achievement Quests**: One-time completions
- **Social Quests**: Interaction-based challenges

### Level Progression
- Levels calculated based on total XP (100 XP per level)
- Level-up notifications and celebrations
- Visual level indicators throughout the UI

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

### Database Functions
The application includes several PostgreSQL functions for:
- XP awarding and level calculation
- Quest progress tracking
- Daily login streak management
- User statistics aggregation
- Trending hashtag extraction

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel, Netlify, or any static hosting service
   - Ensure environment variables are configured

3. **Set up Supabase production environment**
   - Configure production database
   - Set up authentication providers
   - Configure storage buckets

## 🔐 Security Features

- **Row Level Security (RLS)**: All database tables protected with RLS policies
- **Authentication**: Supabase Auth with GitHub OAuth
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **Rate Limiting**: Quest completion and XP farming prevention

## 🎨 Customization

### Themes
The application supports light, dark, and system themes. Customize colors in:
- `src/index.css` - CSS custom properties
- `tailwind.config.js` - TailwindCSS configuration

### Gamification Rules
Modify XP rewards and quest criteria in:
- Database migration files for quest definitions
- `award_xp` function for XP calculation logic

## 📱 Mobile Support

- Responsive design with mobile-first approach
- Touch-friendly interactions
- Optimized performance for mobile devices
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide](https://lucide.dev/) for the icon library

---

Built with ❤️ using modern web technologies for a fast, scalable, and engaging social experience.