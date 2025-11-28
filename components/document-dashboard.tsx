"use client"

import { useState } from "react"
import { DocumentList } from "./document-list"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Search } from "lucide-react"

export function DocumentDashboard() {
  const [ownerRef, setOwnerRef] = useState<string>("")
  const [activeOwnerRef, setActiveOwnerRef] = useState<string | null>(null)

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

  if (!activeOwnerRef) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Buscar Documentos</CardTitle>
            <CardDescription>
              Ingresa la matrícula o folio del alumno para ver sus documentos
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
          </CardContent>
        </Card>
      </div>
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
