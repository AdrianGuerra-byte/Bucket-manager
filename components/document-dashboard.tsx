"use client"

import { useState } from "react"
import { DocumentList } from "./document-list"
import { UploadDialog } from "./upload-dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Search, UserPlus, Filter } from "lucide-react"

const DOCUMENT_TYPES = [
  { code: "INE_FRONT", name: "INE (Frente)", description: "Identificación oficial frontal" },
  { code: "INE_BACK", name: "INE (Reverso)", description: "Identificación oficial reverso" },
  { code: "ACTA_NAC", name: "Acta de Nacimiento", description: "Copia certificada" },
  { code: "CURP", name: "CURP", description: "Formato actualizado" },
  { code: "KARDEX", name: "Kárdex / Certificado", description: "Documento académico previo" },
  { code: "COMP_DOM", name: "Comprobante Domicilio", description: "Vigencia menor a 3 meses" },
] as const

export type DocumentTypeCode = typeof DOCUMENT_TYPES[number]["code"]

export function DocumentDashboard() {
  const [ownerRef, setOwnerRef] = useState<string>("")
  const [activeOwnerRef, setActiveOwnerRef] = useState<string | null>(null)
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentTypeCode[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMode, setUploadMode] = useState<"existing" | "new">("new")

  const handleToggleDocType = (typeCode: DocumentTypeCode) => {
    setSelectedDocTypes(prev =>
      prev.includes(typeCode)
        ? prev.filter(t => t !== typeCode)
        : [...prev, typeCode]
    )
  }

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

  const handleClearFilters = () => {
    setSelectedDocTypes([])
  }

  if (!activeOwnerRef) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Gestión de Documentos</CardTitle>
              <CardDescription>
                Busca un alumno/prospecto y filtra los documentos que deseas visualizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda por Owner */}
              <div className="space-y-2">
                <Label htmlFor="owner-ref">Matrícula / Folio del Alumno/Prospecto</Label>
                <Input
                  id="owner-ref"
                  placeholder="Ej: 2500001"
                  value={ownerRef}
                  onChange={(e) => setOwnerRef(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                />
              </div>

              {/* Filtros de Documentos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                  </Button>
                  {selectedDocTypes.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedDocTypes.length} tipo(s) seleccionado(s)
                    </span>
                  )}
                </div>

                {showFilters && (
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Tipos de Documento a Visualizar
                      </Label>
                      {selectedDocTypes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Si no seleccionas ninguno, se mostrarán todos los documentos disponibles
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DOCUMENT_TYPES.map((docType) => (
                        <div
                          key={docType.code}
                          className="flex items-start space-x-2 p-2 rounded hover:bg-muted/50"
                        >
                          <Checkbox
                            id={docType.code}
                            checked={selectedDocTypes.includes(docType.code)}
                            onCheckedChange={() => handleToggleDocType(docType.code)}
                          />
                          <div className="grid gap-1 leading-none">
                            <label
                              htmlFor={docType.code}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {docType.name}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {docType.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Búsqueda */}
              <Button onClick={handleSearch} className="w-full" disabled={!ownerRef.trim()}>
                <Search className="mr-2 h-4 w-4" />
                Buscar Documentos
                {selectedDocTypes.length > 0 && ` (${selectedDocTypes.length} filtro${selectedDocTypes.length > 1 ? 's' : ''})`}
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
          <h2 className="text-2xl font-bold">Documentos del Alumno/Prospecto</h2>
          <p className="text-muted-foreground">
            Matrícula/Folio: <span className="font-semibold">{activeOwnerRef}</span>
            {selectedDocTypes.length > 0 && (
              <span className="ml-2 text-xs">
                • Filtrando {selectedDocTypes.length} tipo(s) de documento
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setActiveOwnerRef(null)
            setOwnerRef("")
            setSelectedDocTypes([])
          }}
        >
          Nueva Búsqueda
        </Button>
      </div>
      
      <DocumentList 
        ownerRef={activeOwnerRef} 
        docTypes={selectedDocTypes.length > 0 ? selectedDocTypes : undefined}
      />
    </div>
  )
}
