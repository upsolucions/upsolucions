"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageStorageService } from '@/lib/image-storage'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2, Database, HardDrive } from 'lucide-react'
import { useAdmin } from '@/contexts/admin-context'

interface StorageInfo {
  indexedDBSupported: boolean
  localStorageSupported: boolean
  indexedDBSize: number
  localStorageSize: number
  totalImages: number
  errors: string[]
}

export function ImageDiagnostics() {
  const { isAdmin } = useAdmin()
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkStorageStatus = async () => {
    setIsLoading(true)
    const errors: string[] = []
    
    try {
      // Verificar suporte ao IndexedDB
      const indexedDBSupported = 'indexedDB' in window
      
      // Verificar suporte ao localStorage
      const localStorageSupported = 'localStorage' in window && window.localStorage !== null
      
      let indexedDBSize = 0
      let totalImages = 0
      
      // Verificar IndexedDB
      if (indexedDBSupported) {
        try {
          await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open('UpSolucoesImages', 1)
            
            request.onerror = () => {
              errors.push('Erro ao acessar IndexedDB')
              reject(new Error('IndexedDB access failed'))
            }
            
            request.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result
              
              if (db.objectStoreNames.contains('images')) {
                try {
                  const transaction = db.transaction(['images'], 'readonly')
                  const store = transaction.objectStore('images')
                  
                  transaction.onerror = () => {
                    errors.push('Erro na transação do IndexedDB')
                    resolve()
                  }
                  
                  const countRequest = store.count()
                  
                  countRequest.onsuccess = () => {
                    totalImages = countRequest.result
                    resolve()
                  }
                  
                  countRequest.onerror = () => {
                    errors.push('Erro ao contar imagens no IndexedDB')
                    resolve()
                  }
                } catch (transactionError) {
                  errors.push(`Erro ao criar transação: ${transactionError}`)
                  resolve()
                }
              } else {
                errors.push('Object store "images" não encontrado no IndexedDB')
                resolve()
              }
            }
          })
        } catch (error) {
          errors.push(`Erro no IndexedDB: ${error}`)
        }
      } else {
        errors.push('IndexedDB não suportado pelo navegador')
      }
      
      // Verificar localStorage
      let localStorageSize = 0
      if (localStorageSupported) {
        try {
          const stored = localStorage.getItem('uploadedImages')
          if (stored) {
            localStorageSize = new Blob([stored]).size
          }
        } catch (error) {
          errors.push(`Erro ao acessar localStorage: ${error}`)
        }
      } else {
        errors.push('localStorage não suportado pelo navegador')
      }
      
      setStorageInfo({
        indexedDBSupported,
        localStorageSupported,
        indexedDBSize,
        localStorageSize,
        totalImages,
        errors
      })
      
      setLastCheck(new Date())
    } catch (error) {
      console.error('[ImageDiagnostics] Erro na verificação:', error)
      errors.push(`Erro geral: ${error}`)
      setStorageInfo({
        indexedDBSupported: false,
        localStorageSupported: false,
        indexedDBSize: 0,
        localStorageSize: 0,
        totalImages: 0,
        errors
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllImages = async () => {
    if (confirm('Tem certeza que deseja limpar todas as imagens armazenadas? Esta ação não pode ser desfeita.')) {
      try {
        await ImageStorageService.clearAllImages()
        alert('Todas as imagens foram removidas com sucesso!')
        checkStorageStatus()
      } catch (error) {
        console.error('[ImageDiagnostics] Erro ao limpar imagens:', error)
        alert('Erro ao limpar imagens. Verifique o console para mais detalhes.')
      }
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    if (isAdmin) {
      checkStorageStatus()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnóstico do Sistema de Imagens
        </CardTitle>
        <CardDescription>
          Verificação do status do armazenamento local de imagens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={checkStorageStatus} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Verificando...' : 'Atualizar Status'}
          </Button>
          
          {lastCheck && (
            <span className="text-sm text-gray-500">
              Última verificação: {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>

        {storageInfo && (
          <div className="space-y-4">
            {/* Status dos sistemas de armazenamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">IndexedDB</span>
                  {storageInfo.indexedDBSupported ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Imagens armazenadas: {storageInfo.totalImages}</div>
                  <div>Tamanho: {formatBytes(storageInfo.indexedDBSize)}</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="font-medium">localStorage</span>
                  {storageInfo.localStorageSupported ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Tamanho: {formatBytes(storageInfo.localStorageSize)}</div>
                </div>
              </div>
            </div>

            {/* Status geral */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Status Geral</span>
                {storageInfo.errors.length === 0 ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Funcionando
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Problemas Detectados
                  </Badge>
                )}
              </div>
              
              {storageInfo.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-red-600">Erros encontrados:</div>
                  {storageInfo.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações de manutenção */}
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Manutenção</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-yellow-700">
                  Se você está enfrentando problemas com imagens, pode tentar limpar o cache local.
                </p>
                <Button 
                  onClick={clearAllImages}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todas as Imagens do Cache
                </Button>
              </div>
            </div>

            {/* Informações técnicas */}
            <details className="p-4 border rounded-lg">
              <summary className="cursor-pointer font-medium mb-2">Informações Técnicas</summary>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Navegador: {navigator.userAgent}</div>
                <div>IndexedDB disponível: {storageInfo.indexedDBSupported ? 'Sim' : 'Não'}</div>
                <div>localStorage disponível: {storageInfo.localStorageSupported ? 'Sim' : 'Não'}</div>
                <div>Modo de desenvolvimento: {process.env.NODE_ENV === 'development' ? 'Sim' : 'Não'}</div>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}