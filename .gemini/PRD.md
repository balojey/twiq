---

# 📄 Product Requirements Document

**Product Name**: Twiq
**Prepared By**: Ademola
**Stack**: React + Vite + shadcn + TailwindCSS + Supabase

---

## 1. 🎯 Purpose

Twiq is a production-ready microblogging platform inspired by Twitter but enhanced with gamification to improve engagement, retention, and user discovery. It allows users to post short messages ("tweets"), follow others, and engage through likes and retweets — all while earning XP, leveling up, completing quests, and climbing a leaderboard.

---

## 2. 🧑‍💻 Target Users

* Social media enthusiasts seeking fresh platforms
* Gamified community builders (e.g., DAOs, fandoms)
* Gen Z users drawn to rewarding engagement loops
* Developers, creators, or hobbyists testing social platform engagement strategies

---

## 3. 🔧 Core Features

### A. **Authentication & Profiles**

* Sign in/up via Supabase Auth (Email + GitHub OAuth)
* Profile setup with avatar, bio, and handle
* XP points and level displayed on profile
* User settings (e.g., update profile, change password)

### B. **Tweeting System**

* Post a tweet (280 char limit)
* Optional media (image upload to Supabase Storage)
* Like, comment, and retweet functionality
* Thread support (nested tweets)

### C. **Gamification Mechanics**

* Earn XP for:

  * Posting a tweet (+10 XP)
  * Getting a like (+5 XP)
  * Getting a retweet (+10 XP)
  * Daily login bonus (+20 XP)
* Quests (e.g., "Post 5 tweets today", "Get 3 likes on a tweet")
* Levels unlock badges or small cosmetic effects
* Leaderboard showcasing top users this week/month

### D. **UI/UX Elements**

* Modal-based GitHub login (non-dismissible until authenticated)
* Responsive dark/light theme (tailored with Tailwind)
* Bottom-left floating XP progress bar
* Notification toasts for XP gains and quest completions
* Bottom sidebar button: “Connect Wallet” (optional future integration)

### E. **Feed**

* Public timeline: Latest tweets by all users
* Following timeline: Tweets only from followed users
* Popular timeline: Most liked/retweeted tweets today
* Infinite scrolling or pagination

---

## 4. 🎨 UI Design Guidelines

* Built with **shadcn** UI components
* Styled using **TailwindCSS** with design tokens (spacing, font sizes, colors)
* Use motion (Framer Motion) for tweet animations, XP pop-ups, modal transitions
* Minimal, game-like, but not childish — modern, professional aesthetic
* XP and quest notifications should be “gamey” but subtle (e.g., floating +10 XP)

---

## 5. 🧱 Tech Stack

| Layer         | Tool/Service                                       |
| ------------- | -------------------------------------------------- |
| Frontend      | React + Vite                                       |
| UI Components | shadcn + TailwindCSS                               |
| Backend       | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Auth          | Supabase Auth (GitHub + Email)                     |
| DB            | Supabase PostgreSQL                                |
| Storage       | Supabase for media                                 |
| Animation     | Framer Motion                                      |

---

## 6. 📊 Database Schema (Simplified)

```sql
-- users
id UUID (PK)
username TEXT UNIQUE
avatar_url TEXT
bio TEXT
level INTEGER
xp INTEGER
created_at TIMESTAMP

-- tweets
id UUID (PK)
user_id UUID (FK to users)
content TEXT
media_url TEXT (optional)
parent_id UUID (nullable, for threads)
created_at TIMESTAMP

-- likes
id UUID (PK)
user_id UUID (FK)
tweet_id UUID (FK)

-- retweets
id UUID (PK)
user_id UUID (FK)
tweet_id UUID (FK)

-- quests
id UUID (PK)
title TEXT
description TEXT
xp_reward INTEGER
criteria JSONB
active BOOLEAN

-- user_quests
id UUID (PK)
user_id UUID
quest_id UUID
progress JSONB
completed_at TIMESTAMP (nullable)
```

---

## 7. 📈 Success Metrics

* **DAU/MAU** ratio
* **Average session length**
* **Quest completion rate**
* **Tweet/like ratio per user**
* **Level distribution spread**

---

## 8. 🗺️ Roadmap (v1 → v2+)

### v1 (MVP)

* Auth, tweet feed, basic gamification, leaderboard, XP
* Responsive UI, GitHub login modal
* Public timeline

### v2

* Quest engine + quest builder
* Notifications (likes, retweets, XP)
* Media support
* Private messages (DMs)
* Solana wallet connection (and gated XP boosts)

---

## 9. 🚨 Risks & Mitigation

| Risk                       | Mitigation                                           |
| -------------------------- | ---------------------------------------------------- |
| Abuse of gamified rewards  | Throttling actions, cooldowns, XP caps               |
| Spam tweets                | Rate limiting, spam detection logic                  |
| Security of XP/Level logic | Handle logic server-side via Supabase edge functions |

---