"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AdminLogin } from "@/components/admin/admin-login"
import { EditableText } from "@/components/admin/editable-text"
import { EditableImage } from "@/components/admin/editable-image"
import { UploadableServiceIcon, UploadableLogo } from "@/components/admin/uploadable-image"
import { UploadDiagnostics } from "@/components/admin/upload-diagnostics"
import { ServiceUploadTest } from "@/components/admin/service-upload-test"
import { AdminStatusTest } from "@/components/admin/admin-status-test"
import { SupabaseConnectivityTest } from "@/components/admin/supabase-connectivity-test"
import { Watermark } from "@/components/watermark"

import { useAdmin } from "@/contexts/admin-context"

export default function ServicosPage() {
  const { siteContent, isAdmin } = useAdmin()

  // Removido serviceIcons - agora usando componentes de upload

  return (
    <div className="min-h-screen bg-white relative">
      <AdminLogin />
      <Watermark pageId="servicos" />

      {/* Header */}
      <header className="bg-slate-600 text-white shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UploadableLogo
                path="logo"
                currentSrc={siteContent.logo}
                alt="Logo da empresa"
                className="h-12 w-auto"
              />
              <div>
                <EditableText path="siteName" value={siteContent.siteName} className="text-2xl font-bold" as="h1" />
                <p className="text-slate-200 text-sm">Nossos Serviços</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-600 bg-transparent"
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
      <section className="bg-gradient-to-r from-slate-600 to-slate-500 text-white py-16 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <EditableText
            path="services.title"
            value={siteContent.services.title}
            className="text-4xl font-bold mb-4"
            as="h2"
          />
          <EditableText
            path="services.subtitle"
            value={siteContent.services.subtitle}
            className="text-xl max-w-2xl mx-auto"
            as="p"
            multiline
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteContent.services.items.map((service: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48">
                  <EditableImage
                    path={`services.items.${index}.image`}
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <UploadableServiceIcon
                      path={`services.items.${index}.icon`}
                      currentSrc={service.icon}
                      alt={`Ícone ${service.title}`}
                      className="bg-white bg-opacity-90 rounded-lg p-2"
                    />
                  </div>
                  <EditableText
                    path={`services.items.${index}.title`}
                    value={service.title}
                    className="text-lg font-semibold"
                    as="h3"
                  />
                </CardHeader>
                <CardContent>
                  <EditableText
                    path={`services.items.${index}.fullDescription`}
                    value={service.fullDescription}
                    className="text-gray-600"
                    as="p"
                    multiline
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Galeria de Projetos</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Confira alguns dos nossos trabalhos realizados e projetos de segurança implementados
            </p>
          </div>
          <div className="max-w-6xl mx-auto text-center">
            <Button size="lg" className="bg-slate-600 hover:bg-slate-700">
              <Link href="/galeria">Ver na Galeria</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-600 text-white relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Interessado em Nossos Serviços?</h3>
          <p className="text-xl mb-8">Solicite um orçamento gratuito e sem compromisso</p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link href="/orcamento">Solicitar Orçamento Gratuito</Link>
          </Button>
        </div>
      </section>

      {/* Diagnósticos de Upload - Apenas para Admin */}
      {isAdmin && (
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
              Diagnósticos de Upload - Página de Serviços
            </h3>
            <div className="space-y-8">
              <AdminStatusTest />
              <SupabaseConnectivityTest />
              <ServiceUploadTest />
              <UploadDiagnostics />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <UploadableLogo
                  path="logo"
                  currentSrc={siteContent.logo}
                  alt="Logo da empresa"
                  className="h-12 w-auto"
                />
                <div>
                  <EditableText path="siteName" value={siteContent.siteName} className="text-xl font-bold" as="h4" />
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
                <Link href="/solucoes" className="block text-gray-400 hover:text-white transition-colors">
                  Soluções
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
    </div>
  )
}
