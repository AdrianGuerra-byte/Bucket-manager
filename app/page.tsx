import { redirect } from "next/navigation"
import { isAuthenticated, getApi } from "@/lib/auth"
import { BucketList } from "@/components/bucket-list"
import { LogoutButton } from "@/components/logout-button"
import { ModeToggle } from "@/components/mode-toggle"
import { FolderOpen } from "lucide-react"

export default async function HomePage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  const api = await getApi()
  const { buckets } = await api.listBuckets()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Administrador de Buckets</h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Tus Buckets</h2>
        <BucketList buckets={buckets} />
      </main>
    </div>
  )
}
