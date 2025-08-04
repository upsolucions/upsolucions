"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { Cliente, Solicitacao, ClienteImagem, ClientePreferencias } from "@/types/cliente"
import { clienteService } from "@/lib/cliente-service"

interface ClienteContextType {
  cliente: Cliente | null
  solicitacoes: Solicitacao[]
  imagens: ClienteImagem[]
  preferencias: ClientePreferencias | null
  loading: boolean
  error: string | null
  buscarCliente: (documento: string) => Promise<Cliente | null>
  criarSolicitacao: (dados: Partial<Solicitacao>) => Promise<Solicitacao | null>
  carregarSolicitacoes: (clienteId: string) => Promise<void>
  carregarImagens: (clienteId: string) => Promise<void>
  carregarPreferencias: (clienteId: string) => Promise<void>
  salvarImagem: (imagem: Partial<ClienteImagem>) => Promise<ClienteImagem | null>
  excluirImagem: (id: string) => Promise<boolean>
  salvarPreferencias: (prefs: Partial<ClientePreferencias>) => Promise<ClientePreferencias | null>
  limparDados: () => void
}

const ClienteContext = createContext<ClienteContextType | undefined>(undefined)

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [imagens, setImagens] = useState<ClienteImagem[]>([])
  const [preferencias, setPreferencias] = useState<ClientePreferencias | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const carregarSolicitacoes = useCallback(async (clienteId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const solicitacoesCliente = await clienteService.getSolicitacoesByCliente(clienteId)
      setSolicitacoes(solicitacoesCliente)
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err)
      setError("Não foi possível carregar as solicitações.")
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarImagens = useCallback(async (clienteId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const imagensCliente = await clienteService.getClienteImagens(clienteId)
      setImagens(imagensCliente)
    } catch (err) {
      console.error("Erro ao carregar imagens:", err)
      setError("Não foi possível carregar as imagens.")
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarPreferencias = useCallback(async (clienteId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const prefsCliente = await clienteService.getClientePreferencias(clienteId)
      setPreferencias(prefsCliente)
    } catch (err) {
      console.error("Erro ao carregar preferências:", err)
      setError("Não foi possível carregar as preferências.")
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarCliente = useCallback(async (documento: string): Promise<Cliente | null> => {
    setLoading(true)
    setError(null)
    try {
      const clienteEncontrado = await clienteService.getClienteByDocumento(documento)
      setCliente(clienteEncontrado)
      
      if (clienteEncontrado) {
        localStorage.setItem("clienteId", clienteEncontrado.id)
        await Promise.all([
          carregarSolicitacoes(clienteEncontrado.id),
          carregarImagens(clienteEncontrado.id),
          carregarPreferencias(clienteEncontrado.id)
        ])
      }
      
      return clienteEncontrado
    } catch (err) {
      console.error("Erro ao buscar cliente:", err)
      setError("Não foi possível buscar os dados do cliente.")
      return null
    } finally {
      setLoading(false)
    }
  }, [carregarSolicitacoes, carregarImagens, carregarPreferencias])

  const criarSolicitacao = useCallback(async (dados: Partial<Solicitacao>): Promise<Solicitacao | null> => {
    setLoading(true)
    setError(null)
    try {
      const novaSolicitacao = await clienteService.createSolicitacao(dados)
      
      if (novaSolicitacao && cliente) {
        setSolicitacoes(prevSolicitacoes => [novaSolicitacao, ...prevSolicitacoes])
      }
      
      return novaSolicitacao
    } catch (err) {
      console.error("Erro ao criar solicitação:", err)
      setError("Não foi possível criar a solicitação.")
      return null
    } finally {
      setLoading(false)
    }
  }, [cliente])

  // useEffect para carregar dados do cliente salvo no localStorage
  useEffect(() => {
    const clienteId = localStorage.getItem("clienteId")
    if (clienteId) {
      Promise.all([
        carregarSolicitacoes(clienteId),
        carregarImagens(clienteId),
        carregarPreferencias(clienteId)
      ])
    }
  }, [carregarSolicitacoes, carregarImagens, carregarPreferencias])

  const salvarImagem = async (imagem: Partial<ClienteImagem>): Promise<ClienteImagem | null> => {
    setLoading(true)
    setError(null)
    try {
      const novaImagem = await clienteService.saveClienteImagem(imagem)
      if (novaImagem) {
        setImagens([novaImagem, ...imagens])
      }
      return novaImagem
    } catch (err) {
      console.error("Erro ao salvar imagem:", err)
      setError("Não foi possível salvar a imagem.")
      return null
    } finally {
      setLoading(false)
    }
  }

  const excluirImagem = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const sucesso = await clienteService.deleteClienteImagem(id)
      if (sucesso) {
        setImagens(imagens.filter(img => img.id !== id))
      }
      return sucesso
    } catch (err) {
      console.error("Erro ao excluir imagem:", err)
      setError("Não foi possível excluir a imagem.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const salvarPreferencias = async (prefs: Partial<ClientePreferencias>): Promise<ClientePreferencias | null> => {
    setLoading(true)
    setError(null)
    try {
      const novasPrefs = await clienteService.saveClientePreferencias(prefs)
      if (novasPrefs) {
        setPreferencias(novasPrefs)
      }
      return novasPrefs
    } catch (err) {
      console.error("Erro ao salvar preferências:", err)
      setError("Não foi possível salvar as preferências.")
      return null
    } finally {
      setLoading(false)
    }
  }

  const limparDados = () => {
    setCliente(null)
    setSolicitacoes([])
    setImagens([])
    setPreferencias(null)
    localStorage.removeItem("clienteId")
  }

  return (
    <ClienteContext.Provider
      value={{
        cliente,
        solicitacoes,
        imagens,
        preferencias,
        loading,
        error,
        buscarCliente,
        criarSolicitacao,
        carregarSolicitacoes,
        carregarImagens,
        carregarPreferencias,
        salvarImagem,
        excluirImagem,
        salvarPreferencias,
        limparDados
      }}
    >
      {children}
    </ClienteContext.Provider>
  )
}

export function useCliente() {
  const context = useContext(ClienteContext)
  if (context === undefined) {
    throw new Error("useCliente deve ser usado dentro de um ClienteProvider")
  }
  return context
}