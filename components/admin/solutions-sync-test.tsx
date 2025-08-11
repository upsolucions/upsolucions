"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Upload, Database, Wifi, WifiOff } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { ImageStorageService } from "@/lib/image-storage"
import { SyncService } from "@/lib/sync-service"

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: any
}

export function SolutionsSyncTest() {
  const { siteContent, updateContent, uploadImage, syncStatus, lastSyncTime } = useAdmin()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Detectar status de conexão
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTestResults([])

    // Teste 1: Verificar configuração do Supabase
    addResult({
      name: "Configuração Supabase",
      status: "pending",
      message: "Verificando..."
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const isSupabaseConfigured = supabaseUrl && 
                                !supabaseUrl.includes('localhost') && 
                                !supabaseUrl.includes('your-project') && 
                                supabaseUrl.startsWith('https://') &&
                                supabaseUrl.length > 20 &&
                                supabaseKey && 
                                supabaseKey !== 'demo-key' && 
                                supabaseKey.length > 20

    setTestResults(prev => prev.map(r => 
      r.name === "Configuração Supabase" 
        ? {
            ...r,
            status: isSupabaseConfigured ? 'success' : 'warning',
            message: isSupabaseConfigured 
              ? 'Supabase configurado corretamente' 
              : 'Supabase não configurado - modo local ativo',
            details: { url: supabaseUrl.substring(0, 30) + '...', hasKey: !!supabaseKey }
          }
        : r
    ))

    // Teste 2: Verificar status de sincronização
    addResult({
      name: "Status de Sincronização",
      status: syncStatus === 'synced' ? 'success' : syncStatus === 'error' ? 'error' : 'warning',
      message: `Status atual: ${syncStatus}`,
      details: { lastSync: lastSyncTime, online: isOnline }
    })

    // Teste 3: Verificar conteúdo das soluções
    addResult({
      name: "Conteúdo das Soluções",
      status: "pending",
      message: "Verificando..."
    })

    const solutionsCount = siteContent?.solutions?.items?.length || 0
    const solutionsWithImages = siteContent?.solutions?.items?.filter((s: any) => s.image && s.image !== '') || []
    
    setTestResults(prev => prev.map(r => 
      r.name === "Conteúdo das Soluções" 
        ? {
            ...r,
            status: solutionsCount > 0 ? 'success' : 'warning',
            message: `${solutionsCount} soluções encontradas, ${solutionsWithImages.length} com imagens`,
            details: { 
              total: solutionsCount, 
              withImages: solutionsWithImages.length,
              solutions: siteContent?.solutions?.items?.map((s: any, i: number) => ({
                index: i,
                title: s.title,
                hasImage: !!s.image,
                imageUrl: s.image
              }))
            }
          }
        : r
    ))

    // Teste 4: Verificar cache de imagens
    addResult({
      name: "Cache de Imagens",
      status: "pending",
      message: "Verificando..."
    })

    try {
      // Testar localStorage
      const localStorageTest = localStorage.getItem('uploadedImages')
      const localImages = localStorageTest ? Object.keys(JSON.parse(localStorageTest)).length : 0
      
      // Testar IndexedDB
      let indexedDBImages = 0
      try {
        // Simular teste do IndexedDB
        const testKey = 'test-' + Date.now()
        const saved = await ImageStorageService.saveImage(testKey, 'data:image/png;base64,test', { test: true })
        if (saved) {
          const retrieved = await ImageStorageService.getImage(testKey)
          indexedDBImages = retrieved ? 1 : 0
        }
      } catch (error) {
        console.warn('Erro no teste IndexedDB:', error)
      }

      setTestResults(prev => prev.map(r => 
        r.name === "Cache de Imagens" 
          ? {
              ...r,
              status: (localImages > 0 || indexedDBImages > 0) ? 'success' : 'warning',
              message: `LocalStorage: ${localImages} imagens, IndexedDB: ${indexedDBImages > 0 ? 'funcionando' : 'erro'}`,
              details: { localStorage: localImages, indexedDB: indexedDBImages > 0 }
            }
          : r
      ))
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === "Cache de Imagens" 
          ? {
              ...r,
              status: 'error',
              message: 'Erro ao verificar cache: ' + (error as Error).message
            }
          : r
      ))
    }

    // Teste 5: Teste de sincronização de conteúdo
    addResult({
      name: "Teste de Sincronização",
      status: "pending",
      message: "Testando..."
    })

    try {
      const testPath = 'test.syncTest'
      const testValue = 'sync-test-' + Date.now()
      
      await updateContent(testPath, testValue)
      
      // Aguardar um pouco para a sincronização
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentValue = siteContent?.test?.syncTest
      const syncWorking = currentValue === testValue
      
      setTestResults(prev => prev.map(r => 
        r.name === "Teste de Sincronização" 
          ? {
              ...r,
              status: syncWorking ? 'success' : 'warning',
              message: syncWorking ? 'Sincronização funcionando' : 'Sincronização pode estar com problemas',
              details: { sent: testValue, received: currentValue }
            }
          : r
      ))
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === "Teste de Sincronização" 
          ? {
              ...r,
              status: 'error',
              message: 'Erro no teste: ' + (error as Error).message
            }
          : r
      ))
    }

    setIsRunning(false)
  }

  const testImageUpload = async () => {
    if (!selectedFile) return

    setIsRunning(true)
    addResult({
      name: "Upload de Imagem",
      status: "pending",
      message: "Fazendo upload..."
    })

    try {
      const testPath = 'solutions.items.0.image'
      const imageUrl = await uploadImage(testPath, selectedFile)
      
      if (imageUrl) {
        setTestResults(prev => prev.map(r => 
          r.name === "Upload de Imagem" 
            ? {
                ...r,
                status: 'success',
                message: 'Upload realizado com sucesso',
                details: { url: imageUrl, path: testPath }
              }
            : r
        ))
      } else {
        setTestResults(prev => prev.map(r => 
          r.name === "Upload de Imagem" 
            ? {
                ...r,
                status: 'error',
                message: 'Upload falhou - retornou null'
              }
            : r
        ))
      }
    } catch (error) {
      setTestResults(prev => prev.map(r => 
        r.name === "Upload de Imagem" 
          ? {
              ...r,
              status: 'error',
              message: 'Erro no upload: ' + (error as Error).message
            }
          : r
      ))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'pending': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default: return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Diagnóstico de Sincronização - Soluções
          {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Status Atual</AlertTitle>
          <AlertDescription>
            Sincronização: <strong>{syncStatus}</strong> | 
            Última sync: <strong>{lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Nunca'}</strong> | 
            Conexão: <strong>{isOnline ? 'Online' : 'Offline'}</strong>
          </AlertDescription>
        </Alert>

        {/* Controles */}
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Executar Diagnósticos
          </Button>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <Button 
              onClick={testImageUpload} 
              disabled={!selectedFile || isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Testar Upload
            </Button>
          </div>
        </div>

        {/* Resultados */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
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
      </CardContent>
    </Card>
  )
}