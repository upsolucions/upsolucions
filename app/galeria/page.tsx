"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"
import { AdminLogin } from "@/components/admin/admin-login"
import { EditableText } from "@/components/admin/editable-text"
import { EditableImage } from "@/components/admin/editable-image"
import { ImageModal } from "@/components/admin/image-modal"
import { GalleryUpload } from "@/components/admin/gallery-upload"
import { useAdmin } from "@/contexts/admin-context"

export default function GaleriaPage() {
  const { siteContent, isAdmin, updateContent, uploadImage } = useAdmin()
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const addNewMainImage = async (file: File, title: string, alt: string) => {
    // The path for the image in storage should be unique, but also reflect its place in content.
    // useAdmin().uploadImage now handles generating the unique storage path.
    const imageUrl = await uploadImage(`gallery.mainImages.${siteContent?.gallery?.mainImages?.length || 0}`, file)
    if (imageUrl) {
      const newImage = {
        src: imageUrl, // This is the persistent URL from Supabase Storage
        title: title || `Projeto ${(siteContent?.gallery?.mainImages?.length || 0) + 1}`,
        alt: alt || `Descrição do projeto ${(siteContent?.gallery?.mainImages?.length || 0) + 1}`,
      }
      const currentImages = siteContent?.gallery?.mainImages || []
      const updatedImages = [...currentImages, newImage]
      await updateContent("gallery.mainImages", updatedImages) // Update content with the new image object
      setShowUploadModal(false)
      setImageLoadErrors({})
    } else {
      console.error("Failed to upload main image to Supabase. Image will not be added.")
      // Optionally, show an error message to the user here
    }
  }

  const addNewSubImage = async (file: File, title: string, alt: string) => {
    const imageUrl = await uploadImage(`gallery.subGallery.${siteContent?.gallery?.subGallery?.length || 0}`, file)
    if (imageUrl) {
      const newImage = {
        src: imageUrl,
        title: title || `Projeto ${(siteContent?.gallery?.subGallery?.length || 0) + 1}`,
        alt: alt || `Descrição do projeto ${(siteContent?.gallery?.subGallery?.length || 0) + 1}`,
      }
      const currentImages = siteContent?.gallery?.subGallery || []
      const updatedImages = [...currentImages, newImage]
      await updateContent("gallery.subGallery", updatedImages)
      setImageLoadErrors({})
    } else {
      console.error("Failed to upload sub image to Supabase. Image will not be added.")
      // Optionally, show an error message to the user here
    }
  }

  const removeMainImage = async (index: number) => {
    const currentImages = siteContent?.gallery?.mainImages || []
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index)
    await updateContent("gallery.mainImages", updatedImages)
  }

  const removeSubImage = async (index: number) => {
    const currentImages = siteContent?.gallery?.subGallery || []
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index)
    await updateContent("gallery.subGallery", updatedImages)
  }

  const handleImageError = (imageKey: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [imageKey]: true }))
  }

  const handleImageLoad = (imageKey: string) => {
    setImageLoadErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[imageKey]
      return newErrors
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">Carregando galeria...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminLogin />

      {/* Header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <EditableImage
                  path="logo"
                  src={siteContent?.logo || "/placeholder.svg?height=53&width=53&text=Logo"}
                  alt="Logo"
                  width={53}
                  height={53}
                  className="object-contain"
                />
              </div>
              <div>
                <EditableText
                  path="siteName"
                  value={siteContent?.siteName || "Up Solicions"}
                  className="text-2xl font-bold"
                  as="h1"
                />
                <p className="text-purple-200 text-sm">Galeria de Projetos</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-700 bg-transparent"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <EditableText
            path="gallery.title"
            value={siteContent?.gallery?.title || "Galeria de Projetos"}
            className="text-4xl font-bold mb-4"
            as="h2"
          />
          <EditableText
            path="gallery.subtitle"
            value={
              siteContent?.gallery?.subtitle ||
              "Conheça alguns dos nossos trabalhos realizados com excelência e qualidade"
            }
            className="text-xl max-w-2xl mx-auto"
            as="p"
            multiline
          />
        </div>
      </section>

      {/* Admin Controls */}
      {isAdmin && (
        <section className="py-4 bg-blue-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Foto Principal
              </Button>
              <Button
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.multiple = true
                  input.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                      for (let i = 0; i < files.length; i++) {
                        const file = files[i]
                        await addNewSubImage(file, file.name.split(".")[0], `Projeto ${file.name}`)
                      }
                    }
                  }
                  input.click()
                }}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Múltiplas Fotos
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Projetos Principais</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteContent?.gallery?.mainImages?.map((image: any, index: number) => {
              const imageKey = `main-${index}`
              const imageSrc = image?.src || `/placeholder.svg?height=400&width=600&text=Projeto+${index + 1}`

              return (
                <Card
                  key={imageKey}
                  className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer relative"
                >
                  <div className="relative h-64 overflow-hidden" onClick={() => setSelectedImage(image)}>
                    <img
                      src={imageSrc || "/placeholder.svg"}
                      alt={image?.alt || `Projeto ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={() => handleImageLoad(imageKey)}
                      onError={() => handleImageError(imageKey)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-medium">Clique para ampliar</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Tem certeza que deseja remover esta imagem?")) {
                            removeMainImage(index)
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <EditableText
                      path={`gallery.mainImages.${index}.title`}
                      value={image?.title || `Projeto ${index + 1}`}
                      className="font-semibold text-gray-900 mb-2"
                      as="h4"
                    />
                    <EditableText
                      path={`gallery.mainImages.${index}.alt`}
                      value={image?.alt || `Descrição do projeto ${index + 1}`}
                      className="text-gray-600 text-sm"
                      as="p"
                      multiline
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Projeto realizado com sucesso pela equipe {siteContent?.siteName || "Up Solicions"}
                    </p>
                  </CardContent>
                </Card>
              )
            }) || []}
          </div>
        </div>
      </section>

      {/* Sub Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Mais Projetos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {siteContent?.gallery?.subGallery?.map((image: any, index: number) => {
              const imageKey = `sub-${index}`
              const imageSrc = image?.src || `/placeholder.svg?height=300&width=400&text=Foto+${index + 1}`

              return (
                <Card
                  key={imageKey}
                  className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer relative"
                >
                  <div className="relative h-32 overflow-hidden" onClick={() => setSelectedImage(image)}>
                    <img
                      src={imageSrc || "/placeholder.svg"}
                      alt={image?.alt || `Projeto ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onLoad={() => handleImageLoad(imageKey)}
                      onError={() => handleImageError(imageKey)}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs font-medium">Ampliar</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm("Tem certeza que deseja remover esta imagem?")) {
                            removeSubImage(index)
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="p-2">
                      <EditableText
                        path={`gallery.subGallery.${index}.title`}
                        value={image?.title || `Projeto ${index + 1}`}
                        className="text-xs text-gray-600"
                        placeholder="Título do projeto"
                      />
                    </div>
                  )}
                </Card>
              )
            }) || []}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Gostou dos Nossos Trabalhos?</h3>
          <p className="text-xl mb-8">Solicite seu orçamento e faça parte da nossa galeria de sucessos</p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/orcamento">Solicitar Orçamento</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-11 h-11 bg-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <EditableImage
                    path="logo"
                    src={siteContent?.logo || "/placeholder.svg?height=44&width=44&text=Logo"}
                    alt="Logo"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div>
                  <EditableText
                    path="siteName"
                    value={siteContent?.siteName || "Up Solicions"}
                    className="text-xl font-bold"
                    as="h4"
                  />
                  <p className="text-gray-400 text-sm">Galeria de Projetos</p>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Contato</h5>
              <div className="space-y-2 text-gray-400">
                <p>
                  📱 WhatsApp:{" "}
                  <EditableText path="contact.whatsapp" value={siteContent?.contact?.whatsapp || "(21) 97531-0179"} />
                </p>
                <p>
                  ✉️ Email:{" "}
                  <EditableText path="contact.email" value={siteContent?.contact?.email || "upsolucions@hotmail.com"} />
                </p>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Links Rápidos</h5>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                  Início
                </Link>
                <Link href="/servicos" className="block text-gray-400 hover:text-white transition-colors">
                  Serviços
                </Link>
                <Link href="/solucoes" className="block text-gray-400 hover:text-white transition-colors">
                  Soluções
                </Link>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Siga-nos no Instagram</h5>
              <div className="flex justify-center">
                <EditableImage
                  path="contact.instagram"
                  src={siteContent?.contact?.instagram || "/instagram-qr.png"}
                  alt="QR Code Instagram"
                  width={150}
                  height={150}
                  className="rounded-lg"
                />
              </div>
              <p className="text-gray-400 text-sm text-center mt-2">Escaneie o QR Code</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          src={selectedImage.src || "/placeholder.svg"}
          alt={selectedImage.alt}
          title={selectedImage.title}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <GalleryUpload isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={addNewMainImage} />
      )}
    </div>
  )
}
