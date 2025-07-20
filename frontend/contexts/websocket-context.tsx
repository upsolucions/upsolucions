"use client"

import React, { createContext, useContext, useCallback, useEffect } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { useAdmin } from "@/contexts/admin-context"

interface WebSocketContextType {
  isConnected: boolean
  isConnecting: boolean
  clientId: number | null
  connectionError: string | null
  connectedClients: number
  sendContentUpdate: (path: string, value: any) => void
  sendImageUpload: (path: string, imageUrl: string) => void
  sendAdminStatus: (isAdmin: boolean) => void
  sendGalleryUpdate: (action: string, data: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { updateContent, isAdmin } = useAdmin()
  const [connectedClients, setConnectedClients] = React.useState(1)

  const handleMessage = useCallback(
    (message: any) => {
      switch (message.type) {
        case "content_update":
          // Update content from other clients (skip WebSocket to avoid loops)
          updateContent(message.path, message.value, true)
          break

        case "image_upload":
          // Handle image upload from other clients
          updateContent(message.path, message.imageUrl, true)
          break

        case "admin_status":
          // Handle admin status changes from other clients
          break

        case "gallery_update":
          // Handle gallery updates from other clients
          break

        case "client_joined":
          setConnectedClients(message.totalClients)
          break

        case "client_left":
          setConnectedClients(message.totalClients)
          break

        case "pong":
          // Handle ping response
          break

        default:
          break
      }
    },
    [updateContent],
  )

  const handleConnect = useCallback(() => {
    // WebSocket connected
  }, [])

  const handleDisconnect = useCallback(() => {
    setConnectedClients(1) // Reset to just this client
  }, [])

  const handleError = useCallback((error: Event) => {
    // WebSocket connection error
  }, [])

  const { isConnected, isConnecting, clientId, connectionError, sendMessage } = useWebSocket({
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  })

  const sendContentUpdate = useCallback(
    (path: string, value: any) => {
      sendMessage({
        type: "content_update",
        path,
        value,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage],
  )

  const sendImageUpload = useCallback(
    (path: string, imageUrl: string) => {
      sendMessage({
        type: "image_upload",
        path,
        imageUrl,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage],
  )

  const sendAdminStatus = useCallback(
    (isAdmin: boolean) => {
      sendMessage({
        type: "admin_login",
        isAdmin,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage],
  )

  const sendGalleryUpdate = useCallback(
    (action: string, data: any) => {
      sendMessage({
        type: "gallery_update",
        action,
        data,
        timestamp: new Date().toISOString(),
      })
    },
    [sendMessage],
  )

  // Send admin status when it changes
  useEffect(() => {
    if (isConnected) {
      sendAdminStatus(isAdmin)
    }
  }, [isAdmin, isConnected, sendAdminStatus])

  const contextValue = {
    isConnected,
    isConnecting,
    clientId,
    connectionError,
    connectedClients,
    sendContentUpdate,
    sendImageUpload,
    sendAdminStatus,
    sendGalleryUpdate,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider")
  }
  return context
}
