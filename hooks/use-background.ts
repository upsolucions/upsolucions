"use client"

import { useAdmin } from "@/contexts/admin-context"
import { useEffect, useState } from "react"

interface BackgroundConfig {
  type: 'color' | 'image'
  value: string
}

export function useBackground(sectionId: string) {
  const { siteContent } = useAdmin()
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const backgroundConfig = siteContent.backgrounds?.[sectionId] as BackgroundConfig
    
    if (!backgroundConfig) {
      setBackgroundStyle({})
      return
    }

    if (backgroundConfig.type === 'color') {
      setBackgroundStyle({
        backgroundColor: backgroundConfig.value
      })
    } else if (backgroundConfig.type === 'image') {
      setBackgroundStyle({
        backgroundImage: `url(${backgroundConfig.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      })
    }
  }, [siteContent.backgrounds, sectionId])

  return backgroundStyle
}

export function useBackgroundClass(sectionId: string): string {
  const { siteContent } = useAdmin()
  const backgroundConfig = siteContent.backgrounds?.[sectionId] as BackgroundConfig
  
  if (!backgroundConfig) {
    return ''
  }

  if (backgroundConfig.type === 'color') {
    // Para cores, retornamos uma classe vazia pois usaremos style inline
    return ''
  } else if (backgroundConfig.type === 'image') {
    return 'bg-cover bg-center bg-no-repeat'
  }

  return ''
}