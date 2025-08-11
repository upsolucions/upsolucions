"use client"

import { useAdmin } from '@/contexts/admin-context'
import { ImageTestPanel } from '@/components/admin/image-test-panel'
import { ImageFallbackFix } from '@/components/admin/image-fallback-fix'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Database } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DiagnosticsPage() {
  const { isAdmin } = useAdmin()
  const router = useRouter()

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-4">Você precisa estar logado como administrador para acessar esta página.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Diagnósticos do Sistema
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema Robusto de Imagens
          </h2>
          <p className="text-gray-600">
            Esta página permite diagnosticar e testar o funcionamento do sistema de armazenamento 
            e upload de imagens. Use as ferramentas abaixo para verificar se tudo está funcionando 
            corretamente e resolver problemas de inconsistência de dados.
          </p>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Sobre o Sistema Robusto de Imagens
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Armazenamento Duplo:</strong> IndexedDB como principal + localStorage como backup</p>
                <p>• <strong>Recuperação Automática:</strong> Fallback inteligente em caso de falhas</p>
                <p>• <strong>Cache Persistente:</strong> Imagens ficam disponíveis mesmo offline</p>
                <p>• <strong>Validação Robusta:</strong> Verificação de integridade e tamanho</p>
                <p>• <strong>Debug Avançado:</strong> Logs detalhados para diagnóstico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Principal */}
        <ImageTestPanel />
        
        {/* Correção de Imagens com Fallback */}
        <div className="mt-8">
          <ImageFallbackFix />
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Como Resolver Problemas</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>Execute os testes automáticos</strong> para identificar problemas</p>
              <p>2. <strong>Verifique o diagnóstico</strong> para ver o status dos sistemas</p>
              <p>3. <strong>Limpe o cache</strong> se houver dados corrompidos</p>
              <p>4. <strong>Teste upload manual</strong> para verificar funcionalidade</p>
              <p>5. <strong>Recarregue a página</strong> após fazer mudanças</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recursos Implementados</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Sistema de cache robusto com IndexedDB</p>
              <p>✅ Fallback automático para localStorage</p>
              <p>✅ Recuperação de imagens em caso de falha</p>
              <p>✅ Validação de arquivos e tratamento de erros</p>
              <p>✅ Interface de diagnóstico e testes</p>
              <p>✅ Indicadores visuais de status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}