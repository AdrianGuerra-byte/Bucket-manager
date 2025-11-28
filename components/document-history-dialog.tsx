"use client"

import { Document, HistorialCambio } from "@/types/files"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/utils/formatters"
import { formatDate } from "@/utils/formatters"
import { Download, FileText, Image as ImageIcon, Clock, History as HistoryIcon } from "lucide-react"

interface DocumentHistoryDialogProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentHistoryDialog({
  document,
  open,
  onOpenChange,
}: DocumentHistoryDialogProps) {
  if (!document) return null

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase()
    if (lower.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    }
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const getStatusBadge = (metadata?: any) => {
    if (!metadata?.status) return null
    
    const status = metadata.status
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      VALIDADO: { variant: "default", label: "Validado" },
      PENDIENTE: { variant: "secondary", label: "Pendiente" },
      RECHAZADO: { variant: "destructive", label: "Rechazado" },
    }
    
    const config = variants[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const historialCambios = document.metadata?.historial_cambios || []
  const hasHistory = historialCambios.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Historial de Cambios
          </DialogTitle>
          <DialogDescription>
            {document.type_name} - {hasHistory ? `${historialCambios.length} cambio(s) anterior(es)` : "Sin cambios previos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Documento actual */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getFileIcon(document.file_name)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Documento Actual</p>
                    <Badge variant="default">Activo</Badge>
                    {getStatusBadge(document.metadata)}
                  </div>
                  <p className="text-sm text-muted-foreground">{document.file_name}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Subido:</span>{" "}
                <span className="font-medium">{formatDate(document.upload_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tamaño:</span>{" "}
                <span className="font-medium">{formatBytes(document.size_bytes)}</span>
              </div>
              {document.metadata?.ciclo && (
                <div>
                  <span className="text-muted-foreground">Ciclo:</span>{" "}
                  <span className="font-medium">{document.metadata.ciclo}</span>
                </div>
              )}
              {document.metadata?.comentario && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Comentario:</span>{" "}
                  <span className="font-medium">{document.metadata.comentario}</span>
                </div>
              )}
              {Object.entries(document.metadata || {}).map(([key, value]) => {
                if (["status", "ciclo", "comentario", "origen", "historial_cambios"].includes(key)) return null
                return (
                  <div key={key} className="col-span-2">
                    <span className="text-muted-foreground">{key}:</span>{" "}
                    <span className="font-medium">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Historial de cambios */}
          {hasHistory && (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex-1 border-t" />
                <span>Cambios Anteriores</span>
                <div className="flex-1 border-t" />
              </div>

              {historialCambios.map((cambio, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Versión {cambio.version_asociada}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cambio.fecha_corte)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Datos anteriores:</p>
                    <div className="bg-background rounded-md p-3 text-sm space-y-1">
                      {Object.entries(cambio.datos_anteriores).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-muted-foreground font-medium">{key}:</span>
                          <span className="flex-1">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!hasHistory && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Este documento no tiene cambios registrados
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
