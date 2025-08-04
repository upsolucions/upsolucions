// Tipos para a área do cliente

export interface Cliente {
  id: string
  nome: string
  documento: string
  tipo_documento: 'cpf' | 'cnpj'
  telefone?: string
  email?: string
  imagens?: ClienteImagem[]
  preferencias?: ClientePreferencias
  created_at: string
  updated_at: string
}

export interface ClienteImagem {
  id: string
  cliente_id: string
  url: string
  titulo: string
  descricao?: string
  created_at: string
}

export interface ClientePreferencias {
  id: string
  cliente_id: string
  cor_primaria?: string
  cor_secundaria?: string
  cor_fundo?: string
  created_at: string
  updated_at: string
}

export interface Solicitacao {
  id: string
  numero_os: string
  cliente_id: string
  tipo: string
  descricao: string
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada'
  tecnico_id?: string
  data_agendamento?: string
  observacoes_tecnicas?: string
  created_at: string
  updated_at: string
}

export interface ContadorOS {
  id: string
  tipo: string
  ultimo_numero: number
  updated_at: string
}

export interface Notificacao {
  id: string
  ordem_servico_id: string
  tipo: 'criacao_os' | 'atualizacao_status' | 'agendamento'
  status: 'enviado' | 'falha'
  detalhes: Record<string, any>
  created_at: string
}

export interface Tecnico {
  id: string
  nome: string
  especialidade: string
  telefone: string
  email: string
  ativo: boolean
  created_at: string
  updated_at: string
}