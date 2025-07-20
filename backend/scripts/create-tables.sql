-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for site_content table
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON site_content
  FOR SELECT USING (true);

-- Allow public insert/update (you might want to restrict this in production)
CREATE POLICY "Allow public write access" ON site_content
  FOR ALL USING (true);

-- Set up storage policies
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-images');
