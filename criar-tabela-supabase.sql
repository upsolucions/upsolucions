-- SQL para criar a tabela site_content no Supabase
-- Execute este código no SQL Editor do Supabase

-- Criar tabela para armazenar conteúdo do site
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access" ON site_content
  FOR SELECT USING (true);

-- Política para permitir escrita pública (ajuste conforme necessário em produção)
CREATE POLICY "Allow public write access" ON site_content
  FOR ALL USING (true);

-- Criar bucket para armazenamento de imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de imagens
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-images');

-- Inserir dados iniciais
INSERT INTO site_content (id, content)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;

-- Verificar se tudo foi criado corretamente
SELECT 'Tabela criada com sucesso!' as status;
SELECT * FROM site_content WHERE id = 'main';