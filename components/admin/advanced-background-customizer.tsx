"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Palette, Image, Upload, X, Move, RotateCcw } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface AdvancedBackgroundCustomizerProps {
  sectionId: string
  onClose?: () => void
}

export function AdvancedBackgroundCustomizer({ sectionId, onClose }: AdvancedBackgroundCustomizerProps) {
  const { isAdmin, updateContent, uploadImage, siteContent } = useAdmin()
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [isUploading, setIsUploading] = useState(false)
  const [draggedImages, setDraggedImages] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isAdmin) return null

  const currentBackground = siteContent.backgrounds?.[sectionId] || { type: 'color', value: '#ffffff' }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    updateContent(`backgrounds.${sectionId}`, {
      type: 'color',
      value: color,
      images: draggedImages
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
          images: draggedImages
        })
      }
    } catch (error) {
      console.error('Erro no upload da imagem de fundo:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      const newImages = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const imageUrl = await uploadImage(`backgrounds/${sectionId}/floating/${Date.now()}_${i}`, file)
        if (imageUrl) {
          newImages.push({
            id: `img_${Date.now()}_${i}`,
            src: imageUrl,
            x: Math.random() * 300,
            y: Math.random() * 200,
            width: 150,
            height: 150,
            rotation: 0,
            opacity: 1,
            zIndex: 1
          })
        }
      }
      const updatedImages = [...draggedImages, ...newImages]
      setDraggedImages(updatedImages)
      updateContent(`backgrounds.${sectionId}`, {
        ...currentBackground,
        images: updatedImages
      })
    } catch (error) {
      console.error('Erro no upload das imagens:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const updateImageProperty = (imageId: string, property: string, value: any) => {
    const updatedImages = draggedImages.map(img => 
      img.id === imageId ? { ...img, [property]: value } : img
    )
    setDraggedImages(updatedImages)
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      images: updatedImages
    })
  }

  const removeImage = (imageId: string) => {
    const updatedImages = draggedImages.filter(img => img.id !== imageId)
    setDraggedImages(updatedImages)
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      images: updatedImages
    })
  }

  const handleBackgroundSizeChange = (size: string) => {
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      size
    })
  }

  const handleBackgroundPositionChange = (position: string) => {
    updateContent(`backgrounds.${sectionId}`, {
      ...currentBackground,
      position
    })
  }

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

  return (
    <Card className="fixed top-4 right-4 w-96 max-h-[90vh] overflow-y-auto z-50 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Customizar {sectionId}
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
            <TabsTrigger value="position">Posição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="background" className="space-y-4">
            <div>
              <Label>Tipo de Fundo</Label>
              <Tabs defaultValue="color" className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="color">Cor</TabsTrigger>
                  <TabsTrigger value="image">Imagem</TabsTrigger>
                </TabsList>
                
                <TabsContent value="color" className="space-y-3">
                  <div className="flex gap-2">
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
                  
                  <div className="grid grid-cols-5 gap-2">
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
                </TabsContent>
                
                <TabsContent value="image" className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('bg-image-input')?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Enviando...' : 'Imagem de Fundo'}
                  </Button>
                  <input
                    id="bg-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                  
                  {currentBackground.type === 'image' && (
                    <div className="space-y-2">
                      <Label>Tamanho</Label>
                      <Select onValueChange={handleBackgroundSizeChange} defaultValue="cover">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cobrir</SelectItem>
                          <SelectItem value="contain">Conter</SelectItem>
                          <SelectItem value="auto">Automático</SelectItem>
                          <SelectItem value="100% 100%">Esticar</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Label>Posição</Label>
                      <Select onValueChange={handleBackgroundPositionChange} defaultValue="center">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="top">Topo</SelectItem>
                          <SelectItem value="bottom">Base</SelectItem>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                          <SelectItem value="top left">Topo Esquerda</SelectItem>
                          <SelectItem value="top right">Topo Direita</SelectItem>
                          <SelectItem value="bottom left">Base Esquerda</SelectItem>
                          <SelectItem value="bottom right">Base Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
              {isUploading ? 'Enviando...' : 'Adicionar Imagens Livres'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              className="hidden"
            />
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {draggedImages.map((img) => (
                <div key={img.id} className="flex items-center gap-2 p-2 border rounded">
                  <img src={img.src} alt="" className="w-8 h-8 object-cover rounded" />
                  <div className="flex-1 text-sm truncate">
                    {img.id}
                  </div>
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
          
          <TabsContent value="position" className="space-y-4">
            {draggedImages.length > 0 ? (
              <div className="space-y-4">
                {draggedImages.map((img) => (
                  <Card key={img.id} className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={img.src} alt="" className="w-6 h-6 object-cover rounded" />
                      <span className="text-sm font-medium truncate">{img.id}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">X: {Math.round(img.x)}px</Label>
                          <Slider
                            value={[img.x]}
                            onValueChange={([value]) => updateImageProperty(img.id, 'x', value)}
                            max={500}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y: {Math.round(img.y)}px</Label>
                          <Slider
                            value={[img.y]}
                            onValueChange={([value]) => updateImageProperty(img.id, 'y', value)}
                            max={500}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Largura: {Math.round(img.width)}px</Label>
                          <Slider
                            value={[img.width]}
                            onValueChange={([value]) => updateImageProperty(img.id, 'width', value)}
                            min={50}
                            max={400}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Altura: {Math.round(img.height)}px</Label>
                          <Slider
                            value={[img.height]}
                            onValueChange={([value]) => updateImageProperty(img.id, 'height', value)}
                            min={50}
                            max={400}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Opacidade: {Math.round(img.opacity * 100)}%</Label>
                        <Slider
                          value={[img.opacity]}
                          onValueChange={([value]) => updateImageProperty(img.id, 'opacity', value)}
                          min={0}
                          max={1}
                          step={0.1}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">Nenhuma imagem adicionada</p>
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
  )
}