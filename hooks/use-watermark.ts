"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useWatermark() {
  const [config, setConfig] = useState<WatermarkConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const getPositionClasses = () => {
    switch (config.position) {
      case 'center':
        return 'inset-0 flex items-center justify-center'
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'inset-0 flex items-center justify-center'
    }
  }

  const getWatermarkStyle = () => ({
    width: `${config.size}px`,
    height: `${config.size}px`,
    opacity: config.opacity / 100,
    transform: `translate(${config.offsetX}px, ${config.offsetY}px)`
  })

  const shouldShowWatermark = (pageId: string) => {
    return config.enabled && config.pages.includes(pageId)
  }

  return {
    config,
    loading,
    getPositionClasses,
    getWatermarkStyle,
    shouldShowWatermark,
    refresh: loadConfig
  }
}