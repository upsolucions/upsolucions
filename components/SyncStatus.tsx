"use client"

import { useState, useEffect } from 'react'
import { SyncService } from '../lib/sync-service'

interface SyncStatusProps {
  className?: string
  inline?: boolean
  onClose?: () => void
}

export default function SyncStatus({ className = '', inline = false, onClose }: SyncStatusProps) {
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

  if (!isVisible && !inline) return null

  const renderStatusContent = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg`}>
            {syncStatus.hasPendingChanges && (
              <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-ping absolute`}></div>
            )}
          </div>
        </div>
        <div>
          <div className="font-medium text-sm">{getStatusText()}</div>
          <div className="text-xs text-gray-600">{getStatusDescription()}</div>
        </div>
      </div>
      
      {syncStatus.isOnline && syncStatus.isSupabaseConfigured && (
        <button
          onClick={handleForceSync}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Forçar Sincronização
        </button>
      )}
    </div>
  )

  if (inline) {
    return (
      <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Status de Sincronização</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
        {renderStatusContent()}
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 left-4 z-40 ${className}`}>
      {/* Apenas uma bolinha simples */}
      <div 
        className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg cursor-pointer transition-all duration-300 hover:scale-110`}
        title={getStatusDescription()}
        onClick={syncStatus.isOnline && syncStatus.isSupabaseConfigured ? handleForceSync : undefined}
      >
        {/* Animação de pulso apenas quando sincronizando */}
        {syncStatus.hasPendingChanges && (
          <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-ping absolute`}></div>
        )}
      </div>
    </div>
  )
}