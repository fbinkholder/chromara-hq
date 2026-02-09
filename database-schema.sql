-- Run this SQL in your Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pages table (for all workspaces - personal, partnerships, etc.)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  workspace_type TEXT NOT NULL CHECK (workspace_type IN ('personal', 'partnerships', 'competitive', 'content', 'engineering', 'brand', 'fundraising', 'reference')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach contacts table
CREATE TABLE outreach_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT,
  linkedin_url TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  segment TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_contacted', 'reached_out', 'responded', 'interested', 'declined', 'moving_forward')) DEFAULT 'not_contacted',
  outreach_variant TEXT,
  platform_used TEXT[],
  date_reached_out TIMESTAMP WITH TIME ZONE,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_followup TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  response_received BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content ideas table
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'youtube', 'facebook', 'blog')),
  topic TEXT NOT NULL,
  persuasion_principle TEXT,
  hook_type TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idea', 'drafted', 'scheduled', 'posted')) DEFAULT 'idea',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform strategies table
CREATE TABLE platform_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'youtube', 'facebook', 'blog')),
  strategy TEXT NOT NULL,
  cadence TEXT,
  tone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Agent logs table
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('research', 'social', 'outreach')),
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')) DEFAULT 'pending',
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_workspace_type ON pages(workspace_type);
CREATE INDEX idx_pages_parent_id ON pages(parent_id);
CREATE INDEX idx_outreach_contacts_user_id ON outreach_contacts(user_id);
CREATE INDEX idx_outreach_contacts_status ON outreach_contacts(status);
CREATE INDEX idx_content_ideas_user_id ON content_ideas(user_id);
CREATE INDEX idx_content_ideas_platform ON content_ideas(platform);
CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_agent_logs_agent_type ON agent_logs(agent_type);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view their own pages" ON pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pages" ON pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pages" ON pages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own contacts" ON outreach_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON outreach_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON outreach_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON outreach_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own content ideas" ON content_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content ideas" ON content_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content ideas" ON content_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content ideas" ON content_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own strategies" ON platform_strategies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own strategies" ON platform_strategies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own strategies" ON platform_strategies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own strategies" ON platform_strategies FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view agent logs" ON agent_logs FOR SELECT USING (true);
CREATE POLICY "System can insert agent logs" ON agent_logs FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outreach_contacts_updated_at BEFORE UPDATE ON outreach_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_ideas_updated_at BEFORE UPDATE ON content_ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_strategies_updated_at BEFORE UPDATE ON platform_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
