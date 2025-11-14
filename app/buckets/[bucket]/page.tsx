import { redirect } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FileList } from "@/components/file-list"
import { LogoutButton } from "@/components/logout-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Folder } from "lucide-react"
import { isAuthenticated } from "@/lib/auth"

interface PageProps {
  params: Promise<{ bucket: string }>
  searchParams: Promise<{ subfolder?: string }>
}

export default async function BucketPage({ params, searchParams }: PageProps) {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  const { bucket } = await params
  const { subfolder } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Administrador de Archivos</h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs bucketName={bucket} subfolder={subfolder} />
        </div>

        <FileList bucketName={bucket} subfolder={subfolder} />
      </main>
    </div>
  )
}
