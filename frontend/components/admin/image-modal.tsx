"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  alt: string
  title?: string
}

export function ImageModal({ isOpen, onClose, src, alt, title }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="relative w-full h-[80vh]">
          <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain" />
        </div>
        {title && (
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
