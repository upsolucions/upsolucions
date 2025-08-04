"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertCircle, RefreshCw, X } from "lucide-react"
import { LazyImage } from "@/components/ui/lazy-image"
import { useAdmin } from "@/contexts/admin-context"
import { useUploadedImage } from "@/hooks/use-image-loader"

interface EditableImageProps {
  path: string
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
}

export function EditableImage({ path, src, alt, width, height, className = "", fill = false }: EditableImageProps) {
  const { isAdmin, uploadImage, updateContent } = useAdmin()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Usar o hook robusto para carregamento de imagens
  const { 
    src: imageSrc, 
    isLoading: isLoadingImage, 
    error: imageError, 
    isFromCache,
    reload: reloadImage,
    isLoadingCache
  } = useUploadedImage(src)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)

    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError("Arquivo muito grande. Máximo permitido: 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    setIsUploading(true)

    try {
      console.log('[EditableImage] Iniciando upload para:', path)
      const imageUrl = await uploadImage(path, file)
      
      if (imageUrl) {
        console.log('[EditableImage] Upload bem-sucedido:', imageUrl)
        
        // Atualizar o conteúdo através do contexto admin
        updateContent(path, imageUrl)
        
        // Forçar recarregamento da imagem após upload
        setTimeout(() => {
          reloadImage()
        }, 100)
      } else {
        setUploadError("Falha no upload da imagem")
      }
    } catch (error) {
      console.error('[EditableImage] Erro no upload:', error)
      setUploadError("Erro no upload da imagem")
    } finally {
      setIsUploading(false)
      // Limpar o input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    updateContent(path, '')
    setUploadError(null)
  }

  const handleReloadImage = () => {
    setUploadError(null)
    reloadImage()
  }

  // Determinar qual src usar e estados
  const displaySrc = imageSrc || src || ''
  const hasImage = Boolean(displaySrc && displaySrc !== '')
  const showLoading = isUploading || isLoadingImage || isLoadingCache
  const showError = uploadError || imageError

  return (
    <div className={`relative group ${className}`}>
      <div className="relative">
        <LazyImage 
          src={displaySrc} 
          alt={alt} 
          width={width} 
          height={height} 
          fill={fill} 
        />
        
        {/* Indicador de cache */}
        {isFromCache && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
            Cache
          </div>
        )}
        
        {/* Loading overlay */}
        {showLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-sm">
                {isUploading ? 'Enviando...' : isLoadingCache ? 'Carregando cache...' : 'Carregando...'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {isAdmin && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={showLoading}
            title="Upload nova imagem"
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          {hasImage && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleReloadImage} 
              disabled={showLoading}
              title="Recarregar imagem"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          {hasImage && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRemoveImage} 
              disabled={showLoading}
              title="Remover imagem"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </div>
      )}
      
      {showError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-2 rounded-b flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {uploadError || imageError}
          </div>
          {imageError && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-white hover:text-red-200"
              onClick={handleReloadImage}
            >
              Tentar novamente
            </Button>
          )}
        </div>
      )}
      

    </div>
  )
}
