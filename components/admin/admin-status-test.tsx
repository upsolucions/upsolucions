"use client"

import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Upload, AlertCircle } from "lucide-react"
import { useState, useRef } from "react"

export function AdminStatusTest() {
  const { isAdmin, login, logout, uploadImage, siteContent, syncStatus } = useAdmin()
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [testUpload, setTestUpload] = useState<{ loading: boolean, result: string | null, error: string | null }>({
    loading: false,
    result: null,
    error: null
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = () => {
    const success = login(loginForm.username, loginForm.password)
    if (!success) {
      alert('Login falhou! Use: admin / 777696')
    }
  }

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setTestUpload({ loading: true, result: null, error: null })

    try {
      const result = await uploadImage('test.upload.image', file)
      setTestUpload({ 
        loading: false, 
        result: result || 'Upload falhou - resultado null', 
        error: null 
      })
    } catch (error) {
      setTestUpload({ 
        loading: false, 
        result: null, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      })
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Status de Administrador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Admin */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Status Admin:
          </span>
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "✅ Logado" : "❌ Não logado"}
          </Badge>
        </div>

        {/* Status de Sincronização */}
        <div className="flex items-center justify-between">
          <span>Status de Sync:</span>
          <Badge variant={
            syncStatus === 'synced' ? 'default' :
            syncStatus === 'syncing' ? 'secondary' :
            syncStatus === 'offline' ? 'outline' : 'destructive'
          }>
            {syncStatus}
          </Badge>
        </div>

        {/* Login Form */}
        {!isAdmin && (
          <div className="space-y-2 p-4 bg-gray-50 rounded">
            <h4 className="font-medium">Fazer Login</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Usuário (admin)"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded"
              />
              <input
                type="password"
                placeholder="Senha (777696)"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded"
              />
              <Button onClick={handleLogin}>Login</Button>
            </div>
          </div>
        )}

        {/* Logout */}
        {isAdmin && (
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        )}

        {/* Teste de Upload */}
        {isAdmin && (
          <div className="space-y-2 p-4 bg-blue-50 rounded">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Teste de Upload
            </h4>
            <div className="flex gap-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={testUpload.loading}
              >
                {testUpload.loading ? 'Enviando...' : 'Selecionar Imagem'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleTestUpload}
                className="hidden"
              />
            </div>
            
            {testUpload.result && (
              <div className="p-2 bg-green-100 rounded text-sm">
                <strong>✅ Sucesso:</strong> {testUpload.result}
              </div>
            )}
            
            {testUpload.error && (
              <div className="p-2 bg-red-100 rounded text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <strong>❌ Erro:</strong> {testUpload.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info sobre serviços */}
        <div className="text-sm text-gray-600">
          <p><strong>Total de serviços:</strong> {siteContent.services?.items?.length || 0}</p>
          <p><strong>Dica:</strong> Para fazer upload nas imagens dos serviços, você precisa estar logado como admin e passar o mouse sobre as imagens.</p>
        </div>
      </CardContent>
    </Card>
  )
}