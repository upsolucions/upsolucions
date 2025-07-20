"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

// Detecta se estamos em um ambiente de preview (ex.: v0.dev / vercel.app) onde o WS não está disponível
function isPreviewEnvironment() {
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  return host.endsWith(".v0.dev") || host.endsWith(".vercel.app")
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = options.url ??
      process.env.NEXT_PUBLIC_WS_URL ?? // produção (configure no Dashboard)
      (() => {
        if (typeof window === "undefined") return "ws://localhost:8080/ws"
        const { protocol, hostname } = window.location
        const wsProtocol = protocol === "https:" ? "wss:" : "ws:"
        const devPort = protocol === "https:" ? "443" : "8080"
        return `${wsProtocol}//${hostname}:${devPort}/ws`
      })(),
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const messageQueue = useRef<WebSocketMessage[]>([])

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [clientId, setClientId] = useState<number | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const wsDisabled = isPreviewEnvironment() && !options.url

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionError(null)
        reconnectAttempts.current = 0

        // Send queued messages
        while (messageQueue.current.length > 0) {
          const message = messageQueue.current.shift()
          if (message && ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message))
          }
        }

        onConnect?.()
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage

          // Handle connection message to get client ID
          if (message.type === "connection") {
            setClientId(message.clientId)
          }

          onMessage?.(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
        setClientId(null)

        onDisconnect?.()

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)

          reconnectTimer.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Servidor WebSocket indisponível no momento")
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("Erro de conexão – servidor WebSocket indisponível")
        setIsConnecting(false)
        onError?.(error)

        // Garante que o onclose seja chamado para tentarmos reconectar
        try {
          ws.current?.close()
        } catch (_) {}

        // Fazemos a contagem de tentativas aqui também,
        // pois em alguns browsers o onclose não dispara após erro de handshake
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          reconnectTimer.current = setTimeout(connect, reconnectInterval)
        }
      }
    } catch (error) {
      console.error("Error creating WebSocket:", error)
      setConnectionError("Failed to create connection")
      setIsConnecting(false)
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    if (ws.current) {
      ws.current.close(1000, "Manual disconnect")
      ws.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
    setClientId(null)
    reconnectAttempts.current = 0
  }, [])

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message))
      } else {
        // Queue message for when connection is restored
        messageQueue.current.push(message)

        // Try to connect if not already connecting
        if (!isConnecting && !isConnected) {
          connect()
        }
      }
    },
    [isConnecting, isConnected, connect],
  )

  const ping = useCallback(() => {
    sendMessage({ type: "ping" })
  }, [sendMessage])

  // Auto-connect on mount
  useEffect(() => {
    if (!wsDisabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [connect, disconnect, wsDisabled])

  // Ping server periodically to keep connection alive
  useEffect(() => {
    if (!isConnected || wsDisabled) return

    const pingInterval = setInterval(() => {
      ping()
    }, 30000) // Ping every 30 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected, ping, wsDisabled])

  return {
    isConnected,
    isConnecting,
    clientId,
    connectionError,
    sendMessage,
    connect,
    disconnect,
    ping,
  }
}
