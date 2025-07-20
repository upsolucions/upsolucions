"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Zap, Droplets, Car, Upload } from "lucide-react"
import { AdminLogin } from "@/components/admin/admin-login"
import { EditableText } from "@/components/admin/editable-text"
import { EditableImage } from "@/components/admin/editable-image"
import { ImageUploadModal } from "@/components/admin/image-upload-modal"
import { useAdmin } from "@/contexts/admin-context"

export default function SolucoesPage() {
  const { siteContent, isAdmin, updateContent } = useAdmin()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedSolutionIndex, setSelectedSolutionIndex] = useState<number | null>(null)

  const solutionIcons = [Zap, Droplets, Car]

  const handleImageUpload = async (imageUrl: string, title: string, alt: string) => {
    if (selectedSolutionIndex !== null) {
      await updateContent(`solutions.items.${selectedSolutionIndex}.image`, imageUrl)
      setShowUploadModal(false)
      setSelectedSolutionIndex(null)
    }
  }

  const openUploadModal = (index: number) => {
    setSelectedSolutionIndex(index)
    setShowUploadModal(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminLogin />

      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <EditableImage
                  path="logo"
                  src={siteContent.logo}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <EditableText path="siteName" value={siteContent.siteName} className="text-2xl font-bold" as="h1" />
                <p className="text-green-200 text-sm">Automação e Energia</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-700 bg-transparent"
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
      <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <EditableText
            path="solutions.title"
            value={siteContent.solutions.title}
            className="text-4xl font-bold mb-4"
            as="h2"
          />
          <EditableText
            path="solutions.subtitle"
            value={siteContent.solutions.subtitle}
            className="text-xl max-w-2xl mx-auto"
            as="p"
            multiline
          />
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {siteContent.solutions.items.map((solution: any, index: number) => {
              const IconComponent = solutionIcons[index] || Zap
              return (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
                >
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-8 h-8 text-green-600" />
                          </div>
                          <EditableText
                            path={`solutions.items.${index}.title`}
                            value={solution.title}
                            className="text-2xl font-semibold"
                            as="h3"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <EditableText
                          path={`solutions.items.${index}.fullDescription`}
                          value={solution.fullDescription}
                          className="text-gray-600 text-base leading-relaxed"
                          as="p"
                          multiline
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Principais características:</h4>
                          <ul className="space-y-2">
                            {solution.features?.map((feature: string, featureIndex: number) => (
                              <li key={featureIndex} className="flex items-center text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <EditableText
                                  path={`solutions.items.${index}.features.${featureIndex}`}
                                  value={feature}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Link href="/orcamento">Solicitar Orçamento</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                    <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg group">
                      <EditableImage
                        path={`solutions.items.${index}.image`}
                        src={solution.image}
                        alt={solution.title}
                        fill
                        className="object-cover"
                      />
                      {isAdmin && (
                        <Button
                          size="sm"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 hover:bg-green-700"
                          onClick={() => openUploadModal(index)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Alterar Imagem
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para Automatizar?</h3>
          <p className="text-xl mb-8">
            Entre em contato e descubra como nossas soluções podem transformar seu ambiente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/orcamento">Solicitar Orçamento</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-700 bg-transparent"
            >
              <Link href="/galeria">Ver Projetos Realizados</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <EditableImage
                    path="logo"
                    src={siteContent.logo}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <EditableText path="siteName" value={siteContent.siteName} className="text-xl font-bold" as="h4" />
                  <p className="text-gray-400 text-sm">Automação e Energia</p>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Contato</h5>
              <div className="space-y-2 text-gray-400">
                <p>
                  📱 WhatsApp: <EditableText path="contact.whatsapp" value={siteContent.contact.whatsapp} />
                </p>
                <p>
                  ✉️ Email: <EditableText path="contact.email" value={siteContent.contact.email} />
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
                <Link href="/galeria" className="block text-gray-400 hover:text-white transition-colors">
                  Galeria
                </Link>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Siga-nos no Instagram</h5>
              <div className="flex justify-center">
                <EditableImage
                  path="contact.instagram"
                  src={siteContent.contact.instagram}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <ImageUploadModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false)
            setSelectedSolutionIndex(null)
          }}
          onUpload={handleImageUpload}
          title="Alterar Imagem da Solução"
        />
      )}
    </div>
  )
}
