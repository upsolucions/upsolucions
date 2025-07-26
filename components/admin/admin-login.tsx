"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, LogOut, Eye, Calendar, TrendingUp } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface ViewStats {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
}

export function AdminLogin() {
  const { isAdmin, login, logout } = useAdmin()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [viewStats, setViewStats] = useState<ViewStats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 })

  // Registrar visualização da página
  useEffect(() => {
    const registerView = () => {
      const now = new Date()
      const today = now.toDateString()
      const thisWeek = getWeekKey(now)
      const thisMonth = `${now.getFullYear()}-${now.getMonth()}`

      // Obter dados existentes
      const existingViews = JSON.parse(localStorage.getItem("siteViews") || "{}")

      // Incrementar contadores
      existingViews.total = (existingViews.total || 0) + 1
      existingViews.daily = existingViews.daily || {}
      existingViews.weekly = existingViews.weekly || {}
      existingViews.monthly = existingViews.monthly || {}

      existingViews.daily[today] = (existingViews.daily[today] || 0) + 1
      existingViews.weekly[thisWeek] = (existingViews.weekly[thisWeek] || 0) + 1
      existingViews.monthly[thisMonth] = (existingViews.monthly[thisMonth] || 0) + 1

      // Salvar no localStorage
      localStorage.setItem("siteViews", JSON.stringify(existingViews))

      // Atualizar estado
      updateViewStats(existingViews)
    }

    // Registrar apenas uma vez por sessão
    const sessionKey = `viewed_${Date.now()}`
    if (!sessionStorage.getItem(sessionKey)) {
      registerView()
      sessionStorage.setItem(sessionKey, "true")
    } else {
      // Apenas atualizar stats sem incrementar
      const existingViews = JSON.parse(localStorage.getItem("siteViews") || "{}")
      updateViewStats(existingViews)
    }
  }, [])

  const getWeekKey = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - startOfWeek.getDay()) // Go to Sunday
    return startOfWeek.toDateString()
  }

  const updateViewStats = (views: any) => {
    const now = new Date()
    const today = now.toDateString()
    const thisWeek = getWeekKey(now)
    const thisMonth = `${now.getFullYear()}-${now.getMonth()}`

    setViewStats({
      today: views.daily?.[today] || 0,
      thisWeek: views.weekly?.[thisWeek] || 0,
      thisMonth: views.monthly?.[thisMonth] || 0,
      total: views.total || 0,
    })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(username, password)) {
      setIsOpen(false)
      setUsername("")
      setPassword("")
      setError("")
    } else {
      setError("Credenciais inválidas")
    }
  }

  if (isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {/* Estatísticas de Visualização */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">Hoje:</span>
                <span className="font-semibold">{viewStats.today}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-green-500" />
                <span className="text-gray-600">Semana:</span>
                <span className="font-semibold">{viewStats.thisWeek}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="text-gray-600">Mês:</span>
                <span className="font-semibold">{viewStats.thisMonth}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-orange-500" />
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{viewStats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Logout */}
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="bg-red-500 text-white border-red-500 hover:bg-red-600 text-xs px-2 py-1 h-8"
        >
          <LogOut className="w-3 h-3 mr-1" />
          Sair
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white border-blue-500 hover:bg-blue-600 text-xs px-2 py-1 h-8"
        >
          <Settings className="w-3 h-3 mr-1" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
