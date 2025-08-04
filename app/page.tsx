import dynamic from "next/dynamic"
import { Suspense } from "react"

// Lazy load do componente HomePage para melhor performance
const HomePage = dynamic(() => import("@/components/home-page").then(mod => ({ default: mod.HomePage })), {
  ssr: true,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  ),
})

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  )
}
