"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAdmin } from "@/contexts/admin-context"
import { Solicitacao, Cliente, Tecnico } from "@/types/cliente"

export default function AdminSolicitacoesPage() {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [solicitacoes, setSolicitacoes] = useState<(Solicitacao & { cliente: Cliente })[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>("")
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("7dias")
  
  // Manipuladores de eventos para filtros
  const handleFiltroStatusChange = useCallback((value: string) => {
    setFiltroStatus(value);
  }, []);
  
  const handleFiltroPeriodoChange = useCallback((value: string) => {
    setFiltroPeriodo(value);
  }, []);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>("") 
  const [dataAgendamento, setDataAgendamento] = useState<string>("") 
  const [observacoes, setObservacoes] = useState<string>("") 
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const carregarSolicitacoes = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("solicitacoes")
        .select(`
          *,
          cliente:cliente_id(id, nome, documento, tipo_documento, telefone, email)
        `)
        .order("created_at", { ascending: false })

      // Aplicar filtro de status
      if (filtroStatus) {
        query = query.eq("status", filtroStatus)
      }

      // Aplicar filtro de período
      if (filtroPeriodo) {
        const hoje = new Date()
        let dataInicial = new Date()

        switch (filtroPeriodo) {
          case "hoje":
            dataInicial.setHours(0, 0, 0, 0)
            break
          case "7dias":
            dataInicial.setDate(hoje.getDate() - 7)
            break
          case "30dias":
            dataInicial.setDate(hoje.getDate() - 30)
            break
          case "90dias":
            dataInicial.setDate(hoje.getDate() - 90)
            break
          default:
            // Sem filtro de data
            break
        }

        if (filtroPeriodo !== "todos") {
          query = query.gte("created_at", dataInicial.toISOString())
        }
      }

      const { data, error } = await query

      if (error) throw error
      setSolicitacoes(data || [])
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filtroStatus, filtroPeriodo])

  const carregarTecnicos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("ativo", true)
        .order("nome")

      if (error) throw error
      setTecnicos(data || [])
    } catch (error) {
      console.error("Erro ao carregar técnicos:", error)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    carregarSolicitacoes()
    carregarTecnicos()
  }, [isAdmin, router, carregarSolicitacoes, carregarTecnicos])

  const abrirDetalhes = useCallback((solicitacao: Solicitacao & { cliente: Cliente }) => {
    setSolicitacaoSelecionada(solicitacao)
    setCliente(solicitacao.cliente)
    setTecnicoSelecionado(solicitacao.tecnico_id || "")
    setDataAgendamento(solicitacao.data_agendamento ? new Date(solicitacao.data_agendamento).toISOString().split("T")[0] : "")
    setObservacoes(solicitacao.observacoes_tecnicas || "")
    setDialogOpen(true)
  }, [])

  const atualizarSolicitacao = useCallback(async () => {
    if (!solicitacaoSelecionada) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("solicitacoes")
        .update({
          status: solicitacaoSelecionada.status,
          tecnico_id: tecnicoSelecionado || null,
          data_agendamento: dataAgendamento ? new Date(dataAgendamento).toISOString() : null,
          observacoes_tecnicas: observacoes,
          updated_at: new Date().toISOString()
        })
        .eq("id", solicitacaoSelecionada.id)

      if (error) throw error

      // Registrar notificação de atualização
      await supabase.from("notificacoes").insert({
        ordem_servico_id: solicitacaoSelecionada.numero_os,
        tipo: "atualizacao_status",
        status: "enviado",
        detalhes: {
          status_anterior: solicitacaoSelecionada.status,
          novo_status: solicitacaoSelecionada.status,
          tecnico: tecnicoSelecionado,
          data_agendamento: dataAgendamento,
          observacoes: observacoes
        }
      })

      toast({
        title: "Sucesso",
        description: `Solicitação ${solicitacaoSelecionada.numero_os} atualizada com sucesso.`,
      })

      setDialogOpen(false)
      carregarSolicitacoes()
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a solicitação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [solicitacaoSelecionada, tecnicoSelecionado, dataAgendamento, observacoes, carregarSolicitacoes])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "Aberta":
        return <Badge className="bg-blue-100 text-blue-800">Aberta</Badge>
      case "Em Andamento":
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
      case "Concluída":
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>
      case "Cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }, [])

  const formatarData = useCallback((dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }, [])

  // Manipuladores de eventos memoizados
  const handleStatusChange = useCallback((value: string) => {
    setSolicitacaoSelecionada(prev => prev ? {...prev, status: value} as Solicitacao : null)
  }, [])

  const handleTecnicoChange = useCallback((value: string) => {
    setTecnicoSelecionado(value)
  }, [])

  const handleDataAgendamentoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDataAgendamento(e.target.value)
  }, [])

  const handleObservacoesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservacoes(e.target.value)
  }, [])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
  }, [])

  const handleCancelar = useCallback(() => {
    setDialogOpen(false)
  }, [])
  
  // Não é possível memoizar o manipulador do botão Detalhes diretamente
  // porque ele precisa da solicitação específica de cada linha

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Solicitações</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Label htmlFor="filtroStatus">Filtrar por Status</Label>
          <Select value={filtroStatus} onValueChange={handleFiltroStatusChange}>
            <SelectTrigger id="filtroStatus">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="Aberta">Aberta</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <Label htmlFor="filtroPeriodo">Período</Label>
          <Select value={filtroPeriodo} onValueChange={handleFiltroPeriodoChange}>
            <SelectTrigger id="filtroPeriodo">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3 flex items-end">
          <Button onClick={carregarSolicitacoes} className="w-full">
            Atualizar Lista
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Serviço</CardTitle>
          <CardDescription>
            Lista de solicitações de serviço dos clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {useMemo(() => {
            if (loading) {
              return (
                <div className="text-center py-10">
                  <p className="text-gray-500">Carregando solicitações...</p>
                </div>
              );
            }
            
            if (solicitacoes.length === 0) {
              return (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nenhuma solicitação encontrada.</p>
                </div>
              );
            }
            
            return (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número OS</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoes.map((solicitacao) => (
                      <TableRow key={solicitacao.id}>
                        <TableCell className="font-medium">{solicitacao.numero_os}</TableCell>
                        <TableCell>{solicitacao.cliente?.nome}</TableCell>
                        <TableCell>{solicitacao.tipo}</TableCell>
                        <TableCell>{formatarData(solicitacao.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(solicitacao.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => abrirDetalhes(solicitacao)}>
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          }, [loading, solicitacoes, formatarData, getStatusBadge, abrirDetalhes])}
        </CardContent>
      </Card>

      {/* Dialog de detalhes da solicitação */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações detalhadas e gerenciamento da solicitação.
            </DialogDescription>
          </DialogHeader>

          {useMemo(() => {
            if (!solicitacaoSelecionada || !cliente) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações da Solicitação</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Número OS</Label>
                      <p className="font-medium">{solicitacaoSelecionada.numero_os}</p>
                    </div>
                    
                    <div>
                      <Label>Tipo de Serviço</Label>
                      <p>{solicitacaoSelecionada.tipo}</p>
                    </div>
                    
                    <div>
                      <Label>Data de Abertura</Label>
                      <p>{formatarData(solicitacaoSelecionada.created_at)}</p>
                    </div>
                    
                    <div>
                      <Label>Descrição</Label>
                      <p className="text-sm">{solicitacaoSelecionada.descricao}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações do Cliente</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <p>{cliente.nome}</p>
                    </div>
                    
                    <div>
                      <Label>{cliente.tipo_documento.toUpperCase()}</Label>
                      <p>{cliente.documento}</p>
                    </div>
                    
                    <div>
                      <Label>Telefone</Label>
                      <p>{cliente.telefone || "Não informado"}</p>
                    </div>
                    
                    <div>
                      <Label>Email</Label>
                      <p>{cliente.email || "Não informado"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Gerenciamento</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={solicitacaoSelecionada.status} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Concluída">Concluída</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="tecnico">Técnico Responsável</Label>
                      <Select 
                        value={tecnicoSelecionado} 
                        onValueChange={handleTecnicoChange}
                      >
                        <SelectTrigger id="tecnico">
                          <SelectValue placeholder="Selecione um técnico" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {tecnicos.map((tecnico) => (
                            <SelectItem key={tecnico.id} value={tecnico.id}>
                              {tecnico.nome} ({tecnico.especialidade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dataAgendamento">Data de Agendamento</Label>
                      <Input 
                        id="dataAgendamento" 
                        type="date" 
                        value={dataAgendamento} 
                        onChange={handleDataAgendamentoChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="observacoes">Observações Técnicas</Label>
                      <textarea 
                        id="observacoes"
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Observações técnicas sobre o atendimento"
                        value={observacoes}
                        onChange={handleObservacoesChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }, [solicitacaoSelecionada, cliente, formatarData, handleStatusChange, tecnicoSelecionado, handleTecnicoChange, tecnicos, dataAgendamento, handleDataAgendamentoChange, observacoes, handleObservacoesChange])}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelar}>Cancelar</Button>
            <Button onClick={atualizarSolicitacao} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}