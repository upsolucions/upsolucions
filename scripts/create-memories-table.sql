-- Criar tabela memories
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários anônimos
CREATE POLICY "Leitura pública"
ON public.memories
FOR SELECT TO anon
USING (true);

-- Política adicional para permitir leitura para usuários autenticados
CREATE POLICY "Leitura autenticada"
ON public.memories
FOR SELECT TO authenticated
USING (true);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON public.memories
FOR EACH ROW
EXECUTE FUNCTION update_memories_updated_at();

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO public.memories (title, description, image_url) VALUES
('Primeira Memória', 'Uma descrição da primeira memória', '/placeholder.svg'),
('Segunda Memória', 'Uma descrição da segunda memória', '/placeholder.svg'),
('Terceira Memória', 'Uma descrição da terceira memória', '/placeholder.svg')
ON CONFLICT (id) DO NOTHING;

-- Comentários sobre as políticas RLS
-- A política "Leitura pública" permite que qualquer usuário anônimo (não autenticado)
-- possa ler todos os registros da tabela memories
-- Isso significa que qualquer navegador pode acessar os dados publicamente