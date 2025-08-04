'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Paintbrush, Save } from 'lucide-react'
import { ClientePreferencias } from '@/types/cliente'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'

interface ColorCustomizerProps {
  clienteId: string
}

export function ColorCustomizer({ clienteId }: ColorCustomizerProps) {
  const [preferencias, setPreferencias] = useState<ClientePreferencias | null>(null)
  const [corPrimaria, setCorPrimaria] = useState('#3b82f6')
  const [corSecundaria, setCorSecundaria] = useState('#10b981')
  const [corFundo, setCorFundo] = useState('#ffffff')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const applyColors = useCallback((primary = corPrimaria, secondary = corSecundaria, background = corFundo) => {
    // Aplicar cores ao CSS da página
    document.documentElement.style.setProperty('--primary', primary)
    document.documentElement.style.setProperty('--secondary', secondary)
    document.documentElement.style.setProperty('--background', background)
  }, [corPrimaria, corSecundaria, corFundo])

  const loadPreferencias = useCallback(async () => {
    if (!clienteId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cliente_preferencias')
        .select('*')
        .eq('cliente_id', clienteId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        throw error
      }

      if (data) {
        setPreferencias(data)
        if (data.cor_primaria) setCorPrimaria(data.cor_primaria)
        if (data.cor_secundaria) setCorSecundaria(data.cor_secundaria)
        if (data.cor_fundo) setCorFundo(data.cor_fundo)
        applyColors(data.cor_primaria, data.cor_secundaria, data.cor_fundo)
      }
    } catch (err) {
      console.error('Erro ao carregar preferências:', err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar suas preferências de cores.'
      })
    } finally {
      setLoading(false)
    }
  }, [clienteId, toast, applyColors])

  useEffect(() => {
    loadPreferencias()
  }, [loadPreferencias])

  useEffect(() => {
    // Aplicar cores quando elas mudarem
    applyColors()
  }, [corPrimaria, corSecundaria, corFundo])

  const handleSave = useCallback(async () => {
    if (!clienteId) return
    
    try {
      setSaving(true)
      
      // Aplicar cores ao CSS
      applyColors(corPrimaria, corSecundaria, corFundo)
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('cliente_preferencias')
        .upsert({
          cliente_id: clienteId,
          cor_primaria: corPrimaria,
          cor_secundaria: corSecundaria,
          cor_fundo: corFundo,
          updated_at: new Date().toISOString()
        }, { onConflict: 'cliente_id' }) // Especificar coluna de conflito para melhorar performance
      
      if (error) throw error
      
      toast({
        title: 'Cores salvas',
        description: 'Suas preferências de cores foram salvas com sucesso.'
      })
      
    } catch (err) {
      console.error('Erro ao salvar preferências:', err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar suas preferências de cores.'
      })
    } finally {
      setSaving(false)
    }
  }, [clienteId, corPrimaria, corSecundaria, corFundo, applyColors, toast])

  const handleReset = useCallback(() => {
    // Cores padrão
    const defaultPrimary = '#0f172a'
    const defaultSecondary = '#6366f1'
    const defaultBackground = '#ffffff'
    
    setCorPrimaria(defaultPrimary)
    setCorSecundaria(defaultSecondary)
    setCorFundo(defaultBackground)
    
    // Aplicar cores
    applyColors(defaultPrimary, defaultSecondary, defaultBackground)
  }, [applyColors])

  // Memoize o conteúdo do componente para evitar re-renderizações desnecessárias
  const colorCustomizerContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }
    
    // Handlers para mudanças de cor com useCallback
    const handlePrimaryColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setCorPrimaria(e.target.value), []);
    const handleSecondaryColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setCorSecundaria(e.target.value), []);
    const handleBackgroundColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setCorFundo(e.target.value), []);
    
    return (
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Paintbrush className="h-5 w-5" />
          <h3 className="text-lg font-medium">Personalizar Cores</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="corPrimaria" className="flex items-center gap-2">
              Cor Primária
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: corPrimaria }}
              />
            </Label>
            <div className="flex gap-2">
              <Input 
                id="corPrimaria"
                type="color" 
                value={corPrimaria} 
                onChange={handlePrimaryColorChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text" 
                value={corPrimaria} 
                onChange={handlePrimaryColorChange}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="corSecundaria" className="flex items-center gap-2">
              Cor Secundária
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: corSecundaria }}
              />
            </Label>
            <div className="flex gap-2">
              <Input 
                id="corSecundaria"
                type="color" 
                value={corSecundaria} 
                onChange={handleSecondaryColorChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text" 
                value={corSecundaria} 
                onChange={handleSecondaryColorChange}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="corFundo" className="flex items-center gap-2">
              Cor de Fundo
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: corFundo }}
              />
            </Label>
            <div className="flex gap-2">
              <Input 
                id="corFundo"
                type="color" 
                value={corFundo} 
                onChange={handleBackgroundColorChange}
                className="w-12 h-10 p-1"
              />
              <Input 
                type="text" 
                value={corFundo} 
                onChange={handleBackgroundColorChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Preferências
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-4 p-4 rounded-md border" style={{ backgroundColor: corFundo }}>
          <h4 className="font-medium mb-2" style={{ color: corPrimaria }}>Prévia das Cores</h4>
          <p className="text-sm" style={{ color: corSecundaria }}>Este é um exemplo de como suas cores serão exibidas.</p>
          <div className="flex gap-2 mt-2">
            <div className="px-3 py-1 rounded-md text-white text-sm" style={{ backgroundColor: corPrimaria }}>Botão Primário</div>
            <div className="px-3 py-1 rounded-md text-white text-sm" style={{ backgroundColor: corSecundaria }}>Botão Secundário</div>
          </div>
        </div>
      </CardContent>
    );
  }, [corPrimaria, corSecundaria, corFundo, loading, saving, handleReset, handleSave]);
  
  return (
    <Card>
      {colorCustomizerContent}
    </Card>
  )
}