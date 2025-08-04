"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { ImageGallery } from "@/components/cliente/image-gallery"
import { ColorCustomizer } from "@/components/cliente/color-customizer"
import { Solicitacao } from "@/types/cliente"

const tiposSolicitacao = [
  "Alarme",
  "Câmera",
  "Servidor de Imagem",
  "Controle de Acesso",
  "Portão Automático",
  "Interfone",
  "Cerca Elétrica",
  "Cancela",
  "Outro"
]

export default function ClientePage() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [documento, setDocumento] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("cpf")
  const [tipoSolicitacao, setTipoSolicitacao] = useState("")
  const [descricao, setDescricao] = useState("")
  const [ordemServico, setOrdemServico] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [solicitacoesAnteriores, setSolicitacoesAnteriores] = useState<Solicitacao[]>([])
  const [clienteId, setClienteId] = useState<string | null>(null)

  useEffect(() => {
    // Carregar solicitações anteriores do cliente se estiver logado
    const storedClienteId = localStorage.getItem("clienteId")
    if (storedClienteId) {
      setClienteId(storedClienteId)
      carregarSolicitacoesAnteriores(storedClienteId)
      
      // Carregar imagens e preferências do cliente
      carregarImagensCliente(storedClienteId)
      carregarPreferenciasCliente(storedClienteId)
    } else {
      // Gerar um ID temporário para usuários não logados
      const tempId = `temp_${Date.now()}`
      setClienteId(tempId)
    }
  }, [])

  const carregarSolicitacoesAnteriores = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from("solicitacoes")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSolicitacoesAnteriores(data || [])
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas solicitações anteriores.",
        variant: "destructive",
      })
    }
  }
  
  const carregarImagensCliente = async (clienteId: string) => {
    try {
      // As imagens serão carregadas diretamente pelo componente ImageGallery
      // que usa o contexto do cliente para gerenciar as imagens
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
    }
  }
  
  const carregarPreferenciasCliente = async (clienteId: string) => {
    try {
      // As preferências serão carregadas diretamente pelo componente ColorCustomizer
      // que usa o contexto do cliente para gerenciar as preferências de cores
    } catch (error) {
      console.error("Erro ao carregar preferências:", error)
    }
  }

  const formatarDocumento = (valor: string) => {
    // Remove caracteres não numéricos
    const apenasNumeros = valor.replace(/\D/g, "")
    
    if (tipoDocumento === "cpf") {
      // Formata CPF: 000.000.000-00
      if (apenasNumeros.length <= 11) {
        return apenasNumeros
          .replace(/^(\d{3})(\d)/, "$1.$2")
          .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      }
    } else {
      // Formata CNPJ: 00.000.000/0000-00
      if (apenasNumeros.length <= 14) {
        return apenasNumeros
          .replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
          .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
      }
    }
    
    return apenasNumeros
  }

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarDocumento(e.target.value)
    setDocumento(valorFormatado)
  }

  const gerarNumeroOS = async (tipo: string) => {
    try {
      // Buscar o último número de OS para este tipo
      const { data, error } = await supabase
        .from("contador_os")
        .select("ultimo_numero")
        .eq("tipo", tipo)
        .single()

      if (error && error.code !== "PGRST116") throw error

      let proximoNumero = 1
      if (data) {
        proximoNumero = data.ultimo_numero + 1
      }

      // Atualizar o contador
      const { error: updateError } = await supabase
        .from("contador_os")
        .upsert({ tipo, ultimo_numero: proximoNumero })

      if (updateError) throw updateError

      // Formatar o número da OS: TIPO-YYYYMMDD-NUMERO
      const hoje = new Date()
      const ano = hoje.getFullYear()
      const mes = String(hoje.getMonth() + 1).padStart(2, "0")
      const dia = String(hoje.getDate()).padStart(2, "0")
      const dataFormatada = `${ano}${mes}${dia}`
      
      return `${tipo.substring(0, 3).toUpperCase()}-${dataFormatada}-${String(proximoNumero).padStart(4, "0")}`
    } catch (error) {
      console.error("Erro ao gerar número de OS:", error)
      // Fallback para um número aleatório se houver erro
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
      return `${tipo.substring(0, 3).toUpperCase()}-${Date.now()}-${random}`
    }
  }

  const enviarNotificacoes = async (numeroOS: string, clienteData: any) => {
    try {
      // Aqui você implementaria o envio de notificações por WhatsApp e email
      // Esta é uma simulação - na implementação real, você usaria APIs como Twilio, SendGrid, etc.
      console.log(`Enviando notificação para WhatsApp e email sobre a OS ${numeroOS}`)
      
      // Registrar a notificação no banco de dados
      await supabase.from("notificacoes").insert({
        ordem_servico_id: numeroOS,
        tipo: "criacao_os",
        status: "enviado",
        detalhes: {
          whatsapp: "enviado",
          email: "enviado",
          cliente: clienteData
        }
      })
      
      return true
    } catch (error) {
      console.error("Erro ao enviar notificações:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!nome || !documento || !tipoSolicitacao) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      // Verificar se o cliente já existe
      let clienteId
      const { data: clienteExistente, error: clienteError } = await supabase
        .from("clientes")
        .select("id")
        .eq("documento", documento.replace(/\D/g, ""))
        .single()

      if (clienteError && clienteError.code !== "PGRST116") throw clienteError

      if (clienteExistente) {
        clienteId = clienteExistente.id
        // Atualizar dados do cliente
        await supabase
          .from("clientes")
          .update({ nome })
          .eq("id", clienteId)
      } else {
        // Criar novo cliente
        const { data: novoCliente, error: novoClienteError } = await supabase
          .from("clientes")
          .insert({
            nome,
            documento: documento.replace(/\D/g, ""),
            tipo_documento: tipoDocumento
          })
          .select()

        if (novoClienteError) throw novoClienteError
        clienteId = novoCliente[0].id
      }

      // Salvar ID do cliente no localStorage para futuras solicitações
      localStorage.setItem("clienteId", clienteId)

      // Gerar número de OS
      const numeroOS = await gerarNumeroOS(tipoSolicitacao)

      // Criar solicitação
      const { data: novaSolicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert({
          numero_os: numeroOS,
          cliente_id: clienteId,
          tipo: tipoSolicitacao,
          descricao,
          status: "Aberta"
        })
        .select()

      if (solicitacaoError) throw solicitacaoError

      // Enviar notificações
      await enviarNotificacoes(numeroOS, { nome, documento, tipoSolicitacao, descricao })

      // Atualizar estado com a OS criada
      setOrdemServico(numeroOS)
      
      // Recarregar solicitações anteriores
      carregarSolicitacoesAnteriores(clienteId)

      toast({
        title: "Solicitação enviada com sucesso!",
        description: `Sua ordem de serviço ${numeroOS} foi criada.`,
      })
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error)
      toast({
        title: "Erro ao enviar solicitação",
        description: (error as Error).message || "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Área do Cliente</h1>
      
      <Tabs defaultValue="nova-solicitacao" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nova-solicitacao">Nova Solicitação</TabsTrigger>
          <TabsTrigger value="solicitacoes-anteriores">Solicitações Anteriores</TabsTrigger>
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nova-solicitacao">
          <Card>
            <CardHeader>
              <CardTitle>Nova Solicitação de Serviço</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para solicitar um serviço de segurança eletrônica.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    placeholder="Digite seu nome completo" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                    <Select 
                      value={tipoDocumento} 
                      onValueChange={setTipoDocumento}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="documento">{tipoDocumento.toUpperCase()}</Label>
                    <Input 
                      id="documento" 
                      placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} 
                      value={documento}
                      onChange={handleDocumentoChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoSolicitacao">Tipo de Solicitação</Label>
                  <Select 
                    value={tipoSolicitacao} 
                    onValueChange={setTipoSolicitacao}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposSolicitacao.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição do Problema</Label>
                  <textarea 
                    id="descricao"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Descreva detalhadamente o problema ou serviço desejado"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.push("/")}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {ordemServico && (
            <Card className="mt-6 border-green-500">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">Solicitação Enviada com Sucesso!</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-center mb-4">
                  Sua ordem de serviço foi criada com o número:
                </p>
                <p className="text-2xl font-bold text-center mb-4">{ordemServico}</p>
                <p className="text-center text-sm text-gray-500">
                  Uma confirmação foi enviada para seu WhatsApp e email.
                  Guarde este número para acompanhar o status do seu atendimento.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="solicitacoes-anteriores">
          <Card>
            <CardHeader>
              <CardTitle>Suas Solicitações</CardTitle>
              <CardDescription>
                Histórico de solicitações e status de atendimento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {solicitacoesAnteriores.length > 0 ? (
                <div className="space-y-4">
                  {solicitacoesAnteriores.map((solicitacao) => (
                    <Card key={solicitacao.id} className="overflow-hidden">
                      <div className={`p-4 ${getStatusColor(solicitacao.status)}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{solicitacao.numero_os}</p>
                            <p className="text-sm">{new Date(solicitacao.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(solicitacao.status)}`}>
                              {solicitacao.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-medium">{solicitacao.tipo}</p>
                        <p className="text-sm text-gray-600 mt-2">{solicitacao.descricao}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Você ainda não possui solicitações.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="personalizacao">
          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>
                Personalize sua área do cliente com imagens e cores de sua preferência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Suas Imagens</h3>
                  {clienteId && <ImageGallery clienteId={clienteId} />}
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Personalização de Cores</h3>
                  {clienteId && <ColorCustomizer clienteId={clienteId} />}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Funções auxiliares para estilização baseada no status
function getStatusColor(status: string) {
  switch (status) {
    case "Aberta":
      return "bg-blue-50"
    case "Em Andamento":
      return "bg-yellow-50"
    case "Concluída":
      return "bg-green-50"
    case "Cancelada":
      return "bg-red-50"
    default:
      return "bg-gray-50"
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "Aberta":
      return "bg-blue-100 text-blue-800"
    case "Em Andamento":
      return "bg-yellow-100 text-yellow-800"
    case "Concluída":
      return "bg-green-100 text-green-800"
    case "Cancelada":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}