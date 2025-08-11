import { MemoriesPublic } from '@/components/memories-public'
import { Watermark } from '@/components/watermark'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memórias Públicas - Up Soluções',
  description: 'Demonstração de acesso público a dados com RLS (Row Level Security) configurado no Supabase',
  robots: 'index, follow'
}

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Watermark pageId="memories" />
      <MemoriesPublic />
    </div>
  )
}