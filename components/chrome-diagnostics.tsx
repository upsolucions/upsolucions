"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Chrome, RefreshCw } from "lucide-react"

interface ChromeTest {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: string
}

export function ChromeDiagnostics() {
  const [tests, setTests] = useState<ChromeTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isChrome, setIsChrome] = useState(false)

  useEffect(() => {
    // Detectar se é Chrome
    const userAgent = navigator.userAgent
    const chromeDetected = userAgent.includes('Chrome') && !userAgent.includes('Edg')
    setIsChrome(chromeDetected)
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

  const runChromeDiagnostics = async () => {
    setIsRunning(true)
    setTests([])

    // Teste 1: Verificar localStorage
    updateTest('localStorage', 'pending', 'Testando localStorage...')
    try {
      const testKey = '__chrome_test_key__'
      const testValue = 'test_value'
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      if (retrieved === testValue) {
        updateTest('localStorage', 'success', 'localStorage funcionando corretamente')
      } else {
        updateTest('localStorage', 'error', 'localStorage não está funcionando', 'Valor recuperado não confere')
      }
    } catch (error) {
      updateTest('localStorage', 'error', 'Erro no localStorage', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 2: Verificar fetch API
    updateTest('fetch', 'pending', 'Testando fetch API...')
    try {
      const response = await fetch('/api/test', { 
        method: 'HEAD',
        cache: 'no-cache'
      }).catch(() => null)
      
      if (response) {
        updateTest('fetch', 'success', 'Fetch API funcionando')
      } else {
        updateTest('fetch', 'error', 'Fetch API com problemas', 'Não foi possível fazer requisição')
      }
    } catch (error) {
      updateTest('fetch', 'error', 'Erro na fetch API', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 3: Verificar WebGL
    updateTest('webgl', 'pending', 'Testando WebGL...')
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (gl) {
        updateTest('webgl', 'success', 'WebGL disponível')
      } else {
        updateTest('webgl', 'error', 'WebGL não disponível', 'Pode afetar animações e performance')
      }
    } catch (error) {
      updateTest('webgl', 'error', 'Erro no WebGL', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 4: Verificar Service Workers
    updateTest('serviceWorker', 'pending', 'Verificando Service Workers...')
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        updateTest('serviceWorker', 'success', `Service Workers: ${registrations.length} registrados`)
      } else {
        updateTest('serviceWorker', 'error', 'Service Workers não suportados')
      }
    } catch (error) {
      updateTest('serviceWorker', 'error', 'Erro nos Service Workers', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 5: Verificar CSS Custom Properties
    updateTest('cssVars', 'pending', 'Testando CSS Custom Properties...')
    try {
      const testDiv = document.createElement('div')
      testDiv.style.setProperty('--test-var', 'test')
      const value = testDiv.style.getPropertyValue('--test-var')
      
      if (value === 'test') {
        updateTest('cssVars', 'success', 'CSS Custom Properties funcionando')
      } else {
        updateTest('cssVars', 'error', 'CSS Custom Properties com problemas')
      }
    } catch (error) {
      updateTest('cssVars', 'error', 'Erro nas CSS Custom Properties', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 6: Verificar memória disponível
    updateTest('memory', 'pending', 'Verificando uso de memória...')
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        
        if (usedMB < limitMB * 0.8) {
          updateTest('memory', 'success', `Memória OK: ${usedMB}MB/${limitMB}MB`)
        } else {
          updateTest('memory', 'error', `Memória alta: ${usedMB}MB/${limitMB}MB`, 'Pode causar lentidão')
        }
      } else {
        updateTest('memory', 'error', 'Informações de memória não disponíveis')
      }
    } catch (error) {
      updateTest('memory', 'error', 'Erro ao verificar memória', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 7: Verificar cache
    updateTest('cache', 'pending', 'Verificando cache do navegador...')
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        updateTest('cache', 'success', `Cache API disponível: ${cacheNames.length} caches`)
      } else {
        updateTest('cache', 'error', 'Cache API não disponível')
      }
    } catch (error) {
      updateTest('cache', 'error', 'Erro no cache', error instanceof Error ? error.message : 'Erro desconhecido')
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
          <Chrome className="h-5 w-5 text-blue-500" />
          Diagnóstico Chrome
          {isChrome && <Badge variant="outline">Chrome Detectado</Badge>}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Diagnóstico específico para problemas de compatibilidade com Chrome
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runChromeDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Executando Diagnóstico...
            </>
          ) : (
            <>
              <Chrome className="h-4 w-4 mr-2" />
              Executar Diagnóstico Chrome
            </>
          )}
        </Button>

        {!isChrome && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Chrome não detectado. Este diagnóstico é específico para problemas no Chrome.
            </p>
          </div>
        )}

        {tests.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resultados dos Testes:</h3>
            {tests.map((test, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{test.name}</span>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-gray-600">{test.message}</p>
                    {test.details && (
                      <p className="text-xs text-gray-500 mt-1">{test.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tests.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Soluções Recomendadas:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Limpe o cache do Chrome (Ctrl+Shift+Del)</li>
              <li>• Desative extensões temporariamente</li>
              <li>• Teste em modo incógnito</li>
              <li>• Verifique se o Chrome está atualizado</li>
              <li>• Reinicie o navegador</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}