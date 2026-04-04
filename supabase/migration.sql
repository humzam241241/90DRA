-- 90DRA Supabase Migration
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'user',
  program_start_date date default current_date,
  current_weight numeric,
  target_weight numeric,
  body_fat_percentage numeric,
  daily_protein_target numeric default 150,
  daily_carbs_target numeric default 200,
  daily_fats_target numeric default 60,
  daily_calories_target numeric default 2000,
  water_intake_target numeric default 3,
  height numeric,
  transformation_goal text,
  completed_workouts jsonb default '[]'::jsonb,
  completed_mindset_lessons jsonb default '[]'::jsonb,
  completed_mindset_challenges jsonb default '[]'::jsonb,
  mindset_xp integer default 0,
  mindset_level integer default 1,
  mindset_streak integer default 0,
  workout_xp integer default 0,
  nutrition_xp integer default 0,
  workout_preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- WORKOUTS
-- ============================================
create table if not exists workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  day_number integer not null,
  title text not null,
  category text not null check (category in ('strength', 'cardio', 'hiit', 'recovery', 'mobility')),
  duration_minutes integer,
  exercises jsonb default '[]'::jsonb,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz default now()
);

-- ============================================
-- NUTRITION LOGS
-- ============================================
create table if not exists nutrition_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name text,
  calories numeric default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fats numeric default 0,
  water_intake numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- PROGRESS ENTRIES
-- ============================================
create table if not exists progress_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  date date not null,
  weight numeric,
  body_fat_percentage numeric,
  mood_score integer check (mood_score between 1 and 10),
  energy_score integer check (energy_score between 1 and 10),
  confidence_score integer check (confidence_score between 1 and 10),
  measurements jsonb default '{}'::jsonb,
  notes text,
  photo_url text,
  created_at timestamptz default now()
);

-- ============================================
-- COMMUNITY POSTS
-- ============================================
create table if not exists community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  author_name text not null,
  post_type text not null check (post_type in ('win', 'milestone', 'motivation', 'question', 'progress_photo')),
  content text not null,
  image_url text,
  likes integer default 0,
  liked_by jsonb default '[]'::jsonb,
  day_number integer,
  created_at timestamptz default now()
);

-- ============================================
-- MINDSET LESSONS
-- ============================================
create table if not exists mindset_lessons (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  day_number integer not null,
  title text not null,
  brain_part text not null check (brain_part in (
    'prefrontal_cortex', 'amygdala', 'hippocampus',
    'basal_ganglia', 'nucleus_accumbens', 'hypothalamus', 'cerebellum'
  )),
  content text not null,
  key_takeaways jsonb default '[]'::jsonb,
  action_steps jsonb default '[]'::jsonb,
  reflection_prompts jsonb default '[]'::jsonb,
  duration_minutes integer,
  created_at timestamptz default now()
);

-- ============================================
-- JOURNALS
-- ============================================
create table if not exists journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  date date not null,
  reflection text,
  old_habit text,
  new_habit text,
  wins_today jsonb default '[]'::jsonb,
  challenges_faced text,
  gratitude jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- HABITS
-- ============================================
create table if not exists habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('good', 'bad')),
  category text,
  icon_emoji text default '✨',
  default_weight numeric default 5,
  default_duration integer default 30,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- HABIT LOGS
-- ============================================
create table if not exists habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  habit_id uuid references habits on delete cascade,
  timestamp timestamptz default now(),
  duration integer,
  intensity integer default 2,
  trigger text,
  feeling_after text,
  was_swap boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- DOPAMINE DAILY
-- ============================================
create table if not exists dopamine_daily (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  date date not null,
  score numeric default 0,
  good_total numeric default 0,
  bad_total numeric default 0,
  bonuses jsonb default '{}'::jsonb,
  habits_logged integer default 0,
  streak_green_days integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- SWAP MAPS
-- ============================================
create table if not exists swap_maps (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  bad_habit_id uuid references habits on delete cascade,
  good_habit_id uuid references habits on delete cascade,
  priority integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table nutrition_logs enable row level security;
alter table progress_entries enable row level security;
alter table community_posts enable row level security;
alter table mindset_lessons enable row level security;
alter table journals enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table dopamine_daily enable row level security;
alter table swap_maps enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Workouts: users can CRUD their own workouts
create policy "Users can view own workouts" on workouts for select using (auth.uid() = user_id);
create policy "Users can create own workouts" on workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts" on workouts for delete using (auth.uid() = user_id);

-- Nutrition logs: users can CRUD their own logs
create policy "Users can view own nutrition logs" on nutrition_logs for select using (auth.uid() = user_id);
create policy "Users can create own nutrition logs" on nutrition_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own nutrition logs" on nutrition_logs for update using (auth.uid() = user_id);
create policy "Users can delete own nutrition logs" on nutrition_logs for delete using (auth.uid() = user_id);

-- Progress entries: users can CRUD their own entries
create policy "Users can view own progress" on progress_entries for select using (auth.uid() = user_id);
create policy "Users can create own progress" on progress_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on progress_entries for update using (auth.uid() = user_id);
create policy "Users can delete own progress" on progress_entries for delete using (auth.uid() = user_id);

-- Community posts: all authenticated users can read, users can create/update their own
create policy "Anyone can view community posts" on community_posts for select using (auth.uid() is not null);
create policy "Users can create community posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update community posts" on community_posts for update using (auth.uid() is not null);

-- Mindset lessons: all authenticated users can read, users can create their own
create policy "Anyone can view mindset lessons" on mindset_lessons for select using (auth.uid() is not null);
create policy "Users can create mindset lessons" on mindset_lessons for insert with check (auth.uid() = user_id);
create policy "Users can update mindset lessons" on mindset_lessons for update using (auth.uid() = user_id);

-- Journals: users can CRUD their own
create policy "Users can view own journals" on journals for select using (auth.uid() = user_id);
create policy "Users can create own journals" on journals for insert with check (auth.uid() = user_id);
create policy "Users can update own journals" on journals for update using (auth.uid() = user_id);
create policy "Users can delete own journals" on journals for delete using (auth.uid() = user_id);

-- Habits: users can CRUD their own
create policy "Users can view own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can create own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on habits for delete using (auth.uid() = user_id);

-- Habit logs: users can CRUD their own
create policy "Users can view own habit logs" on habit_logs for select using (auth.uid() = user_id);
create policy "Users can create own habit logs" on habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own habit logs" on habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete own habit logs" on habit_logs for delete using (auth.uid() = user_id);

-- Dopamine daily: users can CRUD their own
create policy "Users can view own dopamine scores" on dopamine_daily for select using (auth.uid() = user_id);
create policy "Users can create own dopamine scores" on dopamine_daily for insert with check (auth.uid() = user_id);
create policy "Users can update own dopamine scores" on dopamine_daily for update using (auth.uid() = user_id);
create policy "Users can delete own dopamine scores" on dopamine_daily for delete using (auth.uid() = user_id);

-- Swap maps: users can CRUD their own
create policy "Users can view own swap maps" on swap_maps for select using (auth.uid() = user_id);
create policy "Users can create own swap maps" on swap_maps for insert with check (auth.uid() = user_id);
create policy "Users can update own swap maps" on swap_maps for update using (auth.uid() = user_id);
create policy "Users can delete own swap maps" on swap_maps for delete using (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, program_start_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    current_date
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================
create index if not exists idx_workouts_user_day on workouts(user_id, day_number);
create index if not exists idx_nutrition_logs_user_date on nutrition_logs(user_id, date);
create index if not exists idx_progress_entries_user_date on progress_entries(user_id, date);
create index if not exists idx_community_posts_created on community_posts(created_at desc);
create index if not exists idx_habits_user_active on habits(user_id, is_active);
create index if not exists idx_habit_logs_user on habit_logs(user_id, timestamp desc);
create index if not exists idx_dopamine_daily_user_date on dopamine_daily(user_id, date);
