import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdminProvider } from "@/contexts/admin-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Up Solicions - Segurança Tecnológica",
  description:
    "Especialistas em sistemas de segurança, automação e tecnologia. Câmeras, alarmes, controle de acesso, automação residencial e muito mais.",
  keywords: "segurança, câmeras, alarmes, automação, controle de acesso, Rio de Janeiro",
  robots: "index, follow",
  authors: [{ name: "Up Solicions" }],
  creator: "Up Solicions",
  publisher: "Up Solicions",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'v0.dev'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  )
}
