"use client"

import React, { useEffect, useState } from 'react'
import { useAdmin } from '@/contexts/admin-context'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export function SyncNotifications() {
  const { syncStatus, isAdmin } = useAdmin()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [previousStatus, setPreviousStatus] = useState(syncStatus)

  // Só mostrar para admins
  if (!isAdmin) {
    return null
  }

  useEffect(() => {
    // Detectar mudanças de status e mostrar notificações apropriadas
    if (previousStatus !== syncStatus) {
      let newToast: Toast | null = null

      switch (syncStatus) {
        case 'synced':
          if (previousStatus === 'offline' || previousStatus === 'error') {
            newToast = {
              id: Date.now().toString(),
              type: 'success',
              title: 'Conectividade Restaurada',
              message: 'Dados sincronizados com sucesso!',
              duration: 4000
            }
          }
          break

        case 'offline':
          if (previousStatus === 'synced' || previousStatus === 'syncing') {
            newToast = {
              id: Date.now().toString(),
              type: 'warning',
              title: 'Modo Offline',
              message: 'Trabalhando offline. Dados serão sincronizados quando a conexão for restaurada.',
              duration: 6000
            }
          }
          break

        case 'error':
          newToast = {
            id: Date.now().toString(),
            type: 'error',
            title: 'Erro de Sincronização',
            message: 'Falha ao sincronizar dados. Tentando novamente...',
            duration: 5000
          }
          break
      }

      if (newToast) {
        setToasts(prev => [...prev, newToast!])
      }

      setPreviousStatus(syncStatus)
    }
  }, [syncStatus, previousStatus])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    // Auto-remove toasts após o tempo especificado
    toasts.forEach(toast => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [toasts])

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '•'
    }
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-lg border shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
            ${getToastStyles(toast.type)}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg font-medium flex-shrink-0">
              {getToastIcon(toast.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">
                {toast.title}
              </h4>
              <p className="text-sm mt-1 opacity-90">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-lg leading-none opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SyncNotifications