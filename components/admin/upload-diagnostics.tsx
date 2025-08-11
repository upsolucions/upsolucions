"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface DiagnosticResult {
  step: string
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  details?: any
}

export function UploadDiagnostics() {
  const { uploadImage } = useAdmin()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const updateResult = (step: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step)
      if (existing) {
        return prev.map(r => r.step === step ? { ...r, status, message, details } : r)
      }
      return [...prev, { step, status, message, details }]
    })
  }

  const runDiagnostics = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro')
      return
    }

    setIsRunning(true)
    setResults([])

    try {
      // Teste 1: Validação do arquivo
      updateResult('file-validation', 'running', 'Validando arquivo...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (!selectedFile.type.startsWith('image/')) {
        updateResult('file-validation', 'error', 'Arquivo não é uma imagem', { type: selectedFile.type })
        return
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        updateResult('file-validation', 'error', 'Arquivo muito grande (>5MB)', { size: selectedFile.size })
        return
      }
      
      updateResult('file-validation', 'success', 'Arquivo válido', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
      })

      // Teste 2: Verificação do ambiente
      updateResult('environment', 'running', 'Verificando ambiente...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const isDevMode = supabaseUrl.includes('localhost') || supabaseUrl.includes('your-project')
      
      updateResult('environment', 'success', `Modo: ${isDevMode ? 'Desenvolvimento' : 'Produção'}`, {
        supabaseUrl: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
        isDevMode
      })

      // Teste 3: Conversão para Data URL
      updateResult('data-url', 'running', 'Convertendo para Data URL...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        
        updateResult('data-url', 'success', 'Data URL criada com sucesso', {
          length: dataUrl.length,
          preview: dataUrl.substring(0, 50) + '...'
        })
      } catch (error) {
        updateResult('data-url', 'error', 'Erro ao criar Data URL', { error: (error as Error).message })
        return
      }

      // Teste 4: Verificação do localStorage
      updateResult('local-storage', 'running', 'Testando localStorage...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const testKey = 'upload-test-' + Date.now()
        const testData = 'test-data'
        localStorage.setItem(testKey, testData)
        const retrieved = localStorage.getItem(testKey)
        localStorage.removeItem(testKey)
        
        if (retrieved === testData) {
          updateResult('local-storage', 'success', 'localStorage funcionando')
        } else {
          updateResult('local-storage', 'error', 'localStorage não está funcionando corretamente')
        }
      } catch (error) {
        updateResult('local-storage', 'error', 'Erro no localStorage', { error: error.message })
      }

      // Teste 5: Verificação do IndexedDB
      updateResult('indexed-db', 'running', 'Testando IndexedDB...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        const dbTest = await new Promise<boolean>((resolve) => {
          const request = indexedDB.open('test-db', 1)
          request.onerror = () => resolve(false)
          request.onsuccess = () => {
            request.result.close()
            resolve(true)
          }
        })
        
        if (dbTest) {
          updateResult('indexed-db', 'success', 'IndexedDB disponível')
        } else {
          updateResult('indexed-db', 'error', 'IndexedDB não disponível')
        }
      } catch (error) {
        updateResult('indexed-db', 'error', 'Erro no IndexedDB', { error: error.message })
      }

      // Teste 6: Upload real
      updateResult('upload', 'running', 'Testando upload real...')
      
      try {
        const testPath = `diagnostics.test.${Date.now()}`
        const result = await uploadImage(testPath, selectedFile)
        
        if (result) {
          updateResult('upload', 'success', 'Upload realizado com sucesso', {
            url: result.substring(0, 50) + '...',
            fullUrl: result
          })
        } else {
          updateResult('upload', 'error', 'Upload retornou null')
        }
      } catch (error) {
        updateResult('upload', 'error', 'Erro no upload', { 
          error: error.message,
          stack: error.stack?.substring(0, 200) + '...'
        })
      }

    } catch (error) {
      updateResult('general', 'error', 'Erro geral nos diagnósticos', { error: error.message })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Diagnóstico de Upload de Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de arquivo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar arquivo para teste:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Botão de teste */}
        <Button 
          onClick={runDiagnostics} 
          disabled={!selectedFile || isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando Diagnósticos...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Executar Diagnósticos
            </>
          )}
        </Button>

        {/* Resultados */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resultados:</h3>
            {results.map((result, index) => (
              <Alert key={index} className="border-l-4 border-l-gray-300">
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.step}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <AlertDescription>{result.message}</AlertDescription>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer">Ver detalhes</summary>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}