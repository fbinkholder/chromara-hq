-- Content Management Suite - run in Supabase SQL Editor
-- Drops existing tables first (any data will be lost)

DROP TABLE IF EXISTS platform_strategies CASCADE;
DROP TABLE IF EXISTS keyword_library CASCADE;
DROP TABLE IF EXISTS hashtag_library CASCADE;
DROP TABLE IF EXISTS content_ideas CASCADE;

-- Content Ideas
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT[],
  category TEXT,
  content_type TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'in_progress', 'ready', 'scheduled', 'published')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  target_audience TEXT,
  keywords TEXT[],
  notes TEXT,
  draft_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hashtag Library
CREATE TABLE IF NOT EXISTS hashtag_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  hashtag TEXT NOT NULL,
  category TEXT,
  platform TEXT[],
  performance_score INT CHECK (performance_score BETWEEN 1 AND 10),
  estimated_reach TEXT,
  use_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Keyword Library
CREATE TABLE IF NOT EXISTS keyword_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  keyword TEXT NOT NULL,
  category TEXT,
  search_volume INT,
  competition TEXT CHECK (competition IN ('low', 'medium', 'high')),
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 10),
  use_case TEXT,
  related_keywords TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Strategies
CREATE TABLE IF NOT EXISTS platform_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'tiktok', 'pinterest', 'blog', 'email')),
  objective TEXT NOT NULL,
  target_audience TEXT,
  content_pillars TEXT[],
  posting_frequency TEXT,
  best_times_to_post TEXT[],
  content_formats TEXT[],
  key_metrics TEXT[],
  current_stats JSONB,
  goals JSONB,
  strategy_notes TEXT,
  examples TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_content_ideas_category ON content_ideas(category);
CREATE INDEX IF NOT EXISTS idx_hashtag_library_category ON hashtag_library(category);
CREATE INDEX IF NOT EXISTS idx_keyword_library_category ON keyword_library(category);
CREATE INDEX IF NOT EXISTS idx_platform_strategies_platform ON platform_strategies(platform);

-- RLS Policies
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own data" ON content_ideas;
CREATE POLICY "Users manage own data" ON content_ideas FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own data" ON hashtag_library;
CREATE POLICY "Users manage own data" ON hashtag_library FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own data" ON keyword_library;
CREATE POLICY "Users manage own data" ON keyword_library FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own data" ON platform_strategies;
CREATE POLICY "Users manage own data" ON platform_strategies FOR ALL USING (auth.uid() = user_id);
