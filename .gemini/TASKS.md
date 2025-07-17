# ✅ TASKS.md — TwiQuest Build Checklist

This file contains all necessary tasks to build the TwiQuest application from end to end.  
Update this file frequently — mark tasks as `[ ]` when completed, and append new ones as needed.

---

## 📦 Project Setup
- [x] Initialize Vite + React project
- [x] Set up TailwindCSS
- [x] Install and configure shadcn/ui components
- [x] Configure Prettier and ESLint
- [x] Install Framer Motion
- [x] Set up Supabase project
- [x] Connect Supabase to frontend
- [x] Add dark mode support

---

## 👥 Authentication & User Profiles
- [ ] Enable Supabase Auth (Email + GitHub OAuth)
- [x] Create GitHub login modal (non-dismissible)
- [x] Build `AuthProvider` using React Context
- [ ] Build onboarding screen (username, avatar, bio)
- [ ] Build user profile page (public and editable states)
- [x] Display XP and level on profile
- [ ] Enable avatar upload (via Supabase Storage)

---

## ✍️ Tweeting System
- [x] Design Supabase `tweets` table (support threads)
- [x] Build Tweet Composer with emoji/text input
- [x] Support media uploads (image + preview)
- [x] Build TweetCard component (avatar, username, content, time, XP badge)
- [x] Implement like/retweet buttons with counters
- [x] Enable threaded replies (parent/child tweet relationships)
- [ ] Enable soft deletes (e.g., tweet hide)

---

## 🏠 Feed Pages
- [x] Public Feed (latest tweets from everyone)
- [x] Following Feed (tweets from followed users)
- [ ] Popular Feed (top liked/retweeted tweets daily)
- [x] Basic feed loading with infinite scroll
- [x] Tweet detail view with thread replies

---

## ❤️ Social Interactions
- [x] Supabase tables for `likes`, `retweets`, `follows`
- [x] Like/unlike tweet functionality
- [x] Retweet tweet functionality
- [x] Follow/unfollow users
- [x] Show follower/following counts on profile

---

## 🕹️ Gamification System
- [x] Design Supabase `xp_events`, `levels`, `quests`, `user_quests` tables
- [x] Implement XP reward logic via Supabase database functions
- [x] XP triggers for:
  - [x] Posting a tweet
  - [x] Getting likes
  - [x] Getting retweets
  - [x] Logging in daily
- [x] Level progression based on XP
- [x] Build XP progress bar (floating in layout)
- [x] Display level-up animations or badge
- [x] Cap XP per user per hour to prevent abuse (via daily login system)

---

## 🧩 Quest Engine
- [x] Build Quest table schema (JSON-based criteria)
- [x] Build backend logic for tracking quest progress
- [x] Show active quests in UI
- [x] Trigger UI reward animation when a quest is completed
- [x] Add daily/weekly quests (e.g., "Post 5 tweets")
- [ ] Add cooldown between same quest completions

---

## 🏆 Leaderboard
- [x] Build `/leaderboard` page
- [x] Aggregate top XP earners (daily/weekly/monthly)
- [x] Display username, avatar, level, XP
- [ ] Add filters/sorting for leaderboard

---

## 🎨 UI/UX Enhancements
- [x] Theme toggle with light/dark mode support
- [x] Platform statistics dashboard
- [x] User suggestions and discovery
- [x] Search functionality with animated suggestions
- [x] Rich notification system for all user actions
- [x] Smooth animations for tweets and interactions
- [x] Enhanced right sidebar with useful widgets
- [x] Infinite scroll for tweet feeds
- [x] Tweet detail modal/page
- [x] User profile editing interface
- [x] Daily login streak tracking and rewards
- [x] Media upload with drag-and-drop support
- [x] Comprehensive notification system

---

## 🔒 Settings & Utilities
- [x] User settings page (change email, password, bio)
- [x] Toggle dark/light mode
- [x] Logout functionality
- [x] Route guards (private vs. public pages)
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

