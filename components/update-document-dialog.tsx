"use client"

import { useState } from "react"
import { Upload, X, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { formatBytes } from "@/utils/formatters"
import { cn } from "@/lib/utils"
import type { Document } from "@/types/files"
import { getDocumentTypeCode } from "@/types/files"

interface UpdateDocumentDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]

export function UpdateDocumentDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: UpdateDocumentDialogProps) {
  const apiClient = useApiClient()
  const { toast } = useToast()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [comentario, setComentario] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: "Solo se permiten archivos PDF, JPG o PNG",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo debe ser menor a ${formatBytes(MAX_FILE_SIZE)}`,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!document) {
      toast({
        title: "Error",
        description: "No hay documento seleccionado",
        variant: "destructive",
      })
      return
    }

    if (!selectedFile) {
      toast({
        title: "Archivo requerido",
        description: "Debes seleccionar un archivo para actualizar el documento",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // ✅ SOLO enviar el nuevo evento de validación (backend hace el merge automáticamente)
      const revisor = document.metadata?.datos_generales?.nombre_completo || "Usuario"
      const nuevoComentario = comentario.trim() || "Documento actualizado"

      const metadata: any = {
        validacion: {
          estado_actual: "PENDIENTE",
          revisor: revisor,
          comentarios: nuevoComentario
        }
      }

      console.log("📋 Metadata a enviar (backend hará merge):", JSON.stringify(metadata, null, 2))

      // Validaciones antes de enviar
      const ownerRef = document.metadata?.datos_generales?.id_interno

      // Obtener doc_type: primero intentar con type_code, luego mapear desde type_name
      let docType = document.type_code

      console.log("=== ACTUALIZAR DOCUMENTO (POST /documents/upload) ===")
      console.log("Document completo:", document)
      console.log("Document ID:", document.document_id)
      console.log("Type Code original:", document.type_code)
      console.log("Type Name:", document.type_name)
      console.log("Owner Ref:", ownerRef)

      // Si type_code no existe o es inválido, intentar obtenerlo desde type_name
      if (!docType || docType === "undefined" || docType === "") {
        console.warn("⚠️ type_code no disponible, intentando mapear desde type_name...")
        const mappedType = getDocumentTypeCode(document.type_name)

        if (mappedType) {
          docType = mappedType
          console.log("✅ Mapeado exitoso:", document.type_name, "→", docType)
        } else {
          console.error("❌ No se pudo mapear type_name:", document.type_name)
        }
      }

      console.log("Doc Type final a usar:", docType)
      console.log("Archivo nuevo:", selectedFile.name)
      console.log("Metadata de actualización:", JSON.stringify(metadata, null, 2))

      // Validar que tenemos los datos necesarios
      if (!ownerRef) {
        throw new Error("No se encontró el owner_ref (id_interno) en el documento")
      }

      if (!docType || docType === "undefined") {
        throw new Error(
          `No se pudo determinar el tipo de documento.\n` +
          `type_code: "${document.type_code}"\n` +
          `type_name: "${document.type_name}"\n` +
          `Tipos válidos: INE_FRONT, INE_BACK, ACTA_NAC, CURP, KARDEX, COMP_DOM`
        )
      }

      console.log("✅ Validaciones pasadas")
      console.log("✅ Backend detectará que existe y hará MERGE del historial")

      // Usar uploadDocument con mismo owner_ref y doc_type para que backend detecte y merge
      await apiClient.uploadDocument({
        file: selectedFile,
        owner_ref: ownerRef,
        doc_type: docType,
        metadata: metadata
      })

      toast({
        title: "✅ Documento actualizado",
        description: `${selectedFile.name} se actualizó correctamente`,
      })

      // Limpiar y cerrar
      setSelectedFile(null)
      setComentario("")
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error al actualizar documento:", error)
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error al actualizar el documento",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setComentario("")
      onOpenChange(false)
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Actualizar Documento
          </DialogTitle>
          <DialogDescription>
            Sube una nueva versión de: <strong>{document.type_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del documento actual */}
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Archivo actual:</span>
              <span className="font-mono text-xs">{document.file_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span className="font-medium">{document.type_name}</span>
            </div>
            {document.metadata?.datos_generales && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usuario:</span>
                  <span className="font-medium">
                    {document.metadata.datos_generales.nombre_completo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Folio:</span>
                  <span className="font-mono">{document.metadata.datos_generales.folio}</span>
                </div>
              </>
            )}
          </div>

          {/* Selector de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file-update">Nuevo Archivo *</Label>
            <Input
              id="file-update"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Formatos: PDF, JPG, PNG • Máximo: {formatBytes(MAX_FILE_SIZE)}
            </p>
          </div>

          {/* Archivo seleccionado */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
              <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(selectedFile.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario-update">Comentario (Opcional)</Label>
            <Input
              id="comentario-update"
              placeholder="Ej: Corregido según observaciones"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Este comentario se agregará al historial de validación
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFile || uploading} className="flex-1">
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
