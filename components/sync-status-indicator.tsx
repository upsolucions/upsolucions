"use client"

import React from 'react'
import { useAdmin } from '@/contexts/admin-context'

interface SyncStatusIndicatorProps {
  className?: string
}

export function SyncStatusIndicator({ className = '' }: SyncStatusIndicatorProps) {
  const { syncStatus, lastSyncTime, isAdmin } = useAdmin()

  // Só mostrar para admins
  if (!isAdmin) {
    return null
  }

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: '✓',
          text: 'Sincronizado',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'syncing':
        return {
          icon: '⟳',
          text: 'Sincronizando...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'offline':
        return {
          icon: '⚠',
          text: 'Offline',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      case 'error':
        return {
          icon: '✗',
          text: 'Erro na sincronização',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: '?',
          text: 'Status desconhecido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const formatLastSyncTime = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora mesmo'
    if (diffMinutes < 60) return `${diffMinutes}min atrás`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm
        ${statusInfo.bgColor} ${statusInfo.borderColor}
        transition-all duration-200 hover:shadow-md
      `}>
        <span className={`text-sm font-medium ${statusInfo.color} ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
          {statusInfo.icon}
        </span>
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          {syncStatus === 'synced' && lastSyncTime && (
            <span className="text-xs text-gray-500">
              {formatLastSyncTime(lastSyncTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SyncStatusIndicator