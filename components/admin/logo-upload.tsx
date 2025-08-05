"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, Image, Check, AlertCircle, Download } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface LogoUploadProps {
  onClose?: () => void
  onUploadComplete?: () => void
}

interface LogoFile {
  file: File
  preview: string
  name: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function LogoUpload({ onClose, onUploadComplete }: LogoUploadProps) {
  const { uploadImage, updateContent, siteContent } = useAdmin()
  const [logoFile, setLogoFile] = useState<LogoFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    const newLogoFile: LogoFile = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      status: 'pending',
      progress: 0
    }

    setLogoFile(newLogoFile)
  }

  const updateFileProperty = (property: keyof LogoFile, value: any) => {
    if (!logoFile) return
    setLogoFile(prev => prev ? { ...prev, [property]: value } : null)
  }

  const removeFile = () => {
    if (logoFile) {
      URL.revokeObjectURL(logoFile.preview)
      setLogoFile(null)
    }
  }

  const uploadLogo = async (): Promise<boolean> => {
    if (!logoFile) return false

    try {
      updateFileProperty('status', 'uploading')
      updateFileProperty('progress', 0)

      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        updateFileProperty('progress', prev => Math.min(prev + 10, 90))
      }, 200)

      const logoUrl = await uploadImage('logo', logoFile.file)

      clearInterval(progressInterval)
      updateFileProperty('progress', 100)

      if (logoUrl) {
        // Atualizar o logo no conteúdo do site
        await updateContent('logo', logoUrl)
        
        updateFileProperty('status', 'success')
        
        // Aguardar um pouco para mostrar o sucesso
        setTimeout(() => {
          if (onUploadComplete) {
            onUploadComplete()
          }
        }, 1000)
        
        return true
      } else {
        throw new Error('Falha no upload')
      }
    } catch (error) {
      updateFileProperty('status', 'error')
      updateFileProperty('error', error instanceof Error ? error.message : 'Erro desconhecido')
      return false
    }
  }

  const retryUpload = async () => {
    if (!logoFile || logoFile.status !== 'error') return
    await uploadLogo()
  }

  const downloadCurrentLogo = () => {
    if (siteContent?.logo) {
      const link = document.createElement('a')
      link.href = siteContent.logo
      link.download = 'logo-atual.png'
      link.click()
    }
  }

  return (
    <Card className="fixed inset-4 z-50 shadow-2xl max-w-2xl mx-auto max-h-[90vh] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Upload de Logo
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        {/* Logo atual */}
        {siteContent?.logo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Logo Atual</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadCurrentLogo}
              >
                <Download className="h-3 w-3 mr-1" />
                Baixar
              </Button>
            </div>
            <div className="w-24 h-24 bg-white rounded-lg border-2 border-gray-200 overflow-hidden mx-auto">
              <img 
                src={siteContent.logo} 
                alt="Logo atual" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Área de seleção de arquivo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Selecione um novo logo
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Formatos suportados: PNG, JPG, SVG (máximo 5MB)
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Preview e upload */}
        {logoFile && (
          <Card className="p-4">
            <div className="flex gap-4">
              {/* Preview do logo */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200">
                <img 
                  src={logoFile.preview} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Informações do arquivo */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm font-medium">Nome do arquivo</Label>
                  <p className="text-sm text-gray-600">{logoFile.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tamanho</Label>
                  <p className="text-sm text-gray-600">
                    {(logoFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                {/* Status e progresso */}
                <div className="space-y-2">
                  {logoFile.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-600">Pronto para upload</span>
                    </div>
                  )}
                  
                  {logoFile.status === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-600">Enviando...</span>
                      </div>
                      <Progress value={logoFile.progress} className="h-2" />
                    </div>
                  )}
                  
                  {logoFile.status === 'success' && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Upload concluído com sucesso!</span>
                    </div>
                  )}
                  
                  {logoFile.status === 'error' && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">{logoFile.error || 'Erro no upload'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              {logoFile.status === 'pending' && (
                <Button 
                  onClick={uploadLogo} 
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              )}
              
              {logoFile.status === 'error' && (
                <Button 
                  onClick={retryUpload} 
                  disabled={isUploading}
                  variant="outline"
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
              )}
              
              {logoFile.status === 'success' && onClose && (
                <Button 
                  onClick={onClose}
                  className="flex-1"
                >
                  Concluir
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Dicas */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm text-blue-800 mb-2">Dicas para o melhor resultado:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use imagens com fundo transparente (PNG)</li>
            <li>• Resolução recomendada: 200x200px ou superior</li>
            <li>• Mantenha proporções quadradas ou retangulares</li>
            <li>• Evite textos muito pequenos que podem ficar ilegíveis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}