# Guia de Resolução de Problemas de Sincronização

## Problema Identificado

As modificações feitas pelo administrador (cores, imagens de fundo, imagens de contato) não estão sendo sincronizadas entre navegadores e dispositivos móveis.

## Causa Principal

O Supabase não está configurado corretamente. O arquivo `.env.local` está usando valores de desenvolvimento local que não permitem sincronização real.

## Solução Passo a Passo

### 1. Configurar o Supabase

#### Opção A: Script Automático (Recomendado)
```bash
node scripts/setup-supabase.js
```

#### Opção B: Configuração Manual

1. **Criar projeto no Supabase:**
   - Acesse https://supabase.com/dashboard
   - Clique em "New Project"
   - Escolha um nome (ex: `up-solucions-site`)
   - Aguarde a criação

2. **Obter credenciais:**
   - Vá em Settings > API
   - Copie a "URL" e "anon/public key"

3. **Atualizar .env.local:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
   ```

### 2. Configurar Tabelas no Supabase

No SQL Editor do Supabase, execute:

```sql
-- Criar tabela para conteúdo do site
CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública" ON site_content
  FOR SELECT USING (true);

-- Política para permitir escrita pública
CREATE POLICY "Permitir escrita pública" ON site_content
  FOR ALL USING (true);

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para upload de imagens
CREATE POLICY "Permitir upload de imagens" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-images');

-- Política para leitura de imagens
CREATE POLICY "Permitir leitura de imagens" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

-- Inserir conteúdo inicial
INSERT INTO site_content (id, content)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

## Como Verificar se Funcionou

### Indicadores Visuais

1. **Status de Sincronização (canto inferior esquerdo):**
   - 🟢 Verde: Sincronizado
   - 🟡 Amarelo: Apenas local (Supabase não configurado)
   - 🔴 Vermelho: Offline
   - 🟠 Laranja: Sincronizando

2. **Diagnósticos (botão 🔧 no canto inferior direito):**
   - Mostra status detalhado
   - Permite forçar sincronização
   - Exibe erros de conexão

### Teste de Sincronização

1. **Abra o site em dois navegadores diferentes**
2. **Faça login como admin em ambos** (admin/777696)
3. **Mude uma cor ou imagem em um navegador**
4. **Verifique se a mudança aparece no outro navegador**

## Problemas Específicos e Soluções

### Cores Não Mudam

**Causa:** Sincronização não configurada ou falha na atualização do estado.

**Solução:**
1. Verificar se Supabase está configurado
2. Usar diagnósticos para forçar sincronização
3. Limpar cache do navegador se necessário

### Upload de Imagens Não Funciona

**Causa:** Bucket do Supabase Storage não configurado.

**Solução:**
1. Executar o SQL de configuração completo
2. Verificar políticas de storage
3. Em desenvolvimento, as imagens são salvas como Data URL localmente

### Imagens de Contato (WhatsApp, Telefone, Email)

**Causa:** Componentes específicos podem não estar usando o sistema de upload correto.

**Solução:**
1. Verificar se os componentes usam o `uploadImage` do contexto admin
2. Confirmar que os paths estão corretos
3. Usar diagnósticos para verificar status

## Monitoramento Contínuo

### Logs do Console

Abra o DevTools (F12) e monitore:
- `[SyncService]`: Logs de sincronização
- `[AdminContext]`: Logs de atualizações de conteúdo
- `[siteContentService]`: Logs de upload de imagens

### Status em Tempo Real

O componente `SyncStatus` mostra o estado atual:
- Conexão online/offline
- Status do Supabase
- Última sincronização
- Mudanças pendentes

## Comandos Úteis

```bash
# Configurar Supabase
node scripts/setup-supabase.js

# Reiniciar servidor
npm run dev

# Limpar cache do Next.js
npm run build

# Verificar logs em tempo real
# (Abrir DevTools no navegador)
```

## Suporte Adicional

Se os problemas persistirem:

1. **Use o componente de diagnósticos** (🔧) para informações detalhadas
2. **Verifique os logs do console** para erros específicos
3. **Confirme que as credenciais do Supabase estão corretas**
4. **Teste a conectividade** com o Supabase Dashboard

## Arquitetura da Sincronização

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Navegador A   │    │    Supabase     │    │   Navegador B   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │LocalStorage │◄┼────┼►│site_content │◄┼────┼►│LocalStorage │ │
│ └─────────────┘ │    │ │   (JSONB)   │ │    │ └─────────────┘ │
│                 │    │ └─────────────┘ │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ IndexedDB   │◄┼────┼►│site-images  │◄┼────┼►│ IndexedDB   │ │
│ │ (Imagens)   │ │    │ │  (Storage)  │ │    │ │ (Imagens)   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

A sincronização funciona através de:
1. **Armazenamento local** para performance e modo offline
2. **Supabase Realtime** para sincronização automática
3. **Fallback robusto** quando a conexão falha