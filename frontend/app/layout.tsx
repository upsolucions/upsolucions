"use client"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdminProvider } from "@/contexts/admin-context"
import { WebSocketProvider } from "@/contexts/websocket-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Up Solucions",
  description:
    "Especialistas em sistemas de segurança, automação e tecnologia. Câmeras, alarmes, controle de acesso, automação residencial e muito mais.",
  keywords: "segurança, câmeras, alarmes, automação, controle de acesso, Rio de Janeiro",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  authors: [{ name: "Up Solucions" }],
  creator: "Up Solucions",
  publisher: "Up Solucions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'up solucions'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <AdminProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
