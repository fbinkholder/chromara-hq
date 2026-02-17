-- Project-wide backup: store a snapshot of all Chromara HQ localStorage data per user.
-- Run in Supabase SQL Editor once. Use "Backup to cloud" / "Restore from cloud" in the app.

DROP TABLE IF EXISTS user_cloud_backup CASCADE;

CREATE TABLE user_cloud_backup (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'localStorage',
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_user_cloud_backup_updated ON user_cloud_backup(updated_at);

ALTER TABLE user_cloud_backup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own backup" ON user_cloud_backup;
CREATE POLICY "Users manage own backup" ON user_cloud_backup FOR ALL USING (auth.uid() = user_id);
