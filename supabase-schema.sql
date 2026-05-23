-- ============================================================
-- STREAK BATTLE — Supabase Database Schema
-- Supabase SQL Editor da bu kodni ishga tushiring
-- ============================================================

-- Enable realtime for all tables
-- (Supabase dashboardda Table Settings > Realtime dan ham yoqish mumkin)

-- ── 1. DAILY TASKS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL CHECK (user_id IN ('muhammadyusuf', 'shavkatjon')),
  date DATE NOT NULL,
  
  -- Prayer (JSONB)
  prayer JSONB NOT NULL DEFAULT '{
    "fajr": false,
    "dhuhr": false,
    "asr": false,
    "maghrib": false,
    "isha": false,
    "fajr_time": null,
    "dhuhr_time": null,
    "asr_time": null,
    "maghrib_time": null,
    "isha_time": null
  }'::jsonb,

  -- Quran
  quran JSONB NOT NULL DEFAULT '{
    "surah_name": "",
    "ayah_from": 0,
    "ayah_to": 0,
    "completed": false
  }'::jsonb,

  -- Hadith
  hadith JSONB NOT NULL DEFAULT '{
    "text": "",
    "explained": false,
    "completed": false
  }'::jsonb,

  -- Podcast/Article
  podcast JSONB NOT NULL DEFAULT '{
    "title": "",
    "link": "",
    "summary": "",
    "completed": false
  }'::jsonb,

  -- Book
  book JSONB NOT NULL DEFAULT '{
    "title": "",
    "author": "",
    "pages_from": 0,
    "pages_to": 0,
    "completed": false
  }'::jsonb,

  -- Calisthenics
  calisthenics JSONB NOT NULL DEFAULT '{
    "exercises": "",
    "completed": false
  }'::jsonb,

  -- Zikr
  zikr JSONB NOT NULL DEFAULT '{
    "subhanallah": 0,
    "alhamdulillah": 0,
    "allahuakbar": 0,
    "completed": false
  }'::jsonb,

  -- Computed fields
  completed_count INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 7,
  momentum_points INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_tasks_updated_at
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. CUSTOM TASKS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL CHECK (user_id IN ('muhammadyusuf', 'shavkatjon')),
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. REACTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user TEXT NOT NULL CHECK (from_user IN ('muhammadyusuf', 'shavkatjon')),
  to_user TEXT NOT NULL CHECK (to_user IN ('muhammadyusuf', 'shavkatjon')),
  task_type TEXT NOT NULL,
  emoji TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_user != to_user)
);

-- ── 4. STREAKS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE CHECK (user_id IN ('muhammadyusuf', 'shavkatjon')),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_completed_days INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Hamma uchun o'qish va yozish (ikki foydalanuvchi uchun)
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Allow all (anon key orqali)
CREATE POLICY "allow_all_daily_tasks" ON daily_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_custom_tasks" ON custom_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reactions" ON reactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_streaks" ON streaks FOR ALL USING (true) WITH CHECK (true);

-- ── REALTIME ────────────────────────────────────────────────
-- Supabase dashboardda:
-- Database > Replication > Tables ni tanlang:
-- daily_tasks, custom_tasks, reactions, streaks

-- ── INITIAL DATA ────────────────────────────────────────────
INSERT INTO streaks (user_id, current_streak, longest_streak, total_completed_days)
VALUES 
  ('muhammadyusuf', 0, 0, 0),
  ('shavkatjon', 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;
