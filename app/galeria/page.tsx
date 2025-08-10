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
  const { siteContent, isAdmin, updateContent, uploadImage, isLoading } = useAdmin()
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'main' | 'sub'>('main')
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Forçar re-renderização quando siteContent mudar
  useEffect(() => {
    if (siteContent && mounted) {
      console.log('[GaleriaPage] Dados da galeria carregados:', {
        mainImages: siteContent?.gallery?.mainImages?.length || 0,
        subGallery: siteContent?.gallery?.subGallery?.length || 0
      })
    }
  }, [siteContent, mounted])

  // Escutar eventos de atualização da galeria
  useEffect(() => {
    const handleGalleryUpdate = (event: CustomEvent) => {
      console.log('[GaleriaPage] Evento de atualização da galeria recebido:', event.detail)
      // Forçar re-renderização removendo e adicionando erros de imagem
      setImageLoadErrors({})
      // Pequeno delay para garantir que o DOM seja atualizado
      setTimeout(() => {
        setMounted(false)
        setTimeout(() => setMounted(true), 50)
      }, 100)
    }

    const handleContentSynced = (event: CustomEvent) => {
      const { path } = event.detail
      if (path && path.startsWith('gallery.')) {
        console.log('[GaleriaPage] Conteúdo da galeria sincronizado:', event.detail)
        // Forçar re-renderização quando conteúdo da galeria for sincronizado
        setImageLoadErrors({})
        setTimeout(() => {
          setMounted(false)
          setTimeout(() => setMounted(true), 50)
        }, 100)
      }
    }

    window.addEventListener('galleryUpdated', handleGalleryUpdate as EventListener)
    window.addEventListener('contentSynced', handleContentSynced as EventListener)
    
    return () => {
      window.removeEventListener('galleryUpdated', handleGalleryUpdate as EventListener)
      window.removeEventListener('contentSynced', handleContentSynced as EventListener)
    }
  }, [])

  const handleUploadComplete = () => {
    setShowUpload(false)
    // Forçar atualização da galeria após upload
    setTimeout(() => {
      setImageLoadErrors({})
      setMounted(false)
      setTimeout(() => setMounted(true), 50)
    }, 200)
  }

  const removeMainImage = async (index: number) => {
    const currentImages = siteContent?.gallery?.mainImages || []
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index)
    await updateContent("gallery.mainImages", updatedImages)
    
    // Disparar evento de atualização imediata
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('galleryUpdated', {
        detail: { galleryPath: 'mainImages', updatedImages }
      }))
    }, 100)
  }

  const removeSubImage = async (index: number) => {
    const currentImages = siteContent?.gallery?.subGallery || []
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index)
    await updateContent("gallery.subGallery", updatedImages)
    
    // Disparar evento de atualização imediata
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('galleryUpdated', {
        detail: { galleryPath: 'subGallery', updatedImages }
      }))
    }, 100)
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

  if (!mounted || isLoading || !siteContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">
            {!mounted ? 'Inicializando...' : isLoading ? 'Carregando dados...' : 'Carregando galeria...'}
          </p>
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
              <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
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
              <Button 
                onClick={() => {
                  setUploadType('main')
                  setShowUpload(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Múltiplo - Galeria Principal
              </Button>
              <Button 
                onClick={() => {
                  setUploadType('sub')
                  setShowUpload(true)
                }}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Múltiplo - Galeria Secundária
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
            {(siteContent?.gallery?.mainImages || []).map((image: any, index: number) => {
              const imageKey = `main-${index}`
              const imageSrc = image?.src || "/placeholder.svg"

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
            {(siteContent?.gallery?.subGallery || []).map((image: any, index: number) => {
              const imageKey = `sub-${index}`
              const imageSrc = image?.src || "/placeholder.svg"

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
                <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
                  <EditableImage
                    path="logo"
                    src={siteContent?.logo || "/placeholder-logo.svg"}
                    alt="Logo"
                    width={96}
                    height={96}
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
      {showUpload && (
        <GalleryUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
          galleryType={uploadType}
        />
      )}
    </div>
  )
}
