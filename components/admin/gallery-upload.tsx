"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Image, Check, AlertCircle } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface GalleryUploadProps {
  onClose?: () => void
  onUploadComplete?: () => void
  galleryType?: 'main' | 'sub'
}

interface UploadFile {
  file: File
  preview: string
  title: string
  alt: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function GalleryUpload({ onClose, onUploadComplete, galleryType = 'main' }: GalleryUploadProps) {
  const { uploadImage, updateContent, siteContent } = useAdmin()
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: UploadFile[] = Array.from(files).map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0],
      alt: `Projeto ${file.name}`,
      status: 'pending',
      progress: 0
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }

  const updateFileProperty = (index: number, property: keyof UploadFile, value: any) => {
    setUploadFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [property]: value } : file
    ))
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadSingleFile = async (fileData: UploadFile, index: number): Promise<boolean> => {
    try {
      updateFileProperty(index, 'status', 'uploading')
      updateFileProperty(index, 'progress', 0)

      const galleryPath = galleryType === 'main' ? 'mainImages' : 'subGallery'
      const currentImages = siteContent?.gallery?.[galleryPath] || []
      const imageIndex = currentImages.length + index
      
      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        updateFileProperty(index, 'progress', prev => Math.min(prev + 10, 90))
      }, 200)

      const imageUrl = await uploadImage(
        `gallery.${galleryPath}.${imageIndex}`, 
        fileData.file
      )

      clearInterval(progressInterval)
      updateFileProperty(index, 'progress', 100)

      if (imageUrl) {
        const newImage = {
          src: imageUrl,
          title: fileData.title,
          alt: fileData.alt
        }

        const updatedImages = [...currentImages, newImage]
        await updateContent(`gallery.${galleryPath}`, updatedImages)
        
        updateFileProperty(index, 'status', 'success')
        return true
      } else {
        throw new Error('Falha no upload')
      }
    } catch (error) {
      updateFileProperty(index, 'status', 'error')
      updateFileProperty(index, 'error', error instanceof Error ? error.message : 'Erro desconhecido')
      return false
    }
  }

  const uploadAllFiles = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)
    
    try {
      const uploadPromises = uploadFiles
        .filter(file => file.status === 'pending')
        .map((file, index) => uploadSingleFile(file, index))
      
      await Promise.all(uploadPromises)
      
      // Verificar se todos foram bem-sucedidos
      const allSuccess = uploadFiles.every(file => file.status === 'success')
      
      if (allSuccess && onUploadComplete) {
        onUploadComplete()
      }
    } catch (error) {
      console.error('Erro no upload em lote:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const retryFailedUploads = async () => {
    const failedFiles = uploadFiles
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => file.status === 'error')
    
    if (failedFiles.length === 0) return

    setIsUploading(true)
    
    try {
      for (const { file, index } of failedFiles) {
        await uploadSingleFile(file, index)
      }
    } catch (error) {
      console.error('Erro ao tentar novamente:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const clearAll = () => {
    uploadFiles.forEach(file => URL.revokeObjectURL(file.preview))
    setUploadFiles([])
  }

  const pendingCount = uploadFiles.filter(f => f.status === 'pending').length
  const successCount = uploadFiles.filter(f => f.status === 'success').length
  const errorCount = uploadFiles.filter(f => f.status === 'error').length

  return (
    <Card className="fixed inset-4 z-50 shadow-2xl max-w-4xl mx-auto max-h-[90vh] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Múltiplo - Galeria {galleryType === 'main' ? 'Principal' : 'Secundária'}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
        {/* Área de seleção de arquivos */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Suporte para múltiplas imagens (JPG, PNG, WebP)
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Status do upload */}
        {uploadFiles.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {uploadFiles.length} arquivo(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <Button 
                    onClick={uploadAllFiles} 
                    disabled={isUploading}
                    size="sm"
                  >
                    Upload Todos ({pendingCount})
                  </Button>
                )}
                {errorCount > 0 && (
                  <Button 
                    onClick={retryFailedUploads} 
                    disabled={isUploading}
                    variant="outline"
                    size="sm"
                  >
                    Tentar Novamente ({errorCount})
                  </Button>
                )}
                <Button 
                  onClick={clearAll} 
                  disabled={isUploading}
                  variant="destructive"
                  size="sm"
                >
                  Limpar Tudo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-blue-600">Pendentes: {pendingCount}</div>
              <div className="text-green-600">Sucesso: {successCount}</div>
              <div className="text-red-600">Erro: {errorCount}</div>
            </div>
          </div>
        )}

        {/* Lista de arquivos */}
        <div className="space-y-3">
          {uploadFiles.map((fileData, index) => (
            <Card key={index} className="p-4">
              <div className="flex gap-4">
                {/* Preview da imagem */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={fileData.preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Informações do arquivo */}
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        value={fileData.title}
                        onChange={(e) => updateFileProperty(index, 'title', e.target.value)}
                        disabled={isUploading || fileData.status === 'success'}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={fileData.alt}
                        onChange={(e) => updateFileProperty(index, 'alt', e.target.value)}
                        disabled={isUploading || fileData.status === 'success'}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  {/* Status e progresso */}
                  <div className="flex items-center gap-2">
                    {fileData.status === 'pending' && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-xs">Aguardando</span>
                      </div>
                    )}
                    
                    {fileData.status === 'uploading' && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-yellow-600">Enviando...</span>
                        </div>
                        <Progress value={fileData.progress} className="h-2" />
                      </div>
                    )}
                    
                    {fileData.status === 'success' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-xs">Sucesso</span>
                      </div>
                    )}
                    
                    {fileData.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{fileData.error || 'Erro'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
