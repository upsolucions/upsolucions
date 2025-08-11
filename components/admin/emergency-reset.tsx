"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Zap, Database, Trash2 } from "lucide-react"

export function EmergencyReset() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetSteps, setResetSteps] = useState<string[]>([])

  const addStep = (step: string) => {
    setResetSteps(prev => [...prev, step])
  }

  const performEmergencyReset = async () => {
    setIsResetting(true)
    setResetSteps([])

    try {
      addStep("🧹 Limpando localStorage...")
      // Limpar todo o localStorage
      localStorage.clear()
      await new Promise(resolve => setTimeout(resolve, 500))

      addStep("🗄️ Limpando sessionStorage...")
      // Limpar sessionStorage
      sessionStorage.clear()
      await new Promise(resolve => setTimeout(resolve, 500))

      addStep("💾 Removendo IndexedDB...")
      // Limpar IndexedDB
      try {
        const databases = ['ImageStorage', 'siteContent', 'uploadCache']
        for (const dbName of databases) {
          const deleteReq = indexedDB.deleteDatabase(dbName)
          await new Promise((resolve) => {
            deleteReq.onsuccess = () => resolve(true)
            deleteReq.onerror = () => resolve(false)
            deleteReq.onblocked = () => resolve(false)
          })
        }
      } catch (error) {
        console.warn('Erro ao limpar IndexedDB:', error)
      }
      await new Promise(resolve => setTimeout(resolve, 500))

      addStep("🌐 Limpando cache do navegador...")
      // Limpar cache do navegador
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        } catch (error) {
          console.warn('Erro ao limpar cache:', error)
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500))

      addStep("🔄 Forçando recarregamento completo...")
      await new Promise(resolve => setTimeout(resolve, 1000))

      addStep("✅ Reset completo! Recarregando página...")
      
      // Recarregar a página com cache bypass
      setTimeout(() => {
        window.location.href = window.location.href + '?reset=' + Date.now()
      }, 1500)

    } catch (error) {
      addStep("❌ Erro durante o reset: " + (error as Error).message)
    }

    setIsResetting(false)
  }

  const forceHardRefresh = () => {
    // Força um hard refresh
    window.location.reload()
  }

  const clearCacheAndReload = () => {
    // Limpa apenas o essencial e recarrega
    localStorage.removeItem('siteContent')
    localStorage.removeItem('uploadedImages')
    localStorage.removeItem('syncStatus')
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-6 w-6" />
          Reset de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerta */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Problemas Críticos Detectados</AlertTitle>
          <AlertDescription>
            Erros persistentes de rede e falhas de carregamento RSC. 
            Use as opções abaixo para resolver problemas críticos.
          </AlertDescription>
        </Alert>

        {/* Opções de Reset */}
        <div className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={performEmergencyReset} 
              disabled={isResetting}
              variant="destructive"
              className="flex items-center gap-2 w-full"
            >
              {isResetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Reset Completo (Recomendado)
            </Button>
            
            <Button 
              onClick={clearCacheAndReload} 
              disabled={isResetting}
              variant="outline"
              className="flex items-center gap-2 w-full"
            >
              <Database className="h-4 w-4" />
              Limpar Cache e Recarregar
            </Button>
            
            <Button 
              onClick={forceHardRefresh} 
              disabled={isResetting}
              variant="outline"
              className="flex items-center gap-2 w-full"
            >
              <RefreshCw className="h-4 w-4" />
              Hard Refresh
            </Button>
          </div>
        </div>

        {/* Progresso do Reset */}
        {resetSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Progresso do Reset:</h4>
            <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
              {resetSteps.map((step, index) => (
                <div key={index} className="text-sm py-1">
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>O que cada opção faz:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Reset Completo:</strong> Limpa todos os caches, dados locais e força recarregamento</li>
              <li><strong>Limpar Cache:</strong> Remove apenas dados de sincronização e recarrega</li>
              <li><strong>Hard Refresh:</strong> Recarrega a página ignorando cache do navegador</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Diagnóstico dos Erros */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Erros Detectados:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• ERR_ABORTED: Requisições sendo canceladas</li>
            <li>• Failed to fetch RSC: Problemas de Server Components</li>
            <li>• Watermark fetch error: Configuração ausente</li>
            <li>• Cache corruption: Dados corrompidos localmente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}