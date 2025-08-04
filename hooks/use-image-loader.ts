"use client"

import { useState, useEffect, useCallback } from 'react'
import { ImageStorageService } from '../lib/image-storage'

interface UseImageLoaderOptions {
  fallbackUrl?: string
  retryAttempts?: number
  retryDelay?: number
}

interface ImageState {
  src: string | null
  isLoading: boolean
  error: string | null
  isFromCache: boolean
}

export function useImageLoader(initialSrc: string | null, options: UseImageLoaderOptions = {}) {
  const {
    fallbackUrl = '/placeholder.svg?height=200&width=300&text=Imagem',
    retryAttempts = 3,
    retryDelay = 1000
  } = options

  const [imageState, setImageState] = useState<ImageState>({
    src: initialSrc,
    isLoading: Boolean(initialSrc),
    error: null,
    isFromCache: false
  })

  const loadImage = useCallback(async (src: string | null, attempt = 0): Promise<void> => {
    if (!src) {
      setImageState({
        src: fallbackUrl,
        isLoading: false,
        error: null,
        isFromCache: false
      })
      return
    }

    setImageState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Se for uma data URL, usar diretamente
      if (src.startsWith('data:')) {
        setImageState({
          src,
          isLoading: false,
          error: null,
          isFromCache: true
        })
        return
      }

      // Tentar carregar a imagem normalmente primeiro
      const img = new Image()
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setImageState({
            src,
            isLoading: false,
            error: null,
            isFromCache: false
          })
          resolve()
        }
        
        img.onerror = () => {
          reject(new Error(`Falha ao carregar imagem: ${src}`))
        }
        
        img.src = src
      })

      // Timeout para evitar travamento
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar imagem')), 5000)
      })

      await Promise.race([loadPromise, timeoutPromise])

    } catch (error) {
      console.warn(`[useImageLoader] Erro ao carregar imagem (tentativa ${attempt + 1}):`, error)
      
      // Tentar buscar no cache local
      try {
        const imageKey = ImageStorageService.generateImageKey('cache', src.split('/').pop() || 'unknown')
        const cachedImage = await ImageStorageService.getImage(imageKey)
        
        if (cachedImage) {
          console.log('[useImageLoader] Imagem encontrada no cache local')
          setImageState({
            src: cachedImage,
            isLoading: false,
            error: null,
            isFromCache: true
          })
          return
        }
      } catch (cacheError) {
        console.warn('[useImageLoader] Erro ao buscar no cache:', cacheError)
      }

      // Retry logic
      if (attempt < retryAttempts) {
        console.log(`[useImageLoader] Tentando novamente em ${retryDelay}ms...`)
        setTimeout(() => {
          loadImage(src, attempt + 1)
        }, retryDelay)
        return
      }

      // Usar fallback após esgotar tentativas
      console.error('[useImageLoader] Todas as tentativas falharam, usando fallback')
      setImageState({
        src: fallbackUrl,
        isLoading: false,
        error: `Falha ao carregar imagem após ${retryAttempts} tentativas`,
        isFromCache: false
      })
    }
  }, [fallbackUrl, retryAttempts, retryDelay])

  // Recarregar imagem quando src mudar
  useEffect(() => {
    loadImage(initialSrc)
  }, [initialSrc, loadImage])

  // Função para forçar recarregamento
  const reload = useCallback(() => {
    loadImage(initialSrc)
  }, [initialSrc, loadImage])

  // Função para limpar cache de uma imagem específica
  const clearCache = useCallback(async (src: string) => {
    try {
      const imageKey = ImageStorageService.generateImageKey('cache', src.split('/').pop() || 'unknown')
      // Note: ImageStorageService não tem método para deletar imagem específica
      // Implementar se necessário
      console.log('[useImageLoader] Cache clearing não implementado para imagem específica')
    } catch (error) {
      console.error('[useImageLoader] Erro ao limpar cache:', error)
    }
  }, [])

  return {
    src: imageState.src,
    isLoading: imageState.isLoading,
    error: imageState.error,
    isFromCache: imageState.isFromCache,
    reload,
    clearCache
  }
}

// Hook específico para imagens uploadadas
export function useUploadedImage(imagePath: string | null) {
  const [cachedSrc, setCachedSrc] = useState<string | null>(null)
  const [isLoadingCache, setIsLoadingCache] = useState(false)

  useEffect(() => {
    if (!imagePath) {
      setCachedSrc(null)
      return
    }

    const loadFromCache = async () => {
      setIsLoadingCache(true)
      try {
        // Tentar diferentes chaves possíveis
        const possibleKeys = [
          ImageStorageService.generateImageKey('uploads', imagePath.split('/').pop() || ''),
          ImageStorageService.generateImageKey('images', imagePath.split('/').pop() || ''),
          ImageStorageService.generateImageKey('', imagePath.split('/').pop() || '')
        ]

        for (const key of possibleKeys) {
          const cached = await ImageStorageService.getImage(key)
          if (cached) {
            setCachedSrc(cached)
            setIsLoadingCache(false)
            return
          }
        }

        // Se não encontrou no cache, usar o path original
        setCachedSrc(imagePath)
      } catch (error) {
        console.error('[useUploadedImage] Erro ao carregar do cache:', error)
        setCachedSrc(imagePath)
      } finally {
        setIsLoadingCache(false)
      }
    }

    loadFromCache()
  }, [imagePath])

  const imageLoader = useImageLoader(cachedSrc)

  return {
    ...imageLoader,
    isLoadingCache,
    originalPath: imagePath
  }
}