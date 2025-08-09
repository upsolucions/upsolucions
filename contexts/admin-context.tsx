"use client"

import React from "react"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { siteContentService, supabase } from "@/lib/supabase"
import { ImageStorageService } from "@/lib/image-storage"
import { SyncService } from "@/lib/sync-service"

interface AdminContextType {
  isAdmin: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  siteContent: any
  updateContent: (path: string, value: any) => Promise<void>
  uploadImage: (contentPath: string, file: File) => Promise<string | null>
  isLoading: boolean
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error'
  lastSyncTime: string | null
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const defaultContent = {
  siteName: "Up Solicions",
  slogan: "Segurança Tecnológica",
  logo: "/up-solucions-logo.svg",
  backgrounds: {},
  hero: {
    title: "Segurança Tecnológica Profissional",
    subtitle:
      "Especialistas em sistemas de segurança, automação e tecnologia. Protegemos o que é mais importante para você.",
  },
  services: {
    title: "Nossos Serviços",
    subtitle: "Oferecemos uma ampla gama de serviços de segurança tecnológica para residências e empresas",
    items: [
      {
        title: "Instalação e Manutenção de Câmeras",
        description: "Sistemas de videomonitoramento profissionais",
        fullDescription:
          "Sistemas completos de videomonitoramento com câmeras HD, 4K e visão noturna. Instalação profissional e manutenção preventiva.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Controle de Acesso",
        description: "Soluções seguras para controle de entrada",
        fullDescription:
          "Sistemas eletrônicos para controle de entrada e saída com cartões, senhas e biometria. Ideal para empresas e condomínios.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Alarmes",
        description: "Sistemas de alarme residencial e comercial",
        fullDescription:
          "Sistemas de alarme residencial e comercial com sensores de movimento, abertura e sirenes. Monitoramento 24h disponível.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Interfones",
        description: "Comunicação segura e eficiente",
        fullDescription:
          "Interfones residenciais e prediais com vídeo e áudio. Modelos com abertura remota e integração com smartphones.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Totens de Autoatendimento",
        description: "Soluções interativas para empresas",
        fullDescription:
          "Totens interativos para autoatendimento em empresas, bancos e estabelecimentos comerciais. Soluções personalizadas.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Portaria Remota",
        description: "Monitoramento profissional 24h",
        fullDescription:
          "Serviços de portaria virtual com monitoramento remoto 24h. Atendimento profissional e controle de acesso à distância.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Cancelas",
        description: "Controle automático de veículos",
        fullDescription:
          "Cancelas automáticas para controle de veículos em estacionamentos, condomínios e empresas. Modelos eletrônicos e hidráulicos.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Portões Automáticos",
        description: "Automatização de portões",
        fullDescription:
          "Automatização de portões residenciais e industriais. Motores, controles remotos e sistemas de segurança integrados.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Leitoras Facial",
        description: "Reconhecimento facial avançado",
        fullDescription:
          "Sistemas de reconhecimento facial para controle de acesso. Tecnologia avançada com alta precisão e velocidade.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Rede Estruturada (CPD)",
        description: "Infraestrutura de rede completa",
        fullDescription:
          "Projeto e instalação de redes estruturadas, cabeamento, racks e CPDs. Infraestrutura completa para sua empresa.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Manutenção de Computadores",
        description: "Suporte técnico especializado",
        fullDescription:
          "Serviços de manutenção preventiva e corretiva em computadores, notebooks e equipamentos de informática.",
        image: "/placeholder-200x300.svg",
      },
      {
        title: "Catracas e Torniquetes",
        description: "Controle de fluxo de pessoas",
        fullDescription:
          "Catracas eletrônicas e torniquetes para controle de fluxo de pessoas. Ideais para empresas, academias e eventos.",
        image: "/placeholder-200x300.svg",
      },
    ],
  },
  solutions: {
    title: "Nossas Soluções",
    subtitle: "Soluções inteligentes em automação e energia para sua casa ou empresa",
    items: [
      {
        title: "Automações de Energia Elétrica",
        description: "Sistemas inteligentes de energia",
        fullDescription:
          "Sistemas inteligentes de automação residencial e comercial. Controle de iluminação, tomadas, ar-condicionado e equipamentos elétricos através de aplicativos móveis. Economia de energia e maior conforto para seu dia a dia.",
        features: [
          "Controle via smartphone",
          "Programação de horários",
          "Sensores de presença",
          "Economia de energia",
          "Integração com assistentes virtuais",
        ],
        image: "/placeholder.svg",
      },
      {
        title: "Automações de Bombas d'água",
        description: "Controle automatizado de bombas",
        fullDescription:
          "Sistemas automatizados para controle de bombas d'água residenciais e industriais. Monitoramento de nível, pressão e funcionamento automático. Evita desperdícios e garante abastecimento constante.",
        features: [
          "Controle automático de nível",
          "Monitoramento de pressão",
          "Proteção contra funcionamento a seco",
          "Economia de água e energia",
          "Alertas via smartphone",
        ],
        image: "/placeholder.svg",
      },
      {
        title: "Instalação de Fonte para Carros Elétricos",
        description: "Pontos de recarga residencial e comercial",
        fullDescription:
          "Pontos de recarga residenciais e comerciais para veículos elétricos. Instalação profissional com todas as normas de segurança. Carregamento rápido e eficiente para seu carro elétrico.",
        features: [
          "Carregamento rápido e lento",
          "Instalação certificada",
          "Proteções elétricas",
          "Compatível com todos os modelos",
          "Monitoramento de consumo",
        ],
        image: "/placeholder.svg",
      },
    ],
  },
  faq: [
    {
      question: "Qual o prazo para instalação dos equipamentos?",
      answer: "O prazo varia conforme o projeto, mas geralmente entre 3 a 7 dias úteis após aprovação do orçamento.",
    },
    {
      question: "Vocês oferecem garantia nos serviços?",
      answer: "Sim, oferecemos garantia de 12 meses para instalações e 6 meses para manutenções.",
    },
    {
      question: "Atendem em toda região metropolitana?",
      answer: "Sim, atendemos toda a região metropolitana do Rio de Janeiro e cidades próximas.",
    },
    {
      question: "Fazem orçamento sem compromisso?",
      answer: "Sim, todos os nossos orçamentos são gratuitos e sem compromisso.",
    },
    {
      question: "Trabalham com que marcas de equipamentos?",
      answer: "Trabalhamos com as principais marcas do mercado: Intelbras, Hikvision, Dahua, entre outras.",
    },
  ],
  gallery: {
    title: "Galeria de Projetos",
    subtitle: "Conheça alguns dos nossos trabalhos realizados com excelência e qualidade",
    mainImages: [
      {
        src: "/placeholder.svg",
        alt: "Projeto de Instalação de Câmeras",
        title: "Sistema de Videomonitoramento - Empresa XYZ",
      },
      {
        src: "/placeholder.svg",
        alt: "Sistema de Controle de Acesso",
        title: "Controle de Acesso Biométrico - Condomínio ABC",
      },
      {
        src: "/placeholder.svg",
        alt: "Sistema de Alarme Residencial",
        title: "Alarme Residencial - Casa de Alto Padrão",
      },
      {
        src: "/placeholder.svg",
        alt: "Automação de Portão Elétrico",
        title: "Portão Automático - Residência Familiar",
      },
      {
        src: "/placeholder.svg",
        alt: "Rede Estruturada Escritório",
        title: "Cabeamento Estruturado - Escritório Corporativo",
      },
      {
        src: "/placeholder.svg",
        alt: "Automação Residencial",
        title: "Casa Inteligente - Automação Completa",
      },
    ],
    subGallery: Array.from({ length: 18 }, (_, i) => ({
      src: "/placeholder.svg",
      alt: `Projeto ${i + 1}`,
      title: `Projeto Realizado ${i + 1}`,
    })),
  },
  contact: {
    whatsapp: "(21) 97531-0179",
    email: "upsolucions@hotmail.com",
    instagram: "/instagram-qr.png",
  },
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [siteContent, setSiteContent] = useState(defaultContent)
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null) // Use useRef for mutable ref

  // Inicializar SyncService
  useEffect(() => {
    console.log('[AdminProvider] Inicializando SyncService...')
    SyncService.initialize()
    
    // Verificar status inicial
    const updateSyncStatus = () => {
      if (!navigator.onLine) {
        setSyncStatus('offline')
      } else {
        const lastSync = localStorage.getItem('lastSuccessfulSync')
        if (lastSync) {
          setLastSyncTime(lastSync)
          setSyncStatus('synced')
        }
      }
    }
    
    updateSyncStatus()
    
    // Listeners para mudanças de conectividade
    const handleOnline = () => {
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('synced'), 2000)
    }
    
    const handleOffline = () => {
      setSyncStatus('offline')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const loadContentAndSetupRealtime = async () => {
      console.log("[AdminProvider] Iniciando carregamento de conteúdo e setup do Realtime.")
      try {
        // 1. Carregar status de admin do localStorage
        if (typeof window !== "undefined") {
          const adminStatus = localStorage.getItem("isAdmin")
          if (adminStatus === "true") {
            setIsAdmin(true)
            console.log("[AdminProvider] Status de admin carregado do localStorage: true.")
          }
        }

        // 2. Usar o sistema de sincronização aprimorado
        try {
          console.log("[AdminProvider] Carregando conteúdo via SyncService...")
          const content = await siteContentService.getSiteContent()
          if (content) {
            const mergedContent = { ...defaultContent, ...content }
            setSiteContent(mergedContent)
            console.log("[AdminProvider] Conteúdo carregado e mesclado com sucesso.")
          } else {
            console.log("[AdminProvider] Usando conteúdo padrão.")
            setSiteContent(defaultContent)
          }
        } catch (dbError) {
          console.warn("[AdminProvider] Falha no carregamento - usando conteúdo padrão:", dbError)
          setSiteContent(defaultContent)
        }
      } catch (error) {
        console.error("[AdminProvider] Erro geral ao carregar conteúdo:", error)
        setSiteContent(defaultContent)
      } finally {
        setIsLoading(false)
        console.log("[AdminProvider] Carregamento inicial concluído.")
      }
    }

    loadContentAndSetupRealtime()

    // 3. Set up Supabase Realtime subscription for continuous updates
    console.log("[AdminProvider] Configurando Realtime Subscription...")
    const channel = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_content", filter: `id=eq.main` },
        (payload) => {
          console.log("[AdminProvider] Realtime: Mudança detectada no site_content!", payload)
          const updatedContent = payload.new.content
          setSiteContent((prevContent) => {
            const mergedContent = { ...defaultContent, ...updatedContent }
            // Only update if content has actually changed to avoid unnecessary re-renders
            if (JSON.stringify(prevContent) !== JSON.stringify(mergedContent)) {
              if (typeof window !== "undefined") {
                localStorage.setItem("siteContent", JSON.stringify(mergedContent))
              }
              console.log("[AdminProvider] Realtime: Conteúdo atualizado via subscription.", mergedContent)
              return mergedContent
            }
            console.log("[AdminProvider] Realtime: Conteúdo inalterado, ignorando atualização.")
            return prevContent
          })
        },
      )
      .subscribe()

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      console.log("[AdminProvider] Desinscrevendo do canal Realtime.")
      channel.unsubscribe()
    }
  }, [])

  const login = useCallback((username: string, password: string) => {
    if (username === "admin" && password === "777696") {
      setIsAdmin(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("isAdmin", "true")
      }
      console.log("[AdminContext] Login bem-sucedido.")
      return true
    }
    console.log("[AdminContext] Login falhou: credenciais inválidas.")
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAdmin(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAdmin")
    }
    console.log("[AdminContext] Logout realizado.")
  }, [])

  // updateContent com sistema de sincronização aprimorado
  const updateContent = useCallback(async (path: string, value: any) => {
    setSiteContent((prevContent) => {
      const newContent = { ...prevContent }
      const keys = path.split(".")
      let current: any = newContent

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      console.log(`[AdminContext] updateContent: Atualizando estado local para path '${path}' com valor:`, value)

      // Usar o sistema de sincronização aprimorado
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(async () => {
        try {
          setSyncStatus('syncing')
          console.log("[AdminContext] updateContent: Salvando conteúdo via SyncService (debounced)...")
          const success = await siteContentService.updateSiteContent(newContent)
          if (!success) {
            console.warn("[AdminContext] updateContent: Falha ao salvar - conteúdo mantido localmente.")
            setSyncStatus('error')
            setTimeout(() => setSyncStatus('offline'), 3000)
          } else {
            console.log("[AdminContext] updateContent: Conteúdo sincronizado com sucesso.")
            setSyncStatus('synced')
            setLastSyncTime(new Date().toISOString())
          }
        } catch (error) {
          console.error("[AdminContext] updateContent: Erro ao sincronizar (mantido localmente):", error)
          setSyncStatus('error')
          setTimeout(() => setSyncStatus('offline'), 3000)
        }
      }, 1500) // Aumentado para 1.5s para reduzir chamadas

      return newContent
    })
  }, [])

  const uploadImage = useCallback(
    async (contentPath: string, file: File): Promise<string | null> => {
      console.log(`[AdminContext] uploadImage: Iniciando upload para contentPath: '${contentPath}' e arquivo:`, file)
      try {
        // Validate file
        if (!file.type.startsWith("image/")) {
          console.error("[AdminContext] uploadImage: Erro de validação: Não é um arquivo de imagem.")
          throw new Error("Por favor, selecione apenas arquivos de imagem.")
        }
        if (file.size > 5 * 1024 * 1024) {
          console.error("[AdminContext] uploadImage: Erro de validação: Arquivo muito grande (>5MB).")
          throw new Error("Arquivo muito grande. Máximo 5MB.")
        }

        // Gerar chave única para a imagem
        const imageKey = ImageStorageService.generateImageKey(contentPath, file.name)

        // Construct a unique storage path based on contentPath and timestamp
        const fileExt = file.name.split(".").pop()
        const sanitizedContentPath = contentPath.replace(/[^a-zA-Z0-9]/g, "_") // Sanitize for storage path
        const storageFileName = `${sanitizedContentPath}-${Date.now()}.${fileExt}`
        const storageFilePath = `images/${storageFileName}` // Full path in the bucket
        console.log(`[AdminContext] uploadImage: Caminho de armazenamento gerado: '${storageFilePath}'`)

        // Attempt Supabase storage upload
        console.log("[AdminContext] uploadImage: Chamando siteContentService.uploadImage...")
        const newImageUrl = await siteContentService.uploadImage(file, storageFilePath)

        if (newImageUrl) {
          console.log("[AdminContext] uploadImage: Imagem enviada para Supabase Storage com sucesso. URL:", newImageUrl)
          
          // Salvar também no sistema de cache robusto
          try {
            const dataUrl = await ImageStorageService.fileToDataUrl(file)
            await ImageStorageService.saveImage(imageKey, dataUrl, {
              originalName: file.name,
              contentPath: contentPath,
              storagePath: storageFilePath,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
              finalUrl: newImageUrl
            })
            console.log(`[AdminContext] Imagem salva no cache: ${imageKey}`)
          } catch (cacheError) {
            console.warn('[AdminContext] Erro ao salvar no cache:', cacheError)
          }
          
          // Update content in the database with the new public URL
          // This will trigger the Realtime listener on other clients.
          await updateContent(contentPath, newImageUrl)
          console.log("[AdminContext] uploadImage: updateContent chamado com a nova URL.")
          return newImageUrl
        } else {
          console.error("[AdminContext] uploadImage: Falha ao enviar imagem para Supabase Storage. Retornando null.")
          return null
        }
      } catch (error) {
        console.error("[AdminContext] uploadImage: Erro geral no processo de upload:", error)
        throw error
      }
    },
    [updateContent],
  )

  const contextValue = useMemo(
    () => ({
      isAdmin,
      login,
      logout,
      siteContent,
      updateContent,
      uploadImage,
      isLoading,
      syncStatus,
      lastSyncTime,
    }),
    [isAdmin, siteContent, isLoading, syncStatus, lastSyncTime, login, logout, updateContent, uploadImage],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Carregando conteúdo...</p>
        </div>
      </div>
    )
  }

  return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}
