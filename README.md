# 90DRA - 90 Day Recomp App

A gamified 90-day body recomposition and transformation app with workout tracking, nutrition logging, habit tracking, mindset training, and community features.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Hosting**: Vercel

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Copy your **Project URL** and **anon public key** from Settings > API

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add the same environment variables in Vercel project settings.

## Features

- Dashboard with daily overview and progress tracking
- AI-powered workout program generation
- Nutrition tracking with AI meal analysis
- Dopamine habit tracker with gamification
- Brain training / mindset modules
- Progress charts and body measurements
- Community posts and engagement
