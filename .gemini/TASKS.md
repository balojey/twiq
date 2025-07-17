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
- [x] Add filters/sorting for leaderboard

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
- [x] Error boundaries and fallback states
- [x] 404 page with helpful navigation
- [x] Trending hashtags display
- [x] Popular feed with engagement-based ranking
- [x] Loading states and skeleton loaders
- [x] Advanced analytics dashboard with growth metrics
- [x] Achievement system with badges and progress tracking
- [x] Enhanced notification system with real-time updates
- [x] User engagement scoring and performance analytics
- [x] Seasonal leaderboard system (database ready)

---

## 🔒 Settings & Utilities
- [x] User settings page (change email, password, bio)
- [x] Toggle dark/light mode
- [x] Logout functionality
- [x] Route guards (private vs. public pages)
- [x] 404 and fallback states

---

## 📄 Documentation & Logging
- [x] Maintain `SUMMARY.md` after every completed task
- [x] Keep this `TASKS.md` file updated and checked
- [x] Write high-level README for repo
- [x] Add .env.example and setup instructions

---

## 📊 Deployment (Optional)
- [x] Optimize images/media
- [x] Add meta tags / SEO basics
- [x] Track errors (e.g., with Sentry or console logging)
- [x] Advanced analytics and reporting system
- [x] Achievement and badge collection system
- [x] Performance monitoring and user engagement tracking

---

## 🔁 Post-MVP Enhancements (Icebox)
- [x] Notification system for likes/retweets/XP
- [x] Advanced analytics dashboard
- [x] Achievement and badge system
- [x] Real-time notification system
- [ ] Direct messages (DMs)
- [ ] Tweet scheduling
- [ ] Custom badges / cosmetics for high-level users
- [x] Explore page with trending tags or users
- [ ] Admin dashboard for platform analytics
- [ ] Content moderation tools
- [ ] API rate limiting and abuse prevention
- [ ] Mobile app development
- [ ] Advanced search and filtering

---

---

## 🔗 Solana Wallet Integration & Onchain Profile

### 📦 Setup & Dependencies
* [x] Install required Solana/Honeycomb dependencies:
  ```bash
  npm install @solana/wallet-adapter-react @solana/wallet-adapter-base @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui @solana/web3.js @honeycomb-protocol/edge-client bs58
  ```
* [x] Initialize Honeycomb Edge client in `utils/constants.ts`
* [x] Configure Solana wallet adapter context/provider
* [x] Add wallet connection UI (bottom-left sidebar button)

---

### ⚡ Wallet Faucet Feature

* [ ] Add "Request 1000 SOL" button to user profile page
* [ ] Create Function to simulate faucet deposit
  ```ts
  import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js@1.73.0"
  import { useWallet } from '@solana/wallet-adapter-react';

  const connection = new Connection(rpcUrl, "confirmed")
  const wallet = useWallet()
  // Airdrop 1000 SOL
  const airdropSignature = await connection.requestAirdrop(
    wallet.publickey,
    1000 * LAMPORTS_PER_SOL
  )
  await connection.confirmTransaction(airdropSignature)
  ```
* [ ] Show loading indicator and success/failure toast
* [ ] Add cooldown mechanism or prevent duplicate requests

---

### 🛠️ Onchain Profile Creation

* [ ] Create a serverless function (`createUserProfile.ts`) to:

  * Fetch new user data from Supabase
  * Use Honeycomb client to generate a transaction:

    ```ts
    const { createNewUserWithProfileTransaction } = await client.createNewUserWithProfileTransaction(...)
    ```
  * Send transaction using:

    ```ts
    await sendClientTransactions(client, wallet, txResponse);
    ```
* [ ] Trigger this function when a new user signs up:

  * (Option A) Call from Supabase edge function `on_new_user_create_profile`
  * (Option B) Trigger from frontend after wallet connection
* [ ] Ensure user info (name, bio, avatar) is passed from Supabase

---

### 🧪 Testing & Validation

* [ ] Ensure wallet connects and persists in app state
* [ ] Ensure onchain profile is correctly created for new users
* [ ] Confirm that faucet deposits SOL without double-funding
* [ ] Handle errors (e.g., wallet not connected, transaction rejected)

---


✅ Remember: Every time you complete a task, update `TASKS.md` and write a summary in `SUMMARY.md`.

