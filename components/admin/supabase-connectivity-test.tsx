"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ConnectivityTest {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: string
}

export function SupabaseConnectivityTest() {
  const [tests, setTests] = useState<ConnectivityTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(navigator?.onLine ?? true)

  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true)
    const handleOffline = () => setNetworkStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateTest = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, details } : t)
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const runConnectivityTests = async () => {
    setIsRunning(true)
    setTests([])

    // Teste 1: Verificar variáveis de ambiente
    updateTest('env', 'pending', 'Verificando variáveis de ambiente...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      updateTest('env', 'error', 'Variáveis de ambiente não configuradas', 
        `URL: ${supabaseUrl || 'não definida'}, Key: ${supabaseKey ? 'definida' : 'não definida'}`)
    } else if (supabaseUrl.includes('localhost') || supabaseKey === 'demo-key') {
      updateTest('env', 'error', 'Usando configurações de desenvolvimento', 
        `URL: ${supabaseUrl}, Key: ${supabaseKey.substring(0, 20)}...`)
    } else {
      updateTest('env', 'success', 'Variáveis de ambiente configuradas', 
        `URL: ${supabaseUrl}, Key: ${supabaseKey.substring(0, 20)}...`)
    }

    // Teste 2: Verificar conectividade de rede
    updateTest('network', 'pending', 'Verificando conectividade de rede...')
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      })
      updateTest('network', 'success', 'Conectividade de rede OK')
    } catch (error) {
      updateTest('network', 'error', 'Sem conectividade de rede', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 3: Ping direto ao Supabase
    updateTest('supabase-ping', 'pending', 'Testando conectividade com Supabase...')
    try {
      const supabaseHost = supabaseUrl?.replace('https://', '').replace('http://', '')
      const response = await fetch(`https://${supabaseHost}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey || ''}`
        }
      })
      
      if (response.ok) {
        updateTest('supabase-ping', 'success', 'Conectividade com Supabase OK', 
          `Status: ${response.status} ${response.statusText}`)
      } else {
        updateTest('supabase-ping', 'error', 'Erro na resposta do Supabase', 
          `Status: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      updateTest('supabase-ping', 'error', 'Falha ao conectar com Supabase', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 4: Teste de autenticação
    updateTest('auth', 'pending', 'Testando autenticação...')
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        updateTest('auth', 'error', 'Erro na autenticação', error.message)
      } else {
        updateTest('auth', 'success', 'Autenticação OK', 
          `Sessão: ${data.session ? 'ativa' : 'inativa'}`)
      }
    } catch (error) {
      updateTest('auth', 'error', 'Falha no teste de autenticação', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 5: Teste de consulta à tabela
    updateTest('table-query', 'pending', 'Testando consulta à tabela site_content...')
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('id')
        .limit(1)
      
      if (error) {
        updateTest('table-query', 'error', 'Erro na consulta à tabela', 
          `Código: ${error.code}, Mensagem: ${error.message}`)
      } else {
        updateTest('table-query', 'success', 'Consulta à tabela OK', 
          `Registros encontrados: ${data?.length || 0}`)
      }
    } catch (error) {
      updateTest('table-query', 'error', 'Falha na consulta à tabela', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 6: Teste específico para watermark (que está causando o erro)
    updateTest('watermark-query', 'pending', 'Testando consulta específica do watermark...')
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'watermark')
      
      if (error) {
        updateTest('watermark-query', 'error', 'Erro na consulta do watermark', 
          `Código: ${error.code}, Mensagem: ${error.message}`)
      } else {
        updateTest('watermark-query', 'success', 'Consulta do watermark OK', 
          `Dados: ${data ? 'encontrados' : 'não encontrados'}`)
      }
    } catch (error) {
      updateTest('watermark-query', 'error', 'Falha na consulta do watermark', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Testando...</Badge>
      case 'success':
        return <Badge variant="default">✅ OK</Badge>
      case 'error':
        return <Badge variant="destructive">❌ Erro</Badge>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {networkStatus ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Diagnóstico de Conectividade Supabase
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status da rede:</span>
          <Badge variant={networkStatus ? "default" : "destructive"}>
            {networkStatus ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runConnectivityTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunning ? 'Executando Testes...' : 'Executar Testes de Conectividade'}
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes:</h4>
            {tests.map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{test.name}</span>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-gray-600">{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                      {test.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p><strong>Sobre o erro QUIC_PROTOCOL_ERROR:</strong></p>
          <p>Este erro geralmente indica problemas de conectividade de rede ou configuração do Supabase. Os testes acima ajudam a identificar a causa específica.</p>
        </div>
      </CardContent>
    </Card>
  )
}