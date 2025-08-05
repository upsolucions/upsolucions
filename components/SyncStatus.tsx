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