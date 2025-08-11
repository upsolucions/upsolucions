"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Image as ImageIcon, Download } from "lucide-react"
import { ImageStorageService } from "@/lib/image-storage"
import { useAdmin } from "@/contexts/admin-context"

interface ImageFallbackTest {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: string
}

export function ImageFallbackFix() {
  const { siteContent, updateContent } = useAdmin()
  const [tests, setTests] = useState<ImageFallbackTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [fixedImages, setFixedImages] = useState<string[]>([])

  const updateTest = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name)
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, details } : t)
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const checkImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const findCachedImage = async (originalUrl: string): Promise<string | null> => {
    try {
      // Tentar diferentes estratégias para encontrar a imagem no cache
      const fileName = originalUrl.split('/').pop() || ''
      const possibleKeys = [
        ImageStorageService.generateImageKey('services.items.0.image', fileName),
        ImageStorageService.generateImageKey('services.items.1.image', fileName),
        ImageStorageService.generateImageKey('services.items.2.image', fileName),
        ImageStorageService.generateImageKey('images', fileName),
        ImageStorageService.generateImageKey('uploads', fileName),
        ImageStorageService.generateImageKey('', fileName)
      ]

      for (const key of possibleKeys) {
        const cached = await ImageStorageService.getImage(key)
        if (cached) {
          return cached
        }
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar imagem no cache:', error)
      return null
    }
  }

  const runImageFallbackFix = async () => {
    setIsRunning(true)
    setTests([])
    setFixedImages([])
    const fixed: string[] = []

    // Teste 1: Verificar imagens dos serviços
    updateTest('services-check', 'pending', 'Verificando imagens dos serviços...')
    
    try {
      const services = siteContent.services?.items || []
      let brokenImages = 0
      let fixedCount = 0

      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        if (service.image && service.image.includes('supabase.co')) {
          const isWorking = await checkImageUrl(service.image)
          
          if (!isWorking) {
            brokenImages++
            updateTest('services-check', 'pending', 
              `Imagem quebrada encontrada: ${service.title}. Buscando no cache...`)
            
            const cachedImage = await findCachedImage(service.image)
            if (cachedImage) {
              await updateContent(`services.items.${i}.image`, cachedImage)
              fixed.push(`Serviço: ${service.title}`)
              fixedCount++
            }
          }
        }
      }

      if (brokenImages === 0) {
        updateTest('services-check', 'success', 'Todas as imagens dos serviços estão funcionando')
      } else if (fixedCount > 0) {
        updateTest('services-check', 'success', 
          `${fixedCount} de ${brokenImages} imagens corrigidas`, 
          `Imagens corrigidas: ${fixedCount}`)
      } else {
        updateTest('services-check', 'error', 
          `${brokenImages} imagens quebradas encontradas, nenhuma corrigida`)
      }
    } catch (error) {
      updateTest('services-check', 'error', 'Erro ao verificar imagens dos serviços', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 2: Verificar imagens das soluções
    updateTest('solutions-check', 'pending', 'Verificando imagens das soluções...')
    
    try {
      const solutions = siteContent.solutions?.items || []
      let brokenImages = 0
      let fixedCount = 0

      for (let i = 0; i < solutions.length; i++) {
        const solution = solutions[i]
        if (solution.image && solution.image.includes('supabase.co')) {
          const isWorking = await checkImageUrl(solution.image)
          
          if (!isWorking) {
            brokenImages++
            const cachedImage = await findCachedImage(solution.image)
            if (cachedImage) {
              await updateContent(`solutions.items.${i}.image`, cachedImage)
              fixed.push(`Solução: ${solution.title}`)
              fixedCount++
            }
          }
        }
      }

      if (brokenImages === 0) {
        updateTest('solutions-check', 'success', 'Todas as imagens das soluções estão funcionando')
      } else if (fixedCount > 0) {
        updateTest('solutions-check', 'success', 
          `${fixedCount} de ${brokenImages} imagens corrigidas`)
      } else {
        updateTest('solutions-check', 'error', 
          `${brokenImages} imagens quebradas encontradas, nenhuma corrigida`)
      }
    } catch (error) {
      updateTest('solutions-check', 'error', 'Erro ao verificar imagens das soluções', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Teste 3: Verificar imagens da galeria
    updateTest('gallery-check', 'pending', 'Verificando imagens da galeria...')
    
    try {
      const gallery = siteContent.gallery?.mainImages || []
      let brokenImages = 0
      let fixedCount = 0

      for (let i = 0; i < gallery.length; i++) {
        const image = gallery[i]
        if (image.src && image.src.includes('supabase.co')) {
          const isWorking = await checkImageUrl(image.src)
          
          if (!isWorking) {
            brokenImages++
            const cachedImage = await findCachedImage(image.src)
            if (cachedImage) {
              await updateContent(`gallery.mainImages.${i}.src`, cachedImage)
              fixed.push(`Galeria: Imagem ${i + 1}`)
              fixedCount++
            }
          }
        }
      }

      if (brokenImages === 0) {
        updateTest('gallery-check', 'success', 'Todas as imagens da galeria estão funcionando')
      } else if (fixedCount > 0) {
        updateTest('gallery-check', 'success', 
          `${fixedCount} de ${brokenImages} imagens corrigidas`)
      } else {
        updateTest('gallery-check', 'error', 
          `${brokenImages} imagens quebradas encontradas, nenhuma corrigidas`)
      }
    } catch (error) {
      updateTest('gallery-check', 'error', 'Erro ao verificar imagens da galeria', 
        error instanceof Error ? error.message : 'Erro desconhecido')
    }

    setFixedImages(fixed)
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
        return <Badge variant="secondary">Verificando...</Badge>
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
          <ImageIcon className="h-5 w-5 text-blue-500" />
          Correção de Imagens com Fallback
        </CardTitle>
        <p className="text-sm text-gray-600">
          Esta ferramenta verifica imagens quebradas do Supabase e as substitui por versões em cache local.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runImageFallbackFix} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verificando e Corrigindo Imagens...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Verificar e Corrigir Imagens
            </>
          )}
        </Button>

        {tests.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resultados dos Testes:</h3>
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{test.message}</p>
                {test.details && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {test.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {fixedImages.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Imagens Corrigidas:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              {fixedImages.map((image, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  {image}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}