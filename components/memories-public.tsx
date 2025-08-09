"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Image as ImageIcon, Eye } from 'lucide-react'

interface Memory {
  id: string
  title: string
  description: string | null
  image_url: string | null
  date_created: string
  created_at: string
  updated_at: string
}

export function MemoriesPublic() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessTest, setAccessTest] = useState<'testing' | 'success' | 'failed'>('testing')

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      setLoading(true)
      setError(null)
      setAccessTest('testing')

      console.log('🔍 Testando acesso público à tabela memories...')
      
      // Tentar acessar a tabela memories como usuário anônimo
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao acessar memories:', error)
        setError(`Erro: ${error.message}`)
        setAccessTest('failed')
        return
      }

      console.log('✅ Acesso público bem-sucedido! Dados obtidos:', data)
      setMemories(data || [])
      setAccessTest('success')
      
    } catch (err) {
      console.error('❌ Erro inesperado:', err)
      setError('Erro inesperado ao carregar memórias')
      setAccessTest('failed')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Memórias Públicas</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Esta página demonstra o acesso público à tabela 'memories' com RLS (Row Level Security) configurado.
          Qualquer navegador pode visualizar estes dados sem autenticação.
        </p>
        
        {/* Indicador de Status de Acesso */}
        <div className="flex justify-center">
          {accessTest === 'testing' && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Testando acesso público...
            </Badge>
          )}
          {accessTest === 'success' && (
            <Badge variant="default" className="flex items-center gap-2 bg-green-600">
              <Eye className="w-4 h-4" />
              ✅ Acesso público ativo - RLS configurado corretamente
            </Badge>
          )}
          {accessTest === 'failed' && (
            <Badge variant="destructive" className="flex items-center gap-2">
              ❌ Falha no acesso público - Verificar configuração RLS
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <br />
            <small className="text-xs mt-2 block">
              Certifique-se de que a tabela 'memories' foi criada e as políticas RLS foram aplicadas no Supabase.
            </small>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma memória encontrada</h3>
          <p className="text-gray-600">
            {accessTest === 'success' 
              ? 'A tabela está acessível, mas não contém dados ainda.'
              : 'Execute o script SQL para criar a tabela e inserir dados de exemplo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <Card key={memory.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{memory.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(memory.date_created)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memory.image_url && (
                  <div className="mb-4">
                    <img 
                      src={memory.image_url} 
                      alt={memory.title}
                      className="w-full h-32 object-cover rounded-md bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                  </div>
                )}
                {memory.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {memory.description}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: {memory.id.slice(0, 8)}...
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informações Técnicas */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">ℹ️ Informações Técnicas</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>RLS Status:</strong> Row Level Security está ativo na tabela 'memories'</p>
          <p><strong>Política Aplicada:</strong> "Leitura pública" - FOR SELECT TO anon USING (true)</p>
          <p><strong>Acesso:</strong> Qualquer navegador pode ler os dados sem autenticação</p>
          <p><strong>Segurança:</strong> Apenas leitura é permitida para usuários anônimos</p>
        </div>
      </div>
    </div>
  )
}