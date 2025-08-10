"use client"

import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Shield, Camera, Lock, Phone, Zap, Droplets, Car } from "lucide-react"
import { AdminLogin } from "@/components/admin/admin-login"
import { EditableText } from "@/components/admin/editable-text"
import { EditableImage } from "@/components/admin/editable-image"
// Customização de páginas removida por problemas de funcionamento
import { useAdmin } from "@/contexts/admin-context"

// Memoized components for better performance
const ServiceCard = memo(({ service, index, Icon }: { service: any; index: number; Icon: any }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="text-center">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <EditableText
        path={`services.items.${index}.title`}
        value={service.title}
        as="h4"
        className="text-lg font-semibold"
      />
    </CardHeader>
    <CardContent>
      <EditableText
        path={`services.items.${index}.description`}
        value={service.description}
        multiline
        as="p"
        className="text-center text-gray-600"
      />
    </CardContent>
  </Card>
))

const SolutionCard = memo(({ solution, index, Icon }: { solution: any; index: number; Icon: any }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="text-center">
      <Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
      <EditableText
        path={`solutions.items.${index}.title`}
        value={solution.title}
        as="h4"
        className="text-lg font-semibold"
      />
    </CardHeader>
    <CardContent>
      <EditableText
        path={`solutions.items.${index}.description`}
        value={solution.description}
        multiline
        as="p"
        className="text-center text-gray-600"
      />
    </CardContent>
  </Card>
))

const FAQItem = memo(({ faq, index }: { faq: any; index: number }) => (
  <AccordionItem value={`faq-${index}`}>
    <AccordionTrigger>
      <EditableText path={`faq.${index}.question`} value={faq.question} className="font-medium" />
    </AccordionTrigger>
    <AccordionContent>
      <EditableText path={`faq.${index}.answer`} value={faq.answer} multiline className="text-gray-600" />
    </AccordionContent>
  </AccordionItem>
))

export const HomePage = memo(() => {
  const { siteContent, isAdmin } = useAdmin()
  
  // BackgroundContainer removido

  // Memoized data
  const services = siteContent.services.items.slice(0, 4)
  const solutions = siteContent.solutions.items.slice(0, 3)
  const serviceIcons = [Camera, Lock, Shield, Phone]
  const solutionIcons = [Zap, Droplets, Car]

  return (
    <div className="min-h-screen bg-white">
        <AdminLogin />
        

        {/* Header */}
        <header className="bg-slate-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <EditableText path="siteName" value={siteContent.siteName} as="h1" className="text-2xl font-bold" />
                <EditableText path="slogan" value={siteContent.slogan} as="p" className="text-slate-200 text-sm" />
              </div>
            </div>

            <nav className="hidden md:flex space-x-6">
              <Link href="#servicos" className="hover:text-slate-200 transition-colors">
                Serviços
              </Link>
              <Link href="#solucoes" className="hover:text-slate-200 transition-colors">
                Soluções
              </Link>
              <Link href="#faq" className="hover:text-slate-200 transition-colors">
                FAQ
              </Link>
              <Link href="/galeria" className="hover:text-slate-200 transition-colors">
                Galeria
              </Link>
              <Link href="/orcamento" className="hover:text-slate-200 transition-colors">
                Orçamento
              </Link>
              <Link href="#contato" className="hover:text-slate-200 transition-colors">
                Contato
              </Link>
            </nav>
          </div>
        </div>
      </header>

        {/* Hero */}
        <section className="bg-gradient-to-r from-slate-600 to-slate-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <EditableText path="hero.title" value={siteContent.hero.title} as="h2" className="text-5xl font-bold mb-6" />
          <EditableText
            path="hero.subtitle"
            value={siteContent.hero.subtitle}
            as="p"
            multiline
            className="text-xl mb-8 max-w-2xl mx-auto"
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 transition-colors">
              <Link href="/orcamento">Solicitar Orçamento</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-600 bg-transparent transition-colors"
            >
              <Link href="#servicos">Nossos Serviços</Link>
            </Button>
          </div>
        </div>
      </section>

        {/* Services */}
        <section id="servicos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <EditableText
              path="services.title"
              as="h3"
              value={siteContent.services.title}
              className="text-3xl font-bold text-gray-900 mb-4"
            />
            <EditableText
              path="services.subtitle"
              as="p"
              multiline
              value={siteContent.services.subtitle}
              className="text-gray-600 max-w-2xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {services.map((service: any, index: number) => (
              <ServiceCard key={`service-${index}`} service={service} index={index} Icon={serviceIcons[index]} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild className="bg-slate-600 hover:bg-slate-700 transition-colors">
              <Link href="/servicos">Ver Todos os Serviços</Link>
            </Button>
          </div>
        </div>
      </section>

        {/* Solutions */}
        <section id="solucoes" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <EditableText
              path="solutions.title"
              as="h3"
              value={siteContent.solutions.title}
              className="text-3xl font-bold text-gray-900 mb-4"
            />
            <EditableText
              path="solutions.subtitle"
              as="p"
              multiline
              value={siteContent.solutions.subtitle}
              className="text-gray-600 max-w-2xl mx-auto"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {solutions.map((solution: any, index: number) => (
              <SolutionCard key={`solution-${index}`} solution={solution} index={index} Icon={solutionIcons[index]} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild className="bg-green-600 hover:bg-green-700 transition-colors">
              <Link href="/solucoes">Ver Todas as Soluções</Link>
            </Button>
          </div>
        </div>
      </section>

        {/* FAQ */}
        <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h3>
            <p className="text-gray-600">Tire suas dúvidas sobre nossos serviços</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {siteContent.faq.map((faq: any, index: number) => (
                <FAQItem key={`faq-${index}`} faq={faq} index={index} />
              ))}
            </Accordion>
          </div>
        </div>
      </section>

        {/* CTA */}
        <section className="py-16 bg-slate-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para Proteger seu Patrimônio?</h3>
          <p className="text-xl mb-8">Entre em contato conosco e solicite seu orçamento gratuito</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 transition-colors">
              <Link href="/orcamento">Solicitar Orçamento</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-600 bg-transparent transition-colors"
            >
              <Link href="/galeria">Ver Galeria</Link>
            </Button>
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer id="contato" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div>
                  <EditableText path="siteName" value={siteContent.siteName} as="h4" className="text-xl font-bold" />
                  <EditableText path="slogan" value={siteContent.slogan} as="p" className="text-gray-400 text-sm" />
                </div>
              </div>
              <p className="text-gray-400">Especialistas em sistemas de segurança e automação tecnológica.</p>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Contato</h5>
              <div className="space-y-2 text-gray-400">
                <p>
                  📱 WhatsApp:&nbsp;
                  <EditableText path="contact.whatsapp" value={siteContent.contact.whatsapp} />
                </p>
                <p>
                  ✉️ Email:&nbsp;
                  <EditableText path="contact.email" value={siteContent.contact.email} />
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Links Rápidos</h5>
              <div className="space-y-2">
                <Link href="/servicos" className="block text-gray-400 hover:text-white transition-colors">
                  Serviços
                </Link>
                <Link href="/solucoes" className="block text-gray-400 hover:text-white transition-colors">
                  Soluções
                </Link>
                <Link href="/galeria" className="block text-gray-400 hover:text-white transition-colors">
                  Galeria
                </Link>
                <Link href="/orcamento" className="block text-gray-400 hover:text-white transition-colors">
                  Orçamento
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

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            &copy; 2024&nbsp;
            <EditableText path="siteName" value={siteContent.siteName} />. Todos os direitos reservados.
          </div>
          </div>
        </footer>
    </div>
  )
})

HomePage.displayName = "HomePage"
