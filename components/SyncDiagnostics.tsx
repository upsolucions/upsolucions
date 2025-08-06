"use client"

import { useState, useEffect } from 'react'
import { SyncService } from '../lib/sync-service'
import { supabase } from '../lib/supabase'

interface DiagnosticInfo {
  supabaseUrl: string
  isSupabaseConfigured: boolean
  isOnline: boolean
  localStorageSize: number
  lastSync: Date | null
  hasPendingChanges: boolean
  canConnectToSupabase: boolean
}

export default function SyncDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const syncStatus = SyncService.getSyncStatus()
      
      // Testar conexão com Supabase
      let canConnectToSupabase = false
      try {
        const { error } = await supabase.from('site_content').select('id').limit(1)
        canConnectToSupabase = !error
      } catch {
        canConnectToSupabase = false
      }
      
      // Calcular tamanho do localStorage
      let localStorageSize = 0
      if (typeof window !== 'undefined') {
        try {
          const siteContent = localStorage.getItem('siteContent')
          localStorageSize = siteContent ? new Blob([siteContent]).size : 0
        } catch {
          localStorageSize = 0
        }
      }
      
      setDiagnostics({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado',
        isSupabaseConfigured: syncStatus.isSupabaseConfigured,
        isOnline: syncStatus.isOnline,
        localStorageSize,
        lastSync: syncStatus.lastSync,
        hasPendingChanges: syncStatus.hasPendingChanges,
        canConnectToSupabase
      })
    } catch (error) {
      console.error('Erro ao executar diagnósticos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      runDiagnostics()
    }
  }, [isOpen])

  const handleForceSync = async () => {
    setIsLoading(true)
    try {
      const success = await SyncService.forcSync()
      if (success) {
        await runDiagnostics()
        alert('Sincronização forçada com sucesso!')
      } else {
        alert('Falha na sincronização. Verifique a configuração do Supabase.')
      }
    } catch (error) {
      alert('Erro na sincronização: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearLocalData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
      SyncService.clearLocalData()
      runDiagnostics()
      alert('Dados locais limpos com sucesso!')
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Diagnósticos de Sincronização"
      >
        🔧
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Diagnósticos de Sincronização</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Executando diagnósticos...</p>
            </div>
          ) : diagnostics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Status da Conexão</h3>
                  <div className="space-y-2 text-sm">
                    <div>Online: {getStatusIcon(diagnostics.isOnline)} {diagnostics.isOnline ? 'Sim' : 'Não'}</div>
                    <div>Supabase Configurado: {getStatusIcon(diagnostics.isSupabaseConfigured)} {diagnostics.isSupabaseConfigured ? 'Sim' : 'Não'}</div>
                    <div>Conexão com Supabase: {getStatusIcon(diagnostics.canConnectToSupabase)} {diagnostics.canConnectToSupabase ? 'OK' : 'Falha'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Status dos Dados</h3>
                  <div className="space-y-2 text-sm">
                    <div>Mudanças Pendentes: {getStatusIcon(!diagnostics.hasPendingChanges)} {diagnostics.hasPendingChanges ? 'Sim' : 'Não'}</div>
                    <div>Tamanho Local: {formatBytes(diagnostics.localStorageSize)}</div>
                    <div>Última Sync: {diagnostics.lastSync ? diagnostics.lastSync.toLocaleString() : 'Nunca'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Configuração</h3>
                <div className="text-sm">
                  <div className="break-all">URL Supabase: {diagnostics.supabaseUrl}</div>
                </div>
              </div>

              {!diagnostics.isSupabaseConfigured && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Supabase Não Configurado</h3>
                  <p className="text-yellow-700 text-sm mb-3">
                    Para habilitar a sincronização entre dispositivos, você precisa configurar o Supabase.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Execute: <code className="bg-yellow-100 px-2 py-1 rounded">node scripts/setup-supabase.js</code>
                  </p>
                </div>
              )}

              {!diagnostics.canConnectToSupabase && diagnostics.isSupabaseConfigured && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Erro de Conexão</h3>
                  <p className="text-red-700 text-sm">
                    Não foi possível conectar ao Supabase. Verifique suas credenciais e se as tabelas foram criadas.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={runDiagnostics}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Atualizar
                </button>
                
                {diagnostics.isSupabaseConfigured && (
                  <button
                    onClick={handleForceSync}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Forçar Sync
                  </button>
                )}
                
                <button
                  onClick={handleClearLocalData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Limpar Dados
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>Erro ao carregar diagnósticos</p>
              <button
                onClick={runDiagnostics}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}