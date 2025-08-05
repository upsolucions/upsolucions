"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Image, Upload } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface BackgroundCustomizerProps {
  sectionId: string
  currentBackground?: string
}

export function BackgroundCustomizer({ sectionId, currentBackground = "" }: BackgroundCustomizerProps) {
  const { isAdmin, updateContent, uploadImage } = useAdmin()
  const [selectedColor, setSelectedColor] = useState("#ffffff")
  const [isUploading, setIsUploading] = useState(false)

  if (!isAdmin) return null

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    updateContent(`backgrounds.${sectionId}`, {
      type: 'color',
      value: color
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(`backgrounds/${sectionId}`, file)
      if (imageUrl) {
        updateContent(`backgrounds.${sectionId}`, {
          type: 'image',
          value: imageUrl
        })
      }
    } catch (error) {
      console.error('Erro no upload da imagem de fundo:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveBackground = () => {
    updateContent(`backgrounds.${sectionId}`, {
      type: 'color',
      value: '#ffffff'
    })
  }

  const presetColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#334155', '#475569', '#64748b', '#94a3b8',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
  ]

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalizar Fundo - {sectionId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="color" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="color">Cor</TabsTrigger>
            <TabsTrigger value="image">Imagem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="color" className="space-y-4">
            <div>
              <Label htmlFor="color-picker">Cor personalizada</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="color-picker"
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
            </div>
            
            <div>
              <Label>Cores predefinidas</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Upload de imagem</Label>
              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full"
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
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveBackground}
            className="w-full"
          >
            Remover Fundo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}