import { supabase } from "./supabase"
import { Cliente, Solicitacao, ContadorOS, Notificacao, ClienteImagem, ClientePreferencias } from "@/types/cliente"

export const clienteService = {
  // Funções relacionadas a imagens do cliente
  async saveClienteImagem(imagem: Partial<ClienteImagem>): Promise<ClienteImagem | null> {
    const { data, error } = await supabase
      .from("cliente_imagens")
      .insert({
        cliente_id: imagem.cliente_id,
        url: imagem.url,
        titulo: imagem.titulo,
        descricao: imagem.descricao
      })
      .select()

    if (error) {
      console.error("Erro ao salvar imagem do cliente:", error)
      return null
    }

    return data[0] as ClienteImagem
  },

  async getClienteImagens(clienteId: string): Promise<ClienteImagem[]> {
    const { data, error } = await supabase
      .from("cliente_imagens")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar imagens do cliente:", error)
      return []
    }

    return data as ClienteImagem[]
  },

  async deleteClienteImagem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("cliente_imagens")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao excluir imagem do cliente:", error)
      return false
    }

    return true
  },

  // Funções relacionadas a preferências do cliente
  async saveClientePreferencias(prefs: Partial<ClientePreferencias>): Promise<ClientePreferencias | null> {
    const { data, error } = await supabase
      .from("cliente_preferencias")
      .upsert({
        cliente_id: prefs.cliente_id,
        cor_primaria: prefs.cor_primaria,
        cor_secundaria: prefs.cor_secundaria,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error("Erro ao salvar preferências do cliente:", error)
      return null
    }

    return data[0] as ClientePreferencias
  },

  async getClientePreferencias(clienteId: string): Promise<ClientePreferencias | null> {
    const { data, error } = await supabase
      .from("cliente_preferencias")
      .select("*")
      .eq("cliente_id", clienteId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar preferências do cliente:", error)
      return null
    }

    return data as ClientePreferencias | null
  },

  // Funções relacionadas a clientes
  async getClienteByDocumento(documento: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("documento", documento.replace(/\D/g, ""))
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar cliente:", error)
      return null
    }

    return data as Cliente | null
  },

  async createCliente(cliente: Partial<Cliente>): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome: cliente.nome,
        documento: cliente.documento?.replace(/\D/g, ""),
        tipo_documento: cliente.tipo_documento,
        telefone: cliente.telefone,
        email: cliente.email
      })
      .select()

    if (error) {
      console.error("Erro ao criar cliente:", error)
      return null
    }

    return data[0] as Cliente
  },

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<boolean> {
    const { error } = await supabase
      .from("clientes")
      .update({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar cliente:", error)
      return false
    }

    return true
  },

  // Funções relacionadas a solicitações
  async getSolicitacoesByCliente(clienteId: string): Promise<Solicitacao[]> {
    const { data, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar solicitações:", error)
      return []
    }

    return data as Solicitacao[]
  },

  async getSolicitacaoByNumeroOS(numeroOS: string): Promise<Solicitacao | null> {
    const { data, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .eq("numero_os", numeroOS)
      .single()

    if (error) {
      console.error("Erro ao buscar solicitação:", error)
      return null
    }

    return data as Solicitacao
  },

  async createSolicitacao(solicitacao: Partial<Solicitacao>): Promise<Solicitacao | null> {
    const { data, error } = await supabase
      .from("solicitacoes")
      .insert({
        numero_os: solicitacao.numero_os,
        cliente_id: solicitacao.cliente_id,
        tipo: solicitacao.tipo,
        descricao: solicitacao.descricao,
        status: "Aberta"
      })
      .select()

    if (error) {
      console.error("Erro ao criar solicitação:", error)
      return null
    }

    return data[0] as Solicitacao
  },

  async updateSolicitacaoStatus(
    id: string, 
    status: Solicitacao["status"], 
    observacoes?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status,
        observacoes_tecnicas: observacoes,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar status da solicitação:", error)
      return false
    }

    return true
  },

  // Funções relacionadas ao contador de OS
  async getUltimoNumeroOS(tipo: string): Promise<number> {
    const { data, error } = await supabase
      .from("contador_os")
      .select("ultimo_numero")
      .eq("tipo", tipo)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar último número de OS:", error)
      return 0
    }

    return data ? data.ultimo_numero : 0
  },

  async incrementarContadorOS(tipo: string, numero: number): Promise<boolean> {
    const { error } = await supabase
      .from("contador_os")
      .upsert({
        tipo,
        ultimo_numero: numero,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error("Erro ao incrementar contador de OS:", error)
      return false
    }

    return true
  },

  // Funções relacionadas a notificações
  async registrarNotificacao(notificacao: Partial<Notificacao>): Promise<boolean> {
    const { error } = await supabase
      .from("notificacoes")
      .insert({
        ordem_servico_id: notificacao.ordem_servico_id,
        tipo: notificacao.tipo,
        status: notificacao.status,
        detalhes: notificacao.detalhes
      })

    if (error) {
      console.error("Erro ao registrar notificação:", error)
      return false
    }

    return true
  },

  // Função para gerar número de OS
  async gerarNumeroOS(tipo: string): Promise<string> {
    try {
      // Buscar o último número de OS para este tipo
      const ultimoNumero = await this.getUltimoNumeroOS(tipo)
      const proximoNumero = ultimoNumero + 1

      // Atualizar o contador
      await this.incrementarContadorOS(tipo, proximoNumero)

      // Formatar o número da OS: TIPO-YYYYMMDD-NUMERO
      const hoje = new Date()
      const ano = hoje.getFullYear()
      const mes = String(hoje.getMonth() + 1).padStart(2, "0")
      const dia = String(hoje.getDate()).padStart(2, "0")
      const dataFormatada = `${ano}${mes}${dia}`
      
      return `${tipo.substring(0, 3).toUpperCase()}-${dataFormatada}-${String(proximoNumero).padStart(4, "0")}`
    } catch (error) {
      console.error("Erro ao gerar número de OS:", error)
      // Fallback para um número aleatório se houver erro
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
      return `${tipo.substring(0, 3).toUpperCase()}-${Date.now()}-${random}`
    }
  },

  // Função para enviar notificações
  async enviarNotificacoes(numeroOS: string, clienteData: any): Promise<boolean> {
    try {
      // Aqui você implementaria o envio de notificações por WhatsApp e email
      // Esta é uma simulação - na implementação real, você usaria APIs como Twilio, SendGrid, etc.
      console.log(`Enviando notificação para WhatsApp e email sobre a OS ${numeroOS}`)
      
      // Registrar a notificação no banco de dados
      await this.registrarNotificacao({
        ordem_servico_id: numeroOS,
        tipo: "criacao_os",
        status: "enviado",
        detalhes: {
          whatsapp: "enviado",
          email: "enviado",
          cliente: clienteData
        }
      })
      
      return true
    } catch (error) {
      console.error("Erro ao enviar notificações:", error)
      return false
    }
  }
}