"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAdmin } from '@/contexts/admin-context'
import { LazyImage } from '@/components/ui/lazy-image'

export function LogoDiagnostics() {
  const { siteContent } = useAdmin()
  const [logoTests, setLogoTests] = useState({
    directLoad: { status: 'pending', message: '' },
    publicPath: { status: 'pending', message: '' },
    contextValue: { status: 'pending', message: '' },
    fileExists: { status: 'pending', message: '' }
  })

  const runDiagnostics = async () => {
    // Reset all tests
    setLogoTests({
      directLoad: { status: 'testing', message: 'Testando...' },
      publicPath: { status: 'testing', message: 'Testando...' },
      contextValue: { status: 'testing', message: 'Testando...' },
      fileExists: { status: 'testing', message: 'Testando...' }
    })

    // Test 1: Context value
    setTimeout(() => {
      setLogoTests(prev => ({
        ...prev,
        contextValue: {
          status: siteContent?.logo ? 'success' : 'error',
          message: siteContent?.logo ? `Valor: ${siteContent.logo}` : 'Logo não definido no contexto'
        }
      }))
    }, 500)

    // Test 2: Direct file access
    setTimeout(() => {
      const img = new Image()
      img.onload = () => {
        setLogoTests(prev => ({
          ...prev,
          directLoad: {
            status: 'success',
            message: 'Arquivo carregado com sucesso'
          }
        }))
      }
      img.onerror = () => {
        setLogoTests(prev => ({
          ...prev,
          directLoad: {
            status: 'error',
            message: 'Falha ao carregar arquivo'
          }
        }))
      }
      img.src = '/up-solucions-logo.svg'
    }, 1000)

    // Test 3: Public path test
    setTimeout(async () => {
      try {
        const response = await fetch('/up-solucions-logo.svg')
        setLogoTests(prev => ({
          ...prev,
          publicPath: {
            status: response.ok ? 'success' : 'error',
            message: response.ok ? `Status: ${response.status}` : `Erro HTTP: ${response.status}`
          }
        }))
      } catch (error) {
        setLogoTests(prev => ({
          ...prev,
          publicPath: {
            status: 'error',
            message: `Erro de rede: ${error}`
          }
        }))
      }
    }, 1500)

    // Test 4: File existence check
    setTimeout(async () => {
      try {
        const response = await fetch('/api/check-file?path=up-solucions-logo.svg')
        const exists = response.ok
        setLogoTests(prev => ({
          ...prev,
          fileExists: {
            status: exists ? 'success' : 'error',
            message: exists ? 'Arquivo existe no servidor' : 'Arquivo não encontrado no servidor'
          }
        }))
      } catch (error) {
        setLogoTests(prev => ({
          ...prev,
          fileExists: {
            status: 'warning',
            message: 'Não foi possível verificar (API não disponível)'
          }
        }))
      }
    }, 2000)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>
      case 'testing':
        return <Badge variant="outline">Testando...</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Diagnóstico do Logo
        </CardTitle>
        <CardDescription>
          Verificação detalhada do carregamento do logo do site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview atual */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Preview Atual do Logo</h4>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center">
              <LazyImage
                src={siteContent?.logo || '/up-solucions-logo.svg'}
                alt="Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Caminho atual: {siteContent?.logo || 'Não definido'}</p>
              <p className="text-sm text-gray-600">Fallback: /up-solucions-logo.svg</p>
            </div>
          </div>
        </div>

        {/* Testes */}
        <div className="space-y-4">
          <h4 className="font-medium">Resultados dos Testes</h4>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(logoTests.contextValue.status)}
                <div>
                  <p className="font-medium text-sm">Valor no Contexto Admin</p>
                  <p className="text-xs text-gray-600">{logoTests.contextValue.message}</p>
                </div>
              </div>
              {getStatusBadge(logoTests.contextValue.status)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(logoTests.directLoad.status)}
                <div>
                  <p className="font-medium text-sm">Carregamento Direto da Imagem</p>
                  <p className="text-xs text-gray-600">{logoTests.directLoad.message}</p>
                </div>
              </div>
              {getStatusBadge(logoTests.directLoad.status)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(logoTests.publicPath.status)}
                <div>
                  <p className="font-medium text-sm">Acesso via HTTP</p>
                  <p className="text-xs text-gray-600">{logoTests.publicPath.message}</p>
                </div>
              </div>
              {getStatusBadge(logoTests.publicPath.status)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(logoTests.fileExists.status)}
                <div>
                  <p className="font-medium text-sm">Existência do Arquivo</p>
                  <p className="text-xs text-gray-600">{logoTests.fileExists.message}</p>
                </div>
              </div>
              {getStatusBadge(logoTests.fileExists.status)}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={runDiagnostics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Executar Novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}