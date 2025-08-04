'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Upload, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { ImageStorageService } from '@/lib/image-storage'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, titulo: string, descricao?: string) => void
  clienteId: string
  maxWidth?: number
  maxHeight?: number
}

export function ImageUpload({ 
  onImageUploaded, 
  clienteId,
  maxWidth = 400,
  maxHeight = 300
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null)
      setPreview(null)
      return
    }

    const file = e.target.files[0]
    
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.')
      return
    }
    
    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.')
      return
    }

    setSelectedFile(file)
    
    // Criar preview de forma otimizada
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string)
        
        // Preencher título automaticamente com nome do arquivo sem extensão
        const fileName = file.name.split('.').slice(0, -1).join('.')
        setTitulo(fileName || 'Imagem')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  // Função para comprimir imagem
  const compressImage = async (file: File, quality = 0.7): Promise<File | null> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        
        reader.onerror = () => {
          console.error('[ImageUpload] Erro ao ler arquivo para compressão')
          resolve(null)
        }
        
        reader.onload = (event) => {
          try {
            const img = new Image()
            
            img.onerror = () => {
              console.error('[ImageUpload] Erro ao carregar imagem para compressão')
              resolve(null)
            }
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                if (!ctx) {
                  console.error('[ImageUpload] Erro ao obter contexto do canvas')
                  resolve(null)
                  return
                }
                
                // Calcular dimensões mantendo proporção
                let width = img.width
                let height = img.height
                
                if (width > 1200) {
                  height = Math.round((height * 1200) / width)
                  width = 1200
                }
                
                canvas.width = width
                canvas.height = height
                
                ctx.drawImage(img, 0, 0, width, height)
                
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      console.error('[ImageUpload] Erro ao gerar blob da imagem comprimida')
                      resolve(null)
                      return
                    }
                    try {
                      const newFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                      })
                      resolve(newFile)
                    } catch (error) {
                      console.error('[ImageUpload] Erro ao criar novo arquivo:', error)
                      resolve(null)
                    }
                  },
                  file.type,
                  quality
                )
              } catch (error) {
                console.error('[ImageUpload] Erro durante compressão:', error)
                resolve(null)
              }
            }
            
            img.src = event.target?.result as string
          } catch (error) {
            console.error('[ImageUpload] Erro ao processar imagem:', error)
            resolve(null)
          }
        }
        
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('[ImageUpload] Erro geral na compressão:', error)
        resolve(null)
      }
    })
  }

  const handleUpload = useCallback(async () => {
    console.log('[ImageUpload] Iniciando upload...', { selectedFile: !!selectedFile, titulo, clienteId })
    
    if (!selectedFile || !titulo.trim()) {
      setError('Por favor, selecione uma imagem e forneça um título.')
      return
    }
    
    if (!clienteId) {
      setError('ID do cliente não encontrado. Faça login novamente.')
      return
    }

    setIsUploading(true)
    setError(null)

    // Timeout para evitar travamentos
    const uploadTimeout = setTimeout(() => {
      console.error('[ImageUpload] Timeout no upload - operação cancelada')
      setError('Timeout no upload. Tente novamente com uma imagem menor.')
      setIsUploading(false)
    }, 30000) // 30 segundos

    try {
      console.log('[ImageUpload] Processando arquivo...', { size: selectedFile.size, type: selectedFile.type })
      // Comprimir imagem antes do upload se for muito grande
      let fileToUpload = selectedFile
      if (selectedFile.size > 1024 * 1024) { // Se for maior que 1MB
        console.log('[ImageUpload] Comprimindo imagem...')
        const compressedFile = await compressImage(selectedFile, 0.7) // 70% de qualidade
        if (compressedFile) {
          fileToUpload = compressedFile
          console.log('[ImageUpload] Imagem comprimida:', { originalSize: selectedFile.size, compressedSize: compressedFile.size })
        }
      }

      // Gerar nome único para o arquivo
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${clienteId}/${Date.now()}.${fileExt}`
      const filePath = `cliente-imagens/${fileName}`

      // Converter arquivo para Data URL
      console.log('[ImageUpload] Convertendo arquivo para DataURL...')
      const dataUrl = await ImageStorageService.fileToDataUrl(fileToUpload)
      console.log('[ImageUpload] DataURL gerado, tamanho:', dataUrl.length)
      
      // Gerar chave única para a imagem
      const imageKey = ImageStorageService.generateImageKey(filePath, selectedFile.name)
      console.log('[ImageUpload] Chave gerada:', imageKey)
      
      // Salvar no armazenamento local
      console.log('[ImageUpload] Salvando no armazenamento local...')
      let saved = await ImageStorageService.saveImage(imageKey, dataUrl, {
        originalName: selectedFile.name,
        path: filePath,
        size: fileToUpload.size,
        type: fileToUpload.type,
        uploadedAt: new Date().toISOString(),
        clienteId,
        titulo,
        descricao: descricao || null
      })

      // Se falhou, tentar limpar IndexedDB e salvar novamente
      if (!saved) {
        console.log('[ImageUpload] Primeira tentativa falhou, limpando IndexedDB...')
        await ImageStorageService.clearIndexedDB()
        saved = await ImageStorageService.saveImage(imageKey, dataUrl, {
          originalName: selectedFile.name,
          path: filePath,
          size: fileToUpload.size,
          type: fileToUpload.type,
          uploadedAt: new Date().toISOString(),
          clienteId,
          titulo,
          descricao: descricao || null
        })
      }

      console.log('[ImageUpload] Resultado do salvamento:', saved)
      
      if (!saved) {
        throw new Error('Falha ao salvar imagem no armazenamento local')
      }

      // Salvar metadados das imagens do cliente no localStorage
      console.log('[ImageUpload] Salvando metadados...')
      const clienteImagesKey = `cliente_images_${clienteId}`
      const existingImages = JSON.parse(localStorage.getItem(clienteImagesKey) || '[]')
      const newImage = {
        id: imageKey,
        url: dataUrl,
        titulo,
        descricao: descricao || null,
        created_at: new Date().toISOString()
      }
      existingImages.push(newImage)
      localStorage.setItem(clienteImagesKey, JSON.stringify(existingImages))
      console.log('[ImageUpload] Metadados salvos')

      // Notificar componente pai
      console.log('[ImageUpload] Notificando componente pai...')
      onImageUploaded(dataUrl, titulo, descricao)
      
      // Limpar formulário
      console.log('[ImageUpload] Limpando formulário...')
      setSelectedFile(null)
      setPreview(null)
      setTitulo('')
      setDescricao('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      console.log('[ImageUpload] Upload concluído com sucesso!')
      clearTimeout(uploadTimeout)
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      clearTimeout(uploadTimeout)
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, titulo, descricao, clienteId, onImageUploaded])

  const handleCancel = useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setTitulo('')
    setDescricao('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Memoize os handlers de input para evitar re-renderizações desnecessárias
  const handleTituloChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitulo(e.target.value)
  }, [])

  const handleDescricaoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescricao(e.target.value)
  }, [])

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCancelButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    handleCancel()
  }, [handleCancel])

  return (
    <Card className="w-full" style={{ maxWidth: `${maxWidth}px` }}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="image-upload">Selecionar imagem</Label>
            <div 
              className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleImageClick}
              style={{ height: preview ? 'auto' : '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            >
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    loading="lazy"
                    className="max-w-full rounded-md" 
                    style={{ maxHeight: `${maxHeight - 100}px` }}
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-0 right-0 h-6 w-6 rounded-full -mt-2 -mr-2"
                    onClick={handleCancelButtonClick}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para selecionar ou arraste uma imagem</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou GIF (max. 5MB)</p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titulo">Titulo da imagem</Label>
            <Input 
              id="titulo" 
              value={titulo} 
              onChange={handleTituloChange} 
              placeholder="Digite um titulo para a imagem"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao (opcional)</Label>
            <Textarea 
              id="descricao" 
              value={descricao} 
              onChange={handleDescricaoChange} 
              placeholder="Digite uma descricao para a imagem"
              rows={2}
              disabled={isUploading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isUploading || !selectedFile}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !selectedFile || !titulo.trim()}
            >
              {isUploading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processando...
                </>
              ) : (
                'Enviar imagem'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}