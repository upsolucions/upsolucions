"use client"

import { useState, useRef } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Upload, Loader2, AlertCircle, RefreshCw, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface UploadableImageProps {
  path: string
  currentSrc?: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallbackSrc?: string
  title?: string
  showUploadButton?: boolean
  aspectRatio?: string
}

export function UploadableImage({
  path,
  currentSrc,
  alt,
  className = "",
  width,
  height,
  fallbackSrc = "/placeholder.svg",
  title,
  showUploadButton = true,
  aspectRatio = "auto"
}: UploadableImageProps) {
  const { isAdmin, uploadImage, updateContent } = useAdmin()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determinar a fonte da imagem
  const imageSrc = currentSrc || fallbackSrc
  const isPlaceholder = imageSrc.includes('placeholder') || imageSrc.includes('.svg')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validação de arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setUploadError('O arquivo deve ter no máximo 5MB.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `${path.replace(/\./g, '_')}_${timestamp}.${file.name.split('.').pop()}`
      
      // Upload da imagem
      const imageUrl = await uploadImage(fileName, file)
      
      if (imageUrl) {
        // Atualizar o conteúdo com a nova URL
        await updateContent(path, imageUrl)
        console.log(`[UploadableImage] Imagem atualizada para path '${path}':`, imageUrl)
      } else {
        throw new Error('Falha no upload da imagem')
      }
    } catch (error) {
      console.error('[UploadableImage] Erro no upload:', error)
      setUploadError(error instanceof Error ? error.message : 'Erro desconhecido no upload')
    } finally {
      setIsUploading(false)
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    try {
      await updateContent(path, fallbackSrc)
      setUploadError(null)
    } catch (error) {
      console.error('[UploadableImage] Erro ao remover imagem:', error)
      setUploadError('Erro ao remover imagem')
    }
  }

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ aspectRatio }}
    >
      {/* Imagem */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            width={width || 400}
            height={height || 300}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = fallbackSrc
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay para admin */}
        {isAdmin && (isHovered || isUploading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity">
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                  <span className="text-white text-sm">Enviando...</span>
                </>
              ) : (
                <>
                  {showUploadButton && (
                    <Button
                      onClick={handleUploadClick}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isPlaceholder ? 'Adicionar Imagem' : 'Trocar Imagem'}
                    </Button>
                  )}
                  
                  {!isPlaceholder && (
                    <Button
                      onClick={handleRemoveImage}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Indicadores de status */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1">
          {isPlaceholder && (
            <Badge variant="secondary" className="text-xs">
              Placeholder
            </Badge>
          )}
          
          {!isPlaceholder && (
            <Badge variant="default" className="text-xs">
              Personalizada
            </Badge>
          )}
        </div>
      )}

      {/* Título da imagem */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white text-sm font-medium">{title}</h3>
        </div>
      )}

      {/* Erro de upload */}
      {uploadError && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-red-500 text-white text-xs p-2 rounded flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {uploadError}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente específico para logos
export function UploadableLogo({
  path,
  currentSrc,
  alt = "Logo",
  className = "h-36 w-auto",
  ...props
}: Omit<UploadableImageProps, 'aspectRatio'>) {
  return (
    <UploadableImage
      path={path}
      currentSrc={currentSrc}
      alt={alt}
      className={className}
      aspectRatio="auto"
      {...props}
    />
  )
}

// Componente específico para ícones de serviços
export function UploadableServiceIcon({
  path,
  currentSrc,
  alt,
  className = "w-40 h-40 mx-auto mb-4",
  ...props
}: Omit<UploadableImageProps, 'aspectRatio'>) {
  return (
    <UploadableImage
      path={path}
      currentSrc={currentSrc}
      alt={alt}
      className={className}
      aspectRatio="1/1"
      width={160}
      height={160}
      {...props}
    />
  )
}

// Componente específico para galeria
export function UploadableGalleryImage({
  path,
  currentSrc,
  alt,
  title,
  className = "w-full h-86",
  ...props
}: UploadableImageProps) {
  return (
    <UploadableImage
      path={path}
      currentSrc={currentSrc}
      alt={alt}
      title={title}
      className={className}
      aspectRatio="16/9"
      width={490}
      height={315}
      {...props}
    />
  )
}