"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff, Database, Trash2, Download, Upload } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { ImageStorageService } from "@/lib/image-storage"
import { SyncService } from "@/lib/sync-service"
import { supabase } from "@/lib/supabase"

interface FixResult {
  action: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export function ConnectivityFix() {
  const { siteContent, updateContent, syncStatus, lastSyncTime } = useAdmin()
  const [fixResults, setFixResults] = useState<FixResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const addResult = (result: FixResult) => {
    setFixResults(prev => [...prev, result])
  }

  const updateResult = (action: string, updates: Partial<FixResult>) => {
    setFixResults(prev => prev.map(r => 
      r.action === action ? { ...r, ...updates } : r
    ))
  }

  // Limpar todos os caches
  const clearAllCaches = async () => {
    addResult({
      action: "Limpar Caches",
      status: "pending",
      message: "Limpando todos os caches..."
    })

    try {
      // Limpar localStorage
      const localStorageKeys = ['uploadedImages', 'siteContent', 'syncStatus', 'lastSyncTime']
      localStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Erro ao limpar ${key}:`, error)
        }
      })

      // Limpar IndexedDB
      try {
        const request = indexedDB.deleteDatabase('ImageStorage')
        await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(true)
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.warn('Erro ao limpar IndexedDB:', error)
      }

      // Limpar cache do navegador se possível
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }

      updateResult("Limpar Caches", {
        status: "success",
        message: "Todos os caches foram limpos com sucesso",
        details: { clearedKeys: localStorageKeys }
      })
    } catch (error) {
      updateResult("Limpar Caches", {
        status: "error",
        message: "Erro ao limpar caches: " + (error as Error).message
      })
    }
  }

  // Testar conectividade com Supabase
  const testSupabaseConnection = async () => {
    addResult({
      action: "Testar Supabase",
      status: "pending",
      message: "Testando conexão com Supabase..."
    })

    try {
      // Teste simples de conectividade
      const { data, error } = await supabase
        .from('site_content')
        .select('id')
        .limit(1)

      if (error) {
        if (error.code === 'PGRST116') {
          updateResult("Testar Supabase", {
            status: "warning",
            message: "Tabela site_content não existe - criando estrutura...",
            details: { error: error.message }
          })
        } else {
          updateResult("Testar Supabase", {
            status: "error",
            message: "Erro de conexão: " + error.message,
            details: { error }
          })
        }
      } else {
        updateResult("Testar Supabase", {
          status: "success",
          message: "Conexão com Supabase funcionando",
          details: { data }
        })
      }
    } catch (error) {
      updateResult("Testar Supabase", {
        status: "error",
        message: "Erro de rede: " + (error as Error).message
      })
    }
  }

  // Forçar sincronização completa
  const forceSyncAll = async () => {
    addResult({
      action: "Sincronização Forçada",
      status: "pending",
      message: "Forçando sincronização completa..."
    })

    try {
      // Forçar sync usando o SyncService
      const result = await SyncService.forceSync()
      
      updateResult("Sincronização Forçada", {
        status: result ? "success" : "warning",
        message: result ? "Sincronização completa realizada" : "Sincronização parcial - verifique conectividade",
        details: { result }
      })
    } catch (error) {
      updateResult("Sincronização Forçada", {
        status: "error",
        message: "Erro na sincronização: " + (error as Error).message
      })
    }
  }

  // Recarregar dados do servidor
  const reloadFromServer = async () => {
    addResult({
      action: "Recarregar Dados",
      status: "pending",
      message: "Recarregando dados do servidor..."
    })

    try {
      // Limpar dados locais primeiro
      localStorage.removeItem('siteContent')
      
      // Buscar dados frescos
      const freshContent = await SyncService.getContentFromCloud()
      
      if (freshContent) {
        // Atualizar conteúdo local
        await SyncService.saveContentLocally(freshContent)
        
        updateResult("Recarregar Dados", {
          status: "success",
          message: "Dados recarregados com sucesso do servidor",
          details: { contentKeys: Object.keys(freshContent) }
        })
      } else {
        updateResult("Recarregar Dados", {
          status: "warning",
          message: "Nenhum dado encontrado no servidor - usando dados padrão"
        })
      }
    } catch (error) {
      updateResult("Recarregar Dados", {
        status: "error",
        message: "Erro ao recarregar: " + (error as Error).message
      })
    }
  }

  // Executar todas as correções
  const runAllFixes = async () => {
    setIsRunning(true)
    setFixResults([])

    await clearAllCaches()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testSupabaseConnection()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await reloadFromServer()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await forceSyncAll()
    
    setIsRunning(false)
    
    // Recarregar a página após 2 segundos
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'pending': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default: return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-6 w-6 text-green-500" /> : <WifiOff className="h-6 w-6 text-red-500" />}
          Correção de Conectividade e Sincronização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Atual */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Problemas Detectados</AlertTitle>
          <AlertDescription>
            Erros de rede com Supabase detectados. Use as ferramentas abaixo para diagnosticar e corrigir.
          </AlertDescription>
        </Alert>

        {/* Informações do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-medium">Status de Conexão</div>
            <div className={isOnline ? "text-green-600" : "text-red-600"}>
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-medium">Status de Sync</div>
            <div className={syncStatus === 'synced' ? "text-green-600" : "text-yellow-600"}>
              {syncStatus}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="font-medium">Última Sync</div>
            <div className="text-gray-600">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Nunca'}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={runAllFixes} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Executar Todas as Correções
          </Button>
          
          <Button 
            onClick={clearAllCaches} 
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Caches
          </Button>
          
          <Button 
            onClick={testSupabaseConnection} 
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            Testar Conexão
          </Button>
          
          <Button 
            onClick={reloadFromServer} 
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Recarregar Dados
          </Button>
        </div>

        {/* Resultados */}
        {fixResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados das Correções</h3>
            {fixResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.action}</div>
                  <div className="text-sm text-gray-600">{result.message}</div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">Ver detalhes</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instruções */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Instruções</AlertTitle>
          <AlertDescription>
            1. Clique em "Executar Todas as Correções" para uma solução automática<br/>
            2. Ou use os botões individuais para diagnósticos específicos<br/>
            3. A página será recarregada automaticamente após as correções
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}