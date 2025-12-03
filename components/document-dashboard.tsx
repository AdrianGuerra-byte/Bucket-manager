"use client"

import { useState } from "react"
import { DocumentList } from "./document-list"
import { UploadDialog } from "./upload-dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Search, UserPlus } from "lucide-react"

export function DocumentDashboard() {
  const [ownerRef, setOwnerRef] = useState<string>("")
  const [activeOwnerRef, setActiveOwnerRef] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMode, setUploadMode] = useState<"existing" | "new">("new")

  const handleSearch = () => {
    if (ownerRef.trim()) {
      setActiveOwnerRef(ownerRef.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleCreateProspect = () => {
    setUploadMode("new")
    setShowUploadDialog(true)
  }

  const handleUploadSuccess = () => {
    // Recargar lista si estamos en modo activo
    if (activeOwnerRef) {
      setActiveOwnerRef(activeOwnerRef) // Force refresh
    }
  }

  if (!activeOwnerRef) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Gestión de Documentos</CardTitle>
              <CardDescription>
                Busca un alumno existente o crea un nuevo prospecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-ref">Matrícula / Folio</Label>
                <Input
                  id="owner-ref"
                  placeholder="Ej: 2500001"
                  value={ownerRef}
                  onChange={(e) => setOwnerRef(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                />
              </div>
              <Button onClick={handleSearch} className="w-full" disabled={!ownerRef.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Buscar Documentos
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O</span>
                </div>
              </div>

              <Button
                onClick={handleCreateProspect}
                variant="outline"
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Nuevo Prospecto
              </Button>
            </CardContent>
          </Card>
        </div>

        <UploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onSuccess={handleUploadSuccess}
          mode={uploadMode}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documentos del Alumno</h2>
          <p className="text-muted-foreground">
            Matrícula/Folio: <span className="font-semibold">{activeOwnerRef}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setActiveOwnerRef(null)
            setOwnerRef("")
          }}
        >
          Cambiar Alumno
        </Button>
      </div>
      
      <DocumentList ownerRef={activeOwnerRef} />
    </div>
  )
}
