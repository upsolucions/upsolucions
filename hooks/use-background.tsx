"use client"

import { useAdmin } from "@/contexts/admin-context"
import { useEffect, useState } from "react"
import React from "react"

interface BackgroundConfig {
  type: 'color' | 'image'
  value: string
  size?: string
  position?: string
  repeat?: string
  images?: Array<{
    id: string
    src: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    opacity: number
    zIndex: number
  }>
}

export function useBackground(sectionId: string) {
  const { siteContent } = useAdmin()
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({})
  const [floatingImages, setFloatingImages] = useState<JSX.Element[]>([])

  useEffect(() => {
    const backgroundConfig = siteContent.backgrounds?.[sectionId] as BackgroundConfig
    
    if (!backgroundConfig) {
      setBackgroundStyle({})
      setFloatingImages([])
      return
    }

    // Configurar fundo principal
    if (backgroundConfig.type === 'color') {
      setBackgroundStyle({
        backgroundColor: backgroundConfig.value
      })
    } else if (backgroundConfig.type === 'image') {
      setBackgroundStyle({
        backgroundImage: `url(${backgroundConfig.value})`,
        backgroundSize: backgroundConfig.size || 'cover',
        backgroundPosition: backgroundConfig.position || 'center',
        backgroundRepeat: backgroundConfig.repeat || 'no-repeat'
      })
    }

    // Configurar imagens flutuantes
    if (backgroundConfig.images && backgroundConfig.images.length > 0) {
      const imageElements = backgroundConfig.images.map((img) => (
        <div
          key={img.id}
          style={{
            position: 'absolute',
            left: `${img.x}px`,
            top: `${img.y}px`,
            width: `${img.width}px`,
            height: `${img.height}px`,
            transform: `rotate(${img.rotation}deg)`,
            opacity: img.opacity,
            zIndex: img.zIndex,
            pointerEvents: 'none'
          }}
        >
          <img
            src={img.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </div>
      ))
      setFloatingImages(imageElements)
    } else {
      setFloatingImages([])
    }
  }, [siteContent.backgrounds, sectionId])

  return { backgroundStyle, floatingImages }
}

export function useBackgroundClass(sectionId: string): string {
  const { siteContent } = useAdmin()
  const backgroundConfig = siteContent.backgrounds?.[sectionId] as BackgroundConfig
  
  if (!backgroundConfig) {
    return ''
  }

  if (backgroundConfig.type === 'color') {
    return ''
  } else if (backgroundConfig.type === 'image') {
    return 'bg-cover bg-center bg-no-repeat'
  }

  return ''
}

// Hook para renderizar o container com fundo e imagens
export function useAdvancedBackground(sectionId: string = 'global') {
  const { backgroundStyle, floatingImages } = useBackground(sectionId)
  
  const BackgroundContainer = ({ children, className = "", ...props }: any) => (
    <div 
      className={`relative ${className}`} 
      style={backgroundStyle}
      {...props}
    >
      {children}
      {floatingImages}
    </div>
  )
  
  return BackgroundContainer
}