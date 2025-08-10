"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { AdminLogin } from "@/components/admin/admin-login"
import { EditableText } from "@/components/admin/editable-text"
import { EditableImage } from "@/components/admin/editable-image"
import { useAdmin } from "@/contexts/admin-context"

export default function OrcamentoPage() {
  const { siteContent } = useAdmin()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    endereco: "",
    telefone: "",
    descricao: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const formatWhatsAppMessage = (data: typeof formData) => {
    // Criar mensagem formatada para WhatsApp com quebras de linha adequadas
    const message = `🏢 *SOLICITAÇÃO DE ORÇAMENTO*
${siteContent.siteName}

👤 *DADOS DO CLIENTE:*
• Nome: ${data.nome}
• Email: ${data.email}
• Telefone: ${data.telefone}
• Endereço: ${data.endereco}

📋 *SERVIÇO SOLICITADO:*
${data.descricao}

⏰ Enviado em: ${new Date().toLocaleString("pt-BR")}

_Mensagem enviada através do site oficial_`

    return message
  }

  const formatEmailMessage = (data: typeof formData) => {
    return `SOLICITAÇÃO DE ORÇAMENTO - ${siteContent.siteName}

DADOS DO CLIENTE:
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Endereço: ${data.endereco}

SERVIÇO SOLICITADO:
${data.descricao}

Data/Hora: ${new Date().toLocaleString("pt-BR")}

---
Mensagem enviada através do site oficial ${siteContent.siteName}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Limpar e formatar número do WhatsApp
    const whatsappNumber = siteContent.contact.whatsapp.replace(/\D/g, "")
    const formattedNumber = whatsappNumber.startsWith("55") ? whatsappNumber : `55${whatsappNumber}`

    // Criar mensagem formatada para WhatsApp
    const whatsappMessage = formatWhatsAppMessage(formData)

    // Criar URL do WhatsApp com encoding adequado
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(whatsappMessage)}`

    // Criar mensagem para email
    const emailMessage = formatEmailMessage(formData)
    const emailSubject = `Orçamento - ${formData.nome} - ${siteContent.siteName}`
    const emailUrl = `mailto:${siteContent.contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`

    // Abrir WhatsApp primeiro
    window.open(whatsappUrl, "_blank")

    // Aguardar um pouco e abrir email
    setTimeout(() => {
      window.open(emailUrl, "_blank")
    }, 1000)

    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <AdminLogin />

        {/* Header */}
        <header className="bg-orange-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <EditableText path="siteName" value={siteContent.siteName} className="text-2xl font-bold" as="h1" />
                  <p className="text-orange-200 text-sm">Orçamento Enviado</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-orange-600 bg-transparent"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <Card className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-green-600">Orçamento Enviado!</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sua solicitação foi enviada com sucesso para nosso WhatsApp e email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Nossa equipe entrará em contato em breve para fornecer seu orçamento personalizado.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      📱 WhatsApp: <EditableText path="contact.whatsapp" value={siteContent.contact.whatsapp} />
                    </p>
                    <p>
                      ✉️ Email: <EditableText path="contact.email" value={siteContent.contact.email} />
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                      <a
                        href={`https://wa.me/55${siteContent.contact.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href="/">Voltar ao Início</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div>
                    <EditableText path="siteName" value={siteContent.siteName} className="text-xl font-bold" as="h4" />
                    <p className="text-gray-400 text-sm">Orçamento Gratuito</p>
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

  return (
    <div className="min-h-screen bg-white">
      <AdminLogin />

      {/* Header */}
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <EditableText path="siteName" value={siteContent.siteName} className="text-2xl font-bold" as="h1" />
                <p className="text-orange-200 text-sm">Solicitar Orçamento</p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-orange-600 bg-transparent"
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
      <section className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Solicitar Orçamento</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Preencha o formulário abaixo e receba seu orçamento gratuito e sem compromisso
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Dados para Orçamento</CardTitle>
                <CardDescription className="text-center">
                  Preencha todos os campos para recebermos sua solicitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Input
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      placeholder="Rua, número, bairro, cidade, CEP"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(21) 99999-9999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição do Serviço Solicitado *</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      placeholder="Descreva detalhadamente o serviço que você precisa. Ex: Instalação de 4 câmeras de segurança, sistema de alarme, automação de portão, etc."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Como funciona:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ao enviar, sua mensagem será direcionada para nosso WhatsApp e email</li>
                      <li>• Nossa equipe entrará em contato em até 24 horas</li>
                      <li>• Agendaremos uma visita técnica gratuita</li>
                      <li>• Você receberá um orçamento detalhado e sem compromisso</li>
                    </ul>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                    Enviar Solicitação de Orçamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Outras Formas de Contato</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold mb-2">WhatsApp</h4>
                <p className="text-gray-600 mb-4">
                  <EditableText path="contact.whatsapp" value={siteContent.contact.whatsapp} />
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a
                    href={`https://wa.me/55${siteContent.contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chamar no WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✉️</span>
                </div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-gray-600 mb-4">
                  <EditableText path="contact.email" value={siteContent.contact.email} />
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <a href={`mailto:${siteContent.contact.email}`}>Enviar Email</a>
                </Button>
              </CardContent>
            </Card>
          </div>
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
                  <EditableText path="siteName" value={siteContent.siteName} className="text-xl font-bold" as="h4" />
                  <p className="text-gray-400 text-sm">Orçamento Gratuito</p>
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
