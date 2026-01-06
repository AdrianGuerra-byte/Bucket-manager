"use client"

import { useState } from "react"
import { Document } from "@/types/files"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChangeStatusDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChanged: () => void
}

type StatusType = "PENDIENTE" | "VALIDADO" | "RECHAZADO"

const STATUS_OPTIONS: { value: StatusType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "PENDIENTE",
    label: "Pendiente",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-yellow-500"
  },
  {
    value: "VALIDADO",
    label: "Validado",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-green-500"
  },
  {
    value: "RECHAZADO",
    label: "Rechazado",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-red-500"
  },
]

// Helper para obtener el status actual del documento
const getDocumentStatus = (doc: Document | null): string => {
  if (!doc) return "PENDIENTE"
  // El status puede estar en metadata.validacion.estado_actual o en el campo status directo
  return (doc.metadata?.validacion?.estado_actual || (doc as any).status || "PENDIENTE").toUpperCase()
}

export function ChangeStatusDialog({
  document,
  open,
  onOpenChange,
  onStatusChanged,
}: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<StatusType>("PENDIENTE")
  const [comentarios, setComentarios] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient()

  // Reset form when dialog opens with a new document
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && document) {
      // Set initial status based on current document status
      const currentStatus = getDocumentStatus(document) as StatusType
      if (["PENDIENTE", "VALIDADO", "RECHAZADO"].includes(currentStatus)) {
        setStatus(currentStatus)
      } else {
        setStatus("PENDIENTE")
      }
      setComentarios("")
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async () => {
    if (!document || !apiClient) return

    // Validaciones
    if (!status) {
      toast({
        title: "Estado requerido",
        description: "Selecciona un estado para el documento",
        variant: "destructive",
      })
      return
    }

    // Comentario es obligatorio para cualquier cambio de estatus
    if (!comentarios.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Debes agregar un comentario para justificar el cambio de estatus",
        variant: "destructive",
      })
      return
    }

    // Obtener el nombre del revisor desde la metadata del documento
    const revisor = document.metadata?.datos_generales?.nombre_completo || "Administrador"

    setIsSubmitting(true)

    try {
      console.log("=== CAMBIAR ESTATUS DE DOCUMENTO ===")
      console.log("Document ID:", document.document_id)
      console.log("Nuevo estado:", status)
      console.log("Revisor:", revisor)
      console.log("Comentarios:", comentarios || "(vacío)")

      await apiClient.updateDocumentStatus(
        document.document_id,
        status,
        revisor,
        comentarios || undefined
      )

      toast({
        title: "✅ Estatus actualizado",
        description: `El documento ha sido marcado como ${status}`,
      })

      onStatusChanged()
      onOpenChange(false)
    } catch (error) {
      console.error("Error al cambiar estatus:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el estatus",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!document) return null

  const currentStatus = getDocumentStatus(document)
  const statusChanged = status !== currentStatus

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cambiar Estatus del Documento
          </DialogTitle>
          <DialogDescription>
            Actualiza el estado de validación sin necesidad de subir un nuevo archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información del documento */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{document.type_name || document.type_code}</span>
              <Badge variant="outline" className="text-xs">
                {currentStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {document.file_name}
            </p>
          </div>

          {/* Selector de estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Nuevo Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusType)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${option.color} text-white`}>
                        {option.icon}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de comentarios - OBLIGATORIO */}
          <div className="space-y-2">
            <Label htmlFor="comentarios">
              Comentarios <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="comentarios"
              placeholder="Escribe un comentario para justificar el cambio de estatus..."
              value={comentarios}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComentarios(e.target.value)}
              rows={3}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!comentarios.trim() ? "border-red-300" : ""}`}
            />
            {!comentarios.trim() && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                El comentario es obligatorio para cambiar el estatus
              </p>
            )}
          </div>

          {/* Preview del cambio */}
          {statusChanged && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="font-medium">Cambio:</span>
                <Badge variant="outline">{currentStatus}</Badge>
                <span>→</span>
                <Badge className={STATUS_OPTIONS.find(o => o.value === status)?.color}>
                  {status}
                </Badge>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !statusChanged || !comentarios.trim()}
            className={
              status === "VALIDADO"
                ? "bg-green-600 hover:bg-green-700"
                : status === "RECHAZADO"
                ? "bg-red-600 hover:bg-red-700"
                : ""
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                {STATUS_OPTIONS.find(o => o.value === status)?.icon}
                <span className="ml-2">Guardar Cambio</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
