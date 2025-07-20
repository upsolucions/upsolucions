import { WebSocketServer } from "ws"
import { createServer } from "http"

const PORT = process.env.WS_PORT || 8080

// Create HTTP server
const server = createServer()

// Create WebSocket server
const wss = new WebSocketServer({
  server,
  path: "/ws",
})

// Store connected clients
const clients = new Map()
let clientIdCounter = 0

// Broadcast message to all connected clients except sender
function broadcast(message, senderId = null) {
  const messageStr = JSON.stringify(message)

  clients.forEach((client, id) => {
    if (id !== senderId && client.readyState === client.OPEN) {
      try {
        client.send(messageStr)
      } catch (error) {
        console.error(`Error sending to client ${id}:`, error)
        clients.delete(id)
      }
    }
  })
}

// Handle new WebSocket connections
wss.on("connection", (ws, request) => {
  const clientId = ++clientIdCounter
  const clientInfo = {
    id: clientId,
    ip: request.socket.remoteAddress,
    userAgent: request.headers["user-agent"],
    connectedAt: new Date().toISOString(),
  }

  clients.set(clientId, ws)

  console.log(`Client ${clientId} connected from ${clientInfo.ip}`)
  console.log(`Total clients: ${clients.size}`)

  // Send welcome message with client ID
  ws.send(
    JSON.stringify({
      type: "connection",
      clientId,
      message: "Connected to WebSocket server",
      timestamp: new Date().toISOString(),
    }),
  )

  // Broadcast to other clients that someone joined
  broadcast(
    {
      type: "client_joined",
      clientId,
      totalClients: clients.size,
      timestamp: new Date().toISOString(),
    },
    clientId,
  )

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString())

      console.log(`Message from client ${clientId}:`, message.type)

      switch (message.type) {
        case "content_update":
          // Broadcast content updates to all other clients
          broadcast(
            {
              type: "content_update",
              path: message.path,
              value: message.value,
              clientId,
              timestamp: new Date().toISOString(),
            },
            clientId,
          )
          break

        case "image_upload":
          // Broadcast image uploads to all other clients
          broadcast(
            {
              type: "image_upload",
              path: message.path,
              imageUrl: message.imageUrl,
              clientId,
              timestamp: new Date().toISOString(),
            },
            clientId,
          )
          break

        case "admin_login":
          // Broadcast admin login status
          broadcast(
            {
              type: "admin_status",
              isAdmin: message.isAdmin,
              clientId,
              timestamp: new Date().toISOString(),
            },
            clientId,
          )
          break

        case "ping":
          // Respond to ping with pong
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          )
          break

        case "gallery_update":
          // Broadcast gallery updates
          broadcast(
            {
              type: "gallery_update",
              action: message.action,
              data: message.data,
              clientId,
              timestamp: new Date().toISOString(),
            },
            clientId,
          )
          break

        default:
          console.log(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error(`Error processing message from client ${clientId}:`, error)
    }
  })

  // Handle client disconnect
  ws.on("close", (code, reason) => {
    clients.delete(clientId)
    console.log(`Client ${clientId} disconnected. Code: ${code}, Reason: ${reason}`)
    console.log(`Total clients: ${clients.size}`)

    // Broadcast to other clients that someone left
    broadcast({
      type: "client_left",
      clientId,
      totalClients: clients.size,
      timestamp: new Date().toISOString(),
    })
  })

  // Handle errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error)
    clients.delete(clientId)
  })
})

// Handle server errors
wss.on("error", (error) => {
  console.error("WebSocket server error:", error)
})

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down WebSocket server...")

  // Close all client connections
  clients.forEach((client, id) => {
    client.close(1000, "Server shutting down")
  })

  // Close the server
  server.close(() => {
    console.log("WebSocket server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...")
  process.exit(0)
})

// Keep track of server stats
setInterval(() => {
  console.log(`Server stats - Connected clients: ${clients.size}, Uptime: ${process.uptime()}s`)
}, 60000) // Log every minute
