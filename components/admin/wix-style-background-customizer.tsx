"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Palette, Image, Upload, X, Move, RotateCcw, Eye, EyeOff } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface DraggableImage {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  visible: boolean
}

interface WixStyleBackgroundCustomizerProps {
  sectionId?: string
  onClose?: () => void
}

export function WixStyleBackgroundCustomizer({ sectionId = 'global', onClose }: WixStyleBackgroundCustomizerProps) {
  const { isAdmin, updateContent, uploadImage, siteContent } = useAdmin()
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [isUploading, setIsUploading] = useState(false)
  const [draggedImages, setDraggedImages] = useState<DraggableImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  if (!isAdmin) return null

  const currentBackground = siteContent.backgrounds?.[sectionId] || { type: 'color', value: '#ffffff', images: [] }

  // Carregar imagens existentes
  useEffect(() => {
    if (currentBackground.images) {
      setDraggedImages(currentBackground.images.map(img => ({ ...img, visible: true })))
    }
  }, [currentBackground.images])

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    updateContent(`backgrounds.${sectionId}`, {
      type: 'color',
      value: color,
      images: draggedImages.filter(img => img.visible)
    })
  }

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(`backgrounds/${sectionId}/bg`, file)
      if (imageUrl) {
        updateContent(`backgrounds.${sectionId}`, {
          type: 'image',
          value: imageUrl,
          size: 'cover',
          position: 'center',
          repeat: 'no-repeat',
          images: draggedImages.filter(img => img.visible)
        })
      }
    } catch (error) {
      console.error('Erro no upload da imagem de fundo:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      const newImages: DraggableImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const imageUrl = await uploadImage(`backgrounds/${sectionId}/floating/${Date.now()}_${i}`, file)
        if (imageUrl) {
          newImages.push({
            id: `img_${Date.now()}_${i}`,
            src: imageUrl,
            x: 50 + (i * 20),
            y: 50 + (i * 20),
            width: 200,
            height: 150,
            rotation: 0,
            opacity: 1,
            zIndex: draggedImages.length + i + 1,
            visible: true
          })
        }
      }
      const updatedImages = [...draggedImages, ...newImages]
      setDraggedImages(updatedImages)
      updateContent(`backgrounds.${sectionId}`, {
        ...currentBackground,
        images: updatedImages.filter(img => img.visible)
      })
    } catch (error) {
      console.error('Erro no upload das imagens:', error)
      alert('Erro ao fazer upload das imagens. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const updateImageProperty = (imageId: string, property: keyof DraggableImage, value: any) => {
    const updatedImages = draggedImages.map(img => 
      img.id === imageId ? { ...img, [property]: value } : img
    )
    setDraggedImages(updatedImages)
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      images: updatedImages.filter(img => img.visible)
    })
  }

  const removeImage = (imageId: string) => {
    const updatedImages = draggedImages.filter(img => img.id !== imageId)
    setDraggedImages(updatedImages)
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      images: updatedImages.filter(img => img.visible)
    })
  }

  const toggleImageVisibility = (imageId: string) => {
    updateImageProperty(imageId, 'visible', !draggedImages.find(img => img.id === imageId)?.visible)
  }

  const handleMouseDown = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault()
    setSelectedImageId(imageId)
    setIsDragging(true)
    
    const image = draggedImages.find(img => img.id === imageId)
    if (image && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left - image.x,
        y: e.clientY - rect.top - image.y
      })
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedImageId || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const newX = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x))
    const newY = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y))
    
    updateImageProperty(selectedImageId, 'x', newX)
    updateImageProperty(selectedImageId, 'y', newY)
  }, [isDragging, selectedImageId, dragOffset, updateImageProperty])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setSelectedImageId(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const resetBackground = () => {
    setDraggedImages([])
    updateContent(`backgrounds.${sectionId}`, {
      type: 'color',
      value: '#ffffff',
      images: []
    })
  }

  const presetColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#334155', '#475569', '#64748b', '#94a3b8',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
    '#000000', '#1f2937', '#374151', '#6b7280'
  ]

  const selectedImage = draggedImages.find(img => img.id === selectedImageId)

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Canvas de Edição */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className="w-full h-full relative"
          style={{
            backgroundColor: currentBackground.type === 'color' ? currentBackground.value : 'transparent',
            backgroundImage: currentBackground.type === 'image' ? `url(${currentBackground.value})` : 'none',
            backgroundSize: currentBackground.size || 'cover',
            backgroundPosition: currentBackground.position || 'center',
            backgroundRepeat: currentBackground.repeat || 'no-repeat'
          }}
        >
          {/* Grid de fundo para facilitar posicionamento */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Imagens flutuantes */}
          {draggedImages.filter(img => img.visible).map((img) => (
            <div
              key={img.id}
              className={`absolute cursor-move border-2 transition-all ${
                selectedImageId === img.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300'
              }`}
              style={{
                left: `${img.x}px`,
                top: `${img.y}px`,
                width: `${img.width}px`,
                height: `${img.height}px`,
                transform: `rotate(${img.rotation}deg)`,
                opacity: img.opacity,
                zIndex: img.zIndex
              }}
              onMouseDown={(e) => handleMouseDown(e, img.id)}
            >
              <img
                src={img.src}
                alt=""
                className="w-full h-full object-cover rounded"
                draggable={false}
              />
              {selectedImageId === img.id && (
                <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  {img.id}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Painel de Controle */}
      <Card className="w-80 h-full overflow-y-auto shadow-xl border-l">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Editor Wix-Style
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="background" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="background">Fundo</TabsTrigger>
              <TabsTrigger value="images">Imagens</TabsTrigger>
              <TabsTrigger value="edit">Editar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="background" className="space-y-4">
              <div>
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
                
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Imagem de Fundo</Label>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => document.getElementById('bg-image-input')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Enviando...' : 'Escolher Imagem'}
                </Button>
                <input
                  id="bg-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="hidden"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Adicionar Imagens'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImageUpload}
                className="hidden"
              />
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {draggedImages.map((img) => (
                  <div key={img.id} className="flex items-center gap-2 p-2 border rounded">
                    <img src={img.src} alt="" className="w-8 h-8 object-cover rounded" />
                    <div className="flex-1 text-sm truncate">
                      {img.id}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleImageVisibility(img.id)}
                    >
                      {img.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(img.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="edit" className="space-y-4">
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <img src={selectedImage.src} alt="" className="w-8 h-8 object-cover rounded" />
                    <span className="text-sm font-medium">{selectedImage.id}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Largura: {Math.round(selectedImage.width)}px</Label>
                      <Slider
                        value={[selectedImage.width]}
                        onValueChange={([value]) => updateImageProperty(selectedImage.id, 'width', value)}
                        min={50}
                        max={500}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Altura: {Math.round(selectedImage.height)}px</Label>
                      <Slider
                        value={[selectedImage.height]}
                        onValueChange={([value]) => updateImageProperty(selectedImage.id, 'height', value)}
                        min={50}
                        max={500}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Rotação: {Math.round(selectedImage.rotation)}°</Label>
                      <Slider
                        value={[selectedImage.rotation]}
                        onValueChange={([value]) => updateImageProperty(selectedImage.id, 'rotation', value)}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Opacidade: {Math.round(selectedImage.opacity * 100)}%</Label>
                      <Slider
                        value={[selectedImage.opacity]}
                        onValueChange={([value]) => updateImageProperty(selectedImage.id, 'opacity', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm">Clique em uma imagem para editá-la</p>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={resetBackground}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar Tudo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}