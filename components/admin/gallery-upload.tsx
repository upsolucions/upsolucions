"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"

const GalleryUpload: React.FC<{
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, title: string, alt: string) => Promise<void>
}> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = React.useState("")
  const [alt, setAlt] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB.")
      return
    }

    setError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-fill title and alt if empty
    if (!title) {
      setTitle(file.name.split(".")[0].replace(/[-_]/g, " "))
    }
    if (!alt) {
      setAlt(`Projeto ${file.name.split(".")[0]}`)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione uma imagem.")
      return
    }
    if (!title.trim()) {
      setError("Por favor, adicione um título.")
      return
    }
    setIsUploading(true)
    setError(null)
    try {
      // Pass the File object directly to the onUpload prop
      await onUpload(selectedFile, title.trim(), alt.trim() || title.trim())
      handleClose()
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setAlt("")
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setIsUploading(false)
    onClose()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Foto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label htmlFor="file-upload">Imagem</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                selectedFile ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-2">
                  <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-green-600 font-medium">{selectedFile?.name}</p>
                  <Button size="sm" variant="outline" onClick={triggerFileInput}>
                    Trocar Imagem
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Clique para selecionar uma imagem</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title">Título do Projeto *</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Sistema de Videomonitoramento - Empresa XYZ"
              required
            />
          </div>

          {/* Alt Text Input */}
          <div className="space-y-2">
            <label htmlFor="alt">Descrição (Alt Text)</label>
            <Textarea
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Descrição detalhada do projeto para acessibilidade"
              className="min-h-[80px]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar à Galeria
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GalleryUpload
export { GalleryUpload }
