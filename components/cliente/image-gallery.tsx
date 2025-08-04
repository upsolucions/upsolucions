'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { ClienteImagem } from '@/types/cliente'
import { ImageStorageService } from '@/lib/image-storage'
import { ImageUpload } from './image-upload'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ImageGalleryProps {
  clienteId: string
  maxHeight?: number
}

export function ImageGallery({ clienteId, maxHeight = 400 }: ImageGalleryProps) {
  const [images, setImages] = useState<ClienteImagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadImages = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carregar metadados das imagens do localStorage
      const imageMetadata = localStorage.getItem(`cliente_images_${clienteId}`)
      if (imageMetadata) {
        const parsedImages = JSON.parse(imageMetadata)
        setImages(parsedImages)
      } else {
        setImages([])
      }
    } catch (err) {
      console.error('Erro ao carregar imagens:', err)
      setError('Nao foi possivel carregar as imagens')
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => {
    if (clienteId) {
      loadImages()
    }
  }, [clienteId, loadImages])

  const handleImageUploaded = useCallback(async (imageUrl: string, titulo: string, descricao?: string) => {
    // Recarregar as imagens do armazenamento local para garantir sincronização
    await loadImages()
    setShowUpload(false)
  }, [loadImages])

  const confirmDeleteImage = useCallback((imageId: string) => {
    setImageToDelete(imageId)
  }, [])

  const handleDeleteImage = useCallback(async () => {
    if (!imageToDelete) return
    
    try {
      setIsDeleting(true)
      
      // Obter a imagem para excluir
      const imageToRemove = images.find(img => img.id === imageToDelete)
      if (!imageToRemove) return
      
      // Excluir a imagem do armazenamento local usando a chave
      const imageKey = imageToRemove.url.split('image_').pop()?.split('.')[0]
      if (imageKey) {
        await ImageStorageService.deleteImage(`image_${imageKey}`)
      }
      
      // Atualizar a lista de imagens removendo a imagem excluída
      const updatedImages = images.filter(img => img.id !== imageToDelete)
      setImages(updatedImages)
      
      // Salvar a lista atualizada no localStorage
      localStorage.setItem(`cliente_images_${clienteId}`, JSON.stringify(updatedImages))
      
    } catch (err) {
      console.error('Erro ao excluir imagem:', err)
      setError('Nao foi possivel excluir a imagem')
    } finally {
      setIsDeleting(false)
      setImageToDelete(null)
    }
  }, [imageToDelete, images, clienteId])

  // Memoize a lista de imagens para evitar re-renderizações desnecessárias
  const imageGrid = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }
    
    if (error) {
      return <div className="text-center py-8 text-destructive">{error}</div>;
    }
    
    if (images.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Nenhuma imagem adicionada</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(image => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative group">
              <img 
                src={image.url} 
                alt={image.titulo} 
                loading="lazy" // Adiciona carregamento lazy para melhorar performance
                className="w-full object-cover" 
                style={{ maxHeight: `${maxHeight / 2}px`, minHeight: '150px' }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => confirmDeleteImage(image.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium truncate">{image.titulo}</h4>
              {image.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{image.descricao}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [images, loading, error, maxHeight, confirmDeleteImage]);
  
  const toggleUpload = useCallback(() => {
    setShowUpload(prev => !prev);
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Galeria de Imagens</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleUpload}
        >
          {showUpload ? 'Cancelar' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </>
          )}
        </Button>
      </div>
      
      {showUpload && (
        <ImageUpload 
          onImageUploaded={handleImageUploaded} 
          clienteId={clienteId} 
          maxWidth={300}
          maxHeight={200}
        />
      )}
      
      {imageGrid}
      
      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta imagem? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteImage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}