"use client"

import { useState, useEffect } from 'react'
import { SyncService } from '../lib/sync-service'

interface SyncStatusProps {
  className?: string
}

export default function SyncStatus({ className = '' }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    isSupabaseConfigured: false,
    lastSync: null as Date | null,
    hasPendingChanges: false
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Atualizar status inicial
    updateSyncStatus()

    // Atualizar status periodicamente
    const interval = setInterval(updateSyncStatus, 5000)

    // Mostrar componente após um delay
    const showTimer = setTimeout(() => setIsVisible(true), 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(showTimer)
    }
  }, [])

  const updateSyncStatus = () => {
    const status = SyncService.getSyncStatus()
    setSyncStatus(status)
  }

  const handleForceSync = async () => {
    if (syncStatus.isOnline && syncStatus.isSupabaseConfigured) {
      const success = await SyncService.forcSync()
      if (success) {
        updateSyncStatus()
      }
    }
  }

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-500'
    if (!syncStatus.isSupabaseConfigured) return 'bg-yellow-500'
    if (syncStatus.hasPendingChanges) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline'
    if (!syncStatus.isSupabaseConfigured) return 'Local'
    if (syncStatus.hasPendingChanges) return 'Sincronizando...'
    return 'Sincronizado'
  }

  const getStatusDescription = () => {
    if (!syncStatus.isOnline) {
      return 'Sem conexão com a internet. Alterações serão salvas localmente.'
    }
    if (!syncStatus.isSupabaseConfigured) {
      return 'Supabase não configurado. Dados salvos apenas neste dispositivo.'
    }
    if (syncStatus.hasPendingChanges) {
      return 'Sincronizando alterações com a nuvem...'
    }
    return `Dados sincronizados entre dispositivos. ${syncStatus.lastSync ? `Última sincronização: ${syncStatus.lastSync.toLocaleTimeString()}` : ''}`
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-sm">
        <div className="flex items-center space-x-3">
          {/* Indicador de status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
          </div>

          {/* Botão de sincronização manual */}
          {syncStatus.isOnline && syncStatus.isSupabaseConfigured && (
            <button
              onClick={handleForceSync}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              title="Forçar sincronização"
            >
              ↻
            </button>
          )}
        </div>

        {/* Descrição detalhada */}
        <p className="text-xs text-gray-500 mt-2">
          {getStatusDescription()}
        </p>

        {/* Informações adicionais para desenvolvedores */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-400 space-y-1">
              <div>Online: {syncStatus.isOnline ? '✓' : '✗'}</div>
              <div>Supabase: {syncStatus.isSupabaseConfigured ? '✓' : '✗'}</div>
              <div>Pendente: {syncStatus.hasPendingChanges ? '✓' : '✗'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}