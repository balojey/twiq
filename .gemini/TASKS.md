# ✅ TASKS.md — TwiQuest Build Checklist

This file contains all necessary tasks to build the TwiQuest application from end to end.  
Update this file frequently — mark tasks as `[ ]` when completed, and append new ones as needed.

---

## 📦 Project Setup
- [ ] Initialize Vite + React project
- [ ] Set up TailwindCSS
- [ ] Install and configure shadcn/ui components
- [ ] Configure Prettier and ESLint
- [ ] Install Framer Motion
- [ ] Set up Supabase project
- [ ] Connect Supabase to frontend
- [ ] Add dark mode support

---

## 👥 Authentication & User Profiles
- [ ] Enable Supabase Auth (Email + GitHub OAuth)
- [ ] Create GitHub login modal (non-dismissible)
- [ ] Build `AuthProvider` using React Context
- [ ] Build onboarding screen (username, avatar, bio)
- [ ] Build user profile page (public and editable states)
- [ ] Display XP and level on profile
- [ ] Enable avatar upload (via Supabase Storage)

---

## ✍️ Tweeting System
- [ ] Design Supabase `tweets` table (support threads)
- [ ] Build Tweet Composer with emoji/text input
- [ ] Support media uploads (image + preview)
- [ ] Build TweetCard component (avatar, username, content, time, XP badge)
- [ ] Implement like/retweet buttons with counters
- [ ] Enable threaded replies (parent/child tweet relationships)
- [ ] Enable soft deletes (e.g., tweet hide)

---

## 🏠 Feed Pages
- [ ] Public Feed (latest tweets from everyone)
- [ ] Following Feed (tweets from followed users)
- [ ] Popular Feed (top liked/retweeted tweets daily)
- [ ] Infinite scroll or paginated loading
- [ ] Tweet detail view with thread replies

---

## ❤️ Social Interactions
- [ ] Supabase tables for `likes`, `retweets`, `follows`
- [ ] Like/unlike tweet functionality
- [ ] Retweet tweet functionality
- [ ] Follow/unfollow users
- [ ] Show follower/following counts on profile

---

## 🕹️ Gamification System
- [ ] Design Supabase `xp_events`, `levels`, `quests`, `user_quests` tables
- [ ] Implement XP reward logic via Supabase Edge Functions
- [ ] XP triggers for:
  - [ ] Posting a tweet
  - [ ] Getting likes
  - [ ] Getting retweets
  - [ ] Logging in daily
- [ ] Level progression based on XP
- [ ] Build XP progress bar (floating in layout)
- [ ] Display level-up animations or badge
- [ ] Cap XP per user per hour to prevent abuse

---

## 🧩 Quest Engine
- [ ] Build Quest table schema (JSON-based criteria)
- [ ] Build backend logic for tracking quest progress
- [ ] Show active quests in UI
- [ ] Trigger UI reward animation when a quest is completed
- [ ] Add daily/weekly quests (e.g., “Post 5 tweets”)
- [ ] Add cooldown between same quest completions

---

## 🏆 Leaderboard
- [ ] Build `/leaderboard` page
- [ ] Aggregate top XP earners (daily/weekly/monthly)
- [ ] Display username, avatar, level, XP
- [ ] Add filters/sorting for leaderboard

---

## 🔒 Settings & Utilities
- [ ] User settings page (change email, password, bio)
- [ ] Toggle dark/light mode
- [ ] Logout functionality
- [ ] Route guards (private vs. public pages)
- [ ] 404 and fallback states

---

## 🔗 Wallet Integration (Optional)
- [ ] Add “Connect Wallet” button to bottom-left sidebar
- [ ] Use Solana wallet adapter or Phantom
- [ ] Store wallet address in user profile (optional XP boost)

---

## 📄 Documentation & Logging
- [ ] Maintain `SUMMARY.md` after every completed task
- [ ] Keep this `TASKS.md` file updated and checked
- [ ] Write high-level README for repo
- [ ] Add .env.example and setup instructions

---

## 📊 Deployment (Optional)
- [ ] Setup CI/CD (e.g., Vercel, Netlify)
- [ ] Add Supabase project keys to deployment env
- [ ] Optimize images/media
- [ ] Add meta tags / SEO basics
- [ ] Track errors (e.g., with Sentry or console logging)

---

## 🔁 Post-MVP Enhancements (Icebox)
- [ ] Notification system for likes/retweets/XP
- [ ] Direct messages (DMs)
- [ ] Tweet scheduling
- [ ] Custom badges / cosmetics for high-level users
- [ ] Explore page with trending tags or users

---

✅ Remember: Every time you complete a task, update `TASKS.md` and write a summary in `SUMMARY.md`.

