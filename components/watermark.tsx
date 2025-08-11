"use client"

import { useWatermark } from '@/hooks/use-watermark'

interface WatermarkProps {
  pageId: string
}

export function Watermark({ pageId }: WatermarkProps) {
  const { config, loading, getPositionClasses, getWatermarkStyle, shouldShowWatermark } = useWatermark()

  if (loading || !shouldShowWatermark(pageId)) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className={`absolute ${getPositionClasses()}`}>
        <img
          src={config.image}
          alt="Marca d'água"
          style={getWatermarkStyle()}
          className="object-contain select-none"
        />
      </div>
    </div>
  )
}