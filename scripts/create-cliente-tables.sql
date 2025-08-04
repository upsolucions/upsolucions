-- Script para criar as tabelas necessárias para a área do cliente

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  documento TEXT NOT NULL UNIQUE,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('cpf', 'cnpj')),
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens do cliente
CREATE TABLE IF NOT EXISTS cliente_imagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências do cliente (cores, etc)
CREATE TABLE IF NOT EXISTS cliente_preferencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE UNIQUE,
  cor_primaria TEXT,
  cor_secundaria TEXT,
  cor_fundo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por documento
CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);

-- Tabela de solicitações/ordens de serviço
CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_os TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  tipo TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL CHECK (status IN ('Aberta', 'Em Andamento', 'Concluída', 'Cancelada')),
  tecnico_id UUID,
  data_agendamento TIMESTAMP WITH TIME ZONE,
  observacoes_tecnicas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para solicitações
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_id ON solicitacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_numero_os ON solicitacoes(numero_os);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);

-- Tabela para controle de contadores de OS por tipo
CREATE TABLE IF NOT EXISTS contador_os (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL UNIQUE,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  especialidade TEXT,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registro de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_servico_id TEXT NOT NULL REFERENCES solicitacoes(numero_os),
  tipo TEXT NOT NULL CHECK (tipo IN ('criacao_os', 'atualizacao_status', 'agendamento')),
  status TEXT NOT NULL CHECK (status IN ('enviado', 'falha')),
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar o campo updated_at
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitacoes_updated_at
BEFORE UPDATE ON solicitacoes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contador_os_updated_at
BEFORE UPDATE ON contador_os
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tecnicos_updated_at
BEFORE UPDATE ON tecnicos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
-- Ativar RLS nas tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contador_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_preferencias ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso anônimo (necessário para a área do cliente)
-- Política para permitir leitura de clientes por documento
CREATE POLICY select_clientes_by_documento ON clientes
FOR SELECT
TO anon
USING (true);

-- Política para permitir inserção de clientes
CREATE POLICY insert_clientes ON clientes
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir atualização de clientes
CREATE POLICY update_clientes ON clientes
FOR UPDATE
TO anon
USING (true);

-- Política para permitir leitura de solicitações
CREATE POLICY select_solicitacoes ON solicitacoes
FOR SELECT
TO anon
USING (true);

-- Política para permitir inserção de solicitações
CREATE POLICY insert_solicitacoes ON solicitacoes
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir atualização de solicitações
CREATE POLICY update_solicitacoes ON solicitacoes
FOR UPDATE
TO anon
USING (true);

-- Política para permitir leitura e atualização de contador_os
CREATE POLICY select_contador_os ON contador_os
FOR SELECT
TO anon
USING (true);

CREATE POLICY upsert_contador_os ON contador_os
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY update_contador_os ON contador_os
FOR UPDATE
TO anon
USING (true);

-- Política para permitir inserção de notificações
CREATE POLICY insert_notificacoes ON notificacoes
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para permitir leitura de notificações
CREATE POLICY select_notificacoes ON notificacoes
FOR SELECT
TO anon
USING (true);

-- Políticas para cliente_imagens
CREATE POLICY select_cliente_imagens ON cliente_imagens
FOR SELECT
TO anon
USING (true);

CREATE POLICY insert_cliente_imagens ON cliente_imagens
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY update_cliente_imagens ON cliente_imagens
FOR UPDATE
TO anon
USING (true);

CREATE POLICY delete_cliente_imagens ON cliente_imagens
FOR DELETE
TO anon
USING (true);

-- Políticas para cliente_preferencias
CREATE POLICY select_cliente_preferencias ON cliente_preferencias
FOR SELECT
TO anon
USING (true);

CREATE POLICY insert_cliente_preferencias ON cliente_preferencias
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY update_cliente_preferencias ON cliente_preferencias
FOR UPDATE
TO anon
USING (true);