"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAdmin } from '@/contexts/admin-context'
import { ImageDiagnostics } from './image-diagnostics'
import { Upload, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react'
import { ImageStorageService } from '@/lib/image-storage'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  duration?: number
}

export function ImageTestPanel() {
  const { isAdmin, uploadImage } = useAdmin()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const runComprehensiveTests = async () => {
    setIsRunningTests(true)
    clearResults()

    // Teste 1: Verificar suporte aos sistemas de armazenamento
    const startTime1 = Date.now()
    try {
      const indexedDBSupported = 'indexedDB' in window
      const localStorageSupported = 'localStorage' in window
      
      if (indexedDBSupported && localStorageSupported) {
        addTestResult({
          test: 'Suporte aos Sistemas de Armazenamento',
          status: 'success',
          message: 'IndexedDB e localStorage disponíveis',
          duration: Date.now() - startTime1
        })
      } else {
        addTestResult({
          test: 'Suporte aos Sistemas de Armazenamento',
          status: 'error',
          message: `IndexedDB: ${indexedDBSupported ? 'OK' : 'Não suportado'}, localStorage: ${localStorageSupported ? 'OK' : 'Não suportado'}`,
          duration: Date.now() - startTime1
        })
      }
    } catch (error) {
      addTestResult({
        test: 'Suporte aos Sistemas de Armazenamento',
        status: 'error',
        message: `Erro: ${error}`,
        duration: Date.now() - startTime1
      })
    }

    // Teste 2: Criar e salvar uma imagem de teste
    const startTime2 = Date.now()
    try {
      // Criar uma imagem de teste (1x1 pixel PNG)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(0, 0, 1, 1)
      }
      
      const dataUrl = canvas.toDataURL('image/png')
      const testKey = `test_${Date.now()}`
      
      const saved = await ImageStorageService.saveImage(testKey, dataUrl, {
        test: true,
        timestamp: Date.now()
      })
      
      if (saved) {
        addTestResult({
          test: 'Salvar Imagem de Teste',
          status: 'success',
          message: `Imagem salva com chave: ${testKey}`,
          duration: Date.now() - startTime2
        })
        
        // Teste 3: Recuperar a imagem salva
        const startTime3 = Date.now()
        const retrieved = await ImageStorageService.getImage(testKey)
        
        if (retrieved && retrieved === dataUrl) {
          addTestResult({
            test: 'Recuperar Imagem de Teste',
            status: 'success',
            message: 'Imagem recuperada com sucesso',
            duration: Date.now() - startTime3
          })
        } else {
          addTestResult({
            test: 'Recuperar Imagem de Teste',
            status: 'error',
            message: 'Falha ao recuperar imagem ou dados corrompidos',
            duration: Date.now() - startTime3
          })
        }
      } else {
        addTestResult({
          test: 'Salvar Imagem de Teste',
          status: 'error',
          message: 'Falha ao salvar imagem',
          duration: Date.now() - startTime2
        })
      }
    } catch (error) {
      addTestResult({
        test: 'Salvar Imagem de Teste',
        status: 'error',
        message: `Erro: ${error}`,
        duration: Date.now() - startTime2
      })
    }

    // Teste 4: Verificar geração de chaves únicas
    const startTime4 = Date.now()
    try {
      const key1 = ImageStorageService.generateImageKey('test/path', 'image.jpg')
      const key2 = ImageStorageService.generateImageKey('test/path', 'image.jpg')
      
      if (key1 !== key2) {
        addTestResult({
          test: 'Geração de Chaves Únicas',
          status: 'success',
          message: 'Chaves únicas geradas corretamente',
          duration: Date.now() - startTime4
        })
      } else {
        addTestResult({
          test: 'Geração de Chaves Únicas',
          status: 'error',
          message: 'Chaves duplicadas detectadas',
          duration: Date.now() - startTime4
        })
      }
    } catch (error) {
      addTestResult({
        test: 'Geração de Chaves Únicas',
        status: 'error',
        message: `Erro: ${error}`,
        duration: Date.now() - startTime4
      })
    }

    setIsRunningTests(false)
  }

  const testFileUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo primeiro')
      return
    }

    setIsRunningTests(true)
    const startTime = Date.now()
    
    try {
      addTestResult({
        test: 'Upload de Arquivo Real',
        status: 'pending',
        message: `Iniciando upload de ${selectedFile.name}...`
      })

      const result = await uploadImage('test-uploads', selectedFile)
      
      if (result) {
        addTestResult({
          test: 'Upload de Arquivo Real',
          status: 'success',
          message: `Upload bem-sucedido: ${result.substring(0, 50)}...`,
          duration: Date.now() - startTime
        })
      } else {
        addTestResult({
          test: 'Upload de Arquivo Real',
          status: 'error',
          message: 'Upload falhou - resultado nulo',
          duration: Date.now() - startTime
        })
      }
    } catch (error) {
      addTestResult({
        test: 'Upload de Arquivo Real',
        status: 'error',
        message: `Erro no upload: ${error}`,
        duration: Date.now() - startTime
      })
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Sucesso</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      case 'pending':
        return <Badge variant="secondary">Executando</Badge>
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Painel de Testes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Painel de Testes do Sistema de Imagens
          </CardTitle>
          <CardDescription>
            Execute testes para verificar o funcionamento do sistema robusto de imagens
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runComprehensiveTests}
              disabled={isRunningTests}
              variant="default"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isRunningTests ? 'Executando Testes...' : 'Executar Testes Automáticos'}
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
              disabled={isRunningTests}
            >
              Limpar Resultados
            </Button>
          </div>

          {/* Teste de Upload Manual */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Teste de Upload Manual</h4>
            <div className="flex items-center gap-2">
              <Label htmlFor="test-file">Selecionar arquivo:</Label>
              <Input
                id="test-file"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={testFileUpload}
                disabled={!selectedFile || isRunningTests}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Testar Upload
              </Button>
            </div>
            {selectedFile && (
              <div className="text-sm text-gray-600">
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Resultados dos Testes */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-xs text-gray-500">{result.duration}ms</span>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                    <div className="text-sm text-gray-600 max-w-md truncate">
                      {result.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnósticos */}
      <ImageDiagnostics />
    </div>
  )
}