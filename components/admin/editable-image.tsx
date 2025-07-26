"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, AlertCircle } from "lucide-react"
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
  const [currentSrc, setCurrentSrc] = useState(src) // Use currentSrc for display
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync currentSrc with prop src when prop changes (e.g., from Supabase Realtime)
  useEffect(() => {
    setCurrentSrc(src)
    setUploadError(null) // Clear error if src updates
  }, [src])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset error state
    setUploadError(null)

    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError("File size exceeds the limit of 5MB")
      return
    }

    setIsUploading(true)

    try {
      const newSrc = await uploadImage(path, file) // Call the AdminContext's uploadImage
      if (newSrc) {
        setCurrentSrc(newSrc) // Update local state only if upload was successful
      } else {
        setUploadError("Failed to upload image to persistent storage.")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("Failed to upload image")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Clear the file input
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <LazyImage src={currentSrc} alt={alt} width={width} height={height} fill={fill} />
      {isAdmin && (
        <div className="absolute top-0 right-0 flex items-center justify-center space-x-2 p-2 bg-white rounded-bl rounded-tr shadow">
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload</span>
          </Button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          {isUploading && (
            <Button variant="ghost" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="sr-only">Uploading</span>
            </Button>
          )}
          {uploadError && (
            <Button variant="ghost" className="text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="sr-only">{uploadError}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
