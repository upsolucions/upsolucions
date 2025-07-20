"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Edit, Loader2, AlertCircle } from "lucide-react"
import { LazyImage } from "@/components/ui/lazy-image"
import { useAdmin } from "@/contexts/admin-context"

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
  const { isAdmin, uploadImage } = useAdmin()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [currentSrc, setCurrentSrc] = useState(src)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Arquivo muito grande. Máximo 5MB.")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    setIsUploading(true)
    try {
      const newImageUrl = await uploadImage(path, file)
      if (newImageUrl) {
        setCurrentSrc(newImageUrl)
        setUploadError(null)
      } else {
        setUploadError("Erro ao fazer upload da imagem.")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("Erro ao fazer upload da imagem.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative group">
      <LazyImage
        src={currentSrc || src || "/placeholder.svg"}
        alt={alt || "Imagem"}
        width={width}
        height={height}
        className={className}
        fill={fill}
      />

      {isAdmin && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-xs px-2 py-1"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Upload className="w-3 h-3 mr-1" />
                <Edit className="w-3 h-3" />
              </>
            )}
          </Button>

          {uploadError && (
            <div className="absolute top-12 right-2 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs max-w-48 z-10">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {uploadError}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <div className="bg-white px-3 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Enviando...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
