"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface WatermarkConfig {
  enabled: boolean
  image: string
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: number
  opacity: number
  offsetX: number
  offsetY: number
  pages: string[]
}

const defaultConfig: WatermarkConfig = {
  enabled: true,
  image: '/up-solucions-logo.svg',
  position: 'center',
  size: 96,
  opacity: 5,
  offsetX: 0,
  offsetY: 0,
  pages: ['home', 'servicos', 'orcamento']
}

export function WatermarkConfig() {
  const [config, setConfig] = useState<WatermarkConfig>(defaultConfig)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'watermark')
        .single()
      
      if (data?.content) {
        setConfig({ ...defaultConfig, ...data.content })
      }
    } catch (error) {
      console.log('Usando configuração padrão da marca d\'água')
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      await supabase
        .from('site_content')
        .upsert({
          id: 'watermark',
          content: config,
          updated_at: new Date().toISOString()
        })
      
      alert('Configuração da marca d\'água salva com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 2MB')
      return
    }

    setUploading(true)
    try {
      // Converter imagem para base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setConfig(prev => ({ ...prev, image: base64 }))
        alert('Imagem carregada com sucesso!')
        setUploading(false)
      }
      reader.onerror = () => {
        alert('Erro ao ler o arquivo')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      console.error('Erro ao processar imagem:', error)
      alert(`Erro ao processar imagem: ${error.message || 'Erro desconhecido'}`)
      setUploading(false)
    }
  }

  const removeImage = () => {
    setConfig(prev => ({ ...prev, image: '/up-solucions-logo.svg' }))
  }

  const positionOptions = [
    { value: 'center', label: 'Centro' },
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'bottom-right', label: 'Inferior Direito' }
  ]

  const pageOptions = [
    { id: 'home', label: 'Página Inicial', description: 'Homepage do site' },
    { id: 'servicos', label: 'Serviços', description: 'Página de serviços' },
    { id: 'orcamento', label: 'Orçamento', description: 'Página de orçamento' },
    { id: 'galeria', label: 'Galeria', description: 'Página da galeria' },
    { id: 'solucoes', label: 'Soluções', description: 'Página de soluções' },
    { id: 'memories', label: 'Memórias', description: 'Página de memórias' }
  ]

  const [previewPage, setPreviewPage] = useState('home')

  const handlePageToggle = (pageId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      pages: checked 
        ? [...prev.pages, pageId]
        : prev.pages.filter(p => p !== pageId)
    }))
  }

  const getPageLayout = (pageId: string) => {
    switch (pageId) {
      case 'home':
        return {
          title: 'UP Soluções',
          subtitle: 'Transformando ideias em realidade',
          content: 'Serviços • Soluções • Qualidade',
          bgColor: 'bg-blue-50'
        }
      case 'servicos':
        return {
          title: 'Nossos Serviços',
          subtitle: 'Soluções completas para seu negócio',
          content: 'Desenvolvimento • Consultoria • Suporte',
          bgColor: 'bg-green-50'
        }
      case 'orcamento':
        return {
          title: 'Solicite um Orçamento',
          subtitle: 'Conte-nos sobre seu projeto',
          content: 'Formulário • Contato • Proposta',
          bgColor: 'bg-orange-50'
        }
      default:
        return {
          title: 'Página do Site',
          subtitle: 'Conteúdo da página',
          content: 'Texto • Imagens • Informações',
          bgColor: 'bg-gray-50'
        }
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configuração da Marca D'água</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativar/Desativar */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
          />
          <Label>Ativar marca d'água</Label>
        </div>

        {config.enabled && (
          <>
            {/* Upload de Imagem */}
            <div className="space-y-2">
              <Label>Imagem da Marca D'água</Label>
              <div className="flex items-center space-x-4">
                {config.image && (
                  <div className="relative">
                    <img
                      src={config.image}
                      alt="Marca d'água"
                      className="w-16 h-16 object-contain border rounded"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="watermark-upload"
                  />
                  <Button
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById('watermark-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Escolher Imagem'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Posição */}
            <div className="space-y-2">
              <Label>Posição</Label>
              <Select
                value={config.position}
                onValueChange={(position: any) => setConfig(prev => ({ ...prev, position }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tamanho */}
            <div className="space-y-2">
              <Label>Tamanho: {config.size}px</Label>
              <Slider
                value={[config.size]}
                onValueChange={([size]) => setConfig(prev => ({ ...prev, size }))}
                min={50}
                max={1000}
                step={10}
              />
            </div>

            {/* Opacidade */}
            <div className="space-y-2">
              <Label>Opacidade: {config.opacity}%</Label>
              <Slider
                value={[config.opacity]}
                onValueChange={([opacity]) => setConfig(prev => ({ ...prev, opacity }))}
                min={1}
                max={100}
                step={1}
              />
            </div>

            {/* Ajuste Fino de Posição */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deslocamento X: {config.offsetX}px</Label>
                <Slider
                  value={[config.offsetX]}
                  onValueChange={([offsetX]) => setConfig(prev => ({ ...prev, offsetX }))}
                  min={-200}
                  max={200}
                  step={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Deslocamento Y: {config.offsetY}px</Label>
                <Slider
                  value={[config.offsetY]}
                  onValueChange={([offsetY]) => setConfig(prev => ({ ...prev, offsetY }))}
                  min={-200}
                  max={200}
                  step={10}
                />
              </div>
            </div>

            {/* Seleção de Páginas */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Páginas onde exibir a marca d'água</Label>
              <div className="grid grid-cols-1 gap-3">
                {pageOptions.map(page => (
                  <div key={page.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={config.pages.includes(page.id)}
                      onCheckedChange={(checked) => handlePageToggle(page.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{page.label}</div>
                      <div className="text-sm text-gray-500">{page.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualização Avançada */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visualização da Marca D'água
                </Label>
                <Select value={previewPage} onValueChange={setPreviewPage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Escolha uma página" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map(page => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                {/* Simulação da página */}
                <div className={`w-full h-full ${getPageLayout(previewPage).bgColor} p-6`}>
                  {/* Header simulado */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300">
                    <div className="text-sm font-medium text-gray-600">UP Soluções</div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Conteúdo da página */}
                  <div className="space-y-3">
                    <h1 className="text-lg font-bold text-gray-800">{getPageLayout(previewPage).title}</h1>
                    <p className="text-sm text-gray-600">{getPageLayout(previewPage).subtitle}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      {getPageLayout(previewPage).content.split(' • ').map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-white rounded border">{item}</span>
                      ))}
                    </div>
                    
                    {/* Linhas de conteúdo simulado */}
                    <div className="space-y-2 mt-4">
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                
                {/* Marca d'água sobreposta */}
                {config.pages.includes(previewPage) && (
                  <div
                    className={`absolute pointer-events-none ${
                      config.position === 'center' ? 'inset-0 flex items-center justify-center' :
                      config.position === 'top-left' ? 'top-4 left-4' :
                      config.position === 'top-right' ? 'top-4 right-4' :
                      config.position === 'bottom-left' ? 'bottom-4 left-4' :
                      'bottom-4 right-4'
                    }`}
                    style={{
                      transform: `translate(${config.offsetX / 2}px, ${config.offsetY / 2}px)`
                    }}
                  >
                    <img
                      src={config.image}
                      alt="Preview da marca d'água"
                      style={{
                        width: `${config.size / 3}px`,
                        height: `${config.size / 3}px`,
                        opacity: config.opacity / 100
                      }}
                      className="object-contain"
                    />
                  </div>
                )}
                
                {/* Indicador quando a página não tem marca d'água */}
                {!config.pages.includes(previewPage) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 border">
                      Marca d'água não ativa nesta página
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                💡 Dica: Selecione diferentes páginas acima para ver como a marca d'água aparecerá em cada uma
              </div>
            </div>
          </>
        )}

        {/* Salvar */}
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  )
}