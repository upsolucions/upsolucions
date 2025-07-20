"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
}

export function LazyImage({ src, alt, width, height, className = "", fill = false, priority = false }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setMounted(true)
    setImageSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    setImageSrc("/placeholder.svg")
  }

  if (!mounted) {
    return (
      <div
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={fill ? {} : { width: width || "auto", height: height || "auto" }}
      />
    )
  }

  // For base64 images or data URLs, use regular img tag for better compatibility
  if (imageSrc?.startsWith("data:")) {
    return (
      <div className="relative w-full h-full">
        {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt || "Imagem"}
          className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500 ${fill ? "w-full h-full object-cover" : ""}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          style={
            fill
              ? { width: "100%", height: "100%", objectFit: "cover" }
              : { width: width || "auto", height: height || "auto" }
          }
        />
      </div>
    )
  }

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />}
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt || "Imagem"}
          fill
          className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="bg-gray-200 animate-pulse rounded absolute inset-0"
          style={{ width: width || "100%", height: height || "100%" }}
        />
      )}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt || "Imagem"}
        width={width || 300}
        height={height || 200}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        priority={priority}
      />
    </div>
  )
}
