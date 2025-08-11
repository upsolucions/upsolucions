"use client"

import { WatermarkConfig } from "@/components/admin/watermark-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Site
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Configurações Administrativas</h1>
          <p className="text-gray-600 mt-2">Gerencie as configurações do site</p>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/solicitacoes">Solicitações</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/diagnostics">Diagnósticos</Link>
                </Button>
                <Button variant="default" className="w-full justify-start">
                  Marca D'água
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <WatermarkConfig />
          </div>
        </div>
      </div>
    </div>
  )
}