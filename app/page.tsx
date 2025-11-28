import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { DocumentDashboard } from "@/components/document-dashboard"
import { LogoutButton } from "@/components/logout-button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText } from "lucide-react"

export default async function HomePage() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Sistema de Documentos</h1>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DocumentDashboard />
      </main>
    </div>
  )
}
