"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  details?: any
}

export function ServiceUploadTest() {
  const { uploadImage, updateContent, isAdmin } = useAdmin()
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const updateResult = (testName: string, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { status, message, details }
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      updateResult('file-selection', 'success', `Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`, {
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
  }

  const runServiceUploadTest = async () => {
    if (!selectedFile) {
      updateResult('upload-test', 'error', 'Nenhum arquivo selecionado')
      return
    }

    setIsRunning(true)
    
    try {
      // Teste 1: Validação de arquivo
      updateResult('validation', 'running', 'Validando arquivo...')
      
      if (!selectedFile.type.startsWith('image/')) {
        updateResult('validation', 'error', 'Arquivo não é uma imagem')
        return
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        updateResult('validation', 'error', 'Arquivo muito grande (>5MB)')
        return
      }
      
      updateResult('validation', 'success', 'Arquivo válido')
      
      // Teste 2: Upload para serviços
      updateResult('service-upload', 'running', 'Fazendo upload para serviços...')
      
      const testPath = `services.items.0.image` // Testar upload para o primeiro serviço
      const imageUrl = await uploadImage(testPath, selectedFile)
      
      if (imageUrl) {
        updateResult('service-upload', 'success', `Upload bem-sucedido: ${imageUrl}`, { imageUrl })
        
        // Teste 3: Atualização de conteúdo
        updateResult('content-update', 'running', 'Atualizando conteúdo...')
        
        try {
          await updateContent(testPath, imageUrl)
          updateResult('content-update', 'success', 'Conteúdo atualizado com sucesso')
        } catch (error) {
          updateResult('content-update', 'error', 'Erro ao atualizar conteúdo', { error: (error as Error).message })
        }
      } else {
        updateResult('service-upload', 'error', 'Upload falhou - URL nula retornada')
      }
      
    } catch (error) {
      updateResult('service-upload', 'error', 'Erro durante o upload', { error: (error as Error).message })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const
    
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Teste de Upload - Página de Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de arquivo */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isRunning}
            >
              Selecionar Imagem
            </Button>
            {selectedFile && (
              <span className="text-sm text-gray-600">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
              </span>
            )}
          </div>
          
          <Button
            onClick={runServiceUploadTest}
            disabled={!selectedFile || isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando Upload...
              </>
            ) : (
              'Testar Upload para Serviços'
            )}
          </Button>
        </div>

        {/* Resultados dos testes */}
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <Alert key={testName}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium capitalize">{testName.replace('-', ' ')}</span>
                  {getStatusBadge(result.status)}
                </div>
              </div>
              <AlertDescription className="mt-2">
                {result.message}
                {result.details && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}