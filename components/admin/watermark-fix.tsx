"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, Database } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { supabase } from "@/lib/supabase"

interface WatermarkStatus {
  exists: boolean
  error?: string
  data?: any
}

export function WatermarkFix() {
  const { siteContent, updateContent } = useAdmin()
  const [watermarkStatus, setWatermarkStatus] = useState<WatermarkStatus>({ exists: false })
  const [isChecking, setIsChecking] = useState(false)
  const [isFixing, setIsFixing] = useState(false)

  // Verificar status do watermark
  const checkWatermarkStatus = async () => {
    setIsChecking(true)
    try {
      // Tentar buscar dados de watermark do Supabase
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'watermark')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setWatermarkStatus({
            exists: false,
            error: 'Tabela site_content não existe'
          })
        } else if (error.code === 'PGRST205') {
          setWatermarkStatus({
            exists: false,
            error: 'Registro de watermark não encontrado'
          })
        } else {
          setWatermarkStatus({
            exists: false,
            error: error.message
          })
        }
      } else {
        setWatermarkStatus({
          exists: true,
          data: data.content
        })
      }
    } catch (error) {
      setWatermarkStatus({
        exists: false,
        error: (error as Error).message
      })
    }
    setIsChecking(false)
  }

  // Criar configuração padrão de watermark
  const createDefaultWatermark = async () => {
    setIsFixing(true)
    try {
      const defaultWatermarkConfig = {
        enabled: true,
        text: "Up Soluções",
        position: "bottom-right",
        opacity: 0.7,
        fontSize: 14,
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 8,
        borderRadius: 4
      }

      // Tentar criar no Supabase
      const { error: supabaseError } = await supabase
        .from('site_content')
        .upsert({
          id: 'watermark',
          content: defaultWatermarkConfig,
          updated_at: new Date().toISOString()
        })

      if (supabaseError) {
        console.warn('Erro ao salvar no Supabase, salvando localmente:', supabaseError)
      }

      // Salvar localmente também
      await updateContent('watermark', defaultWatermarkConfig)

      // Verificar novamente
      await checkWatermarkStatus()

      setWatermarkStatus({
        exists: true,
        data: defaultWatermarkConfig
      })
    } catch (error) {
      setWatermarkStatus({
        exists: false,
        error: 'Erro ao criar configuração: ' + (error as Error).message
      })
    }
    setIsFixing(false)
  }

  // Verificar ao carregar
  useEffect(() => {
    checkWatermarkStatus()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Correção de Watermark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Atual */}
        <Alert variant={watermarkStatus.exists ? "default" : "destructive"}>
          {watermarkStatus.exists ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {watermarkStatus.exists ? "Watermark Configurado" : "Problema com Watermark"}
          </AlertTitle>
          <AlertDescription>
            {watermarkStatus.exists 
              ? "Configuração de watermark encontrada e funcionando."
              : `Erro detectado: ${watermarkStatus.error || 'Configuração não encontrada'}`
            }
          </AlertDescription>
        </Alert>

        {/* Informações do Watermark */}
        {watermarkStatus.exists && watermarkStatus.data && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Configuração Atual:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Status: <span className={watermarkStatus.data.enabled ? "text-green-600" : "text-red-600"}>
                {watermarkStatus.data.enabled ? "Ativado" : "Desativado"}
              </span></div>
              <div>Texto: {watermarkStatus.data.text}</div>
              <div>Posição: {watermarkStatus.data.position}</div>
              <div>Opacidade: {watermarkStatus.data.opacity}</div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={checkWatermarkStatus} 
            disabled={isChecking}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Verificar Status
          </Button>
          
          {!watermarkStatus.exists && (
            <Button 
              onClick={createDefaultWatermark} 
              disabled={isFixing}
              className="flex items-center gap-2"
            >
              {isFixing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              Criar Configuração Padrão
            </Button>
          )}
        </div>

        {/* Informações sobre o erro */}
        {!watermarkStatus.exists && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sobre este Erro</AlertTitle>
            <AlertDescription>
              O erro "net::ERR_ABORTED" para watermark indica que a configuração de watermark não está sendo encontrada no banco de dados. 
              Isso pode acontecer quando:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>A tabela site_content não foi criada</li>
                <li>O registro de watermark não existe</li>
                <li>Há problemas de conectividade com o Supabase</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}