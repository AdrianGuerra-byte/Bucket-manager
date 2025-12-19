"use client"

import { Document } from "@/types/files"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatBytes, formatDate } from "@/utils/formatters"
import {
  FileText,
  Image as ImageIcon,
  History as HistoryIcon,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  // Debug: Ver qué documento se está mostrando
  if (document && open) {
    console.log("=== DOCUMENT HISTORY DIALOG ABIERTO (NUEVA ESTRUCTURA) ===")
    console.log("Documento recibido:", document.file_name)
    console.log("Metadata completo:", JSON.stringify(document.metadata, null, 2))
    console.log("metadata.validacion:", document.metadata?.validacion)
    console.log("metadata.validacion.historial:", document.metadata?.validacion?.historial)
    console.log("Tipo de historial:", typeof document.metadata?.validacion?.historial)
    console.log("Es array?:", Array.isArray(document.metadata?.validacion?.historial))
    console.log("Longitud:", document.metadata?.validacion?.historial?.length)

    if (document.metadata?.validacion?.historial && Array.isArray(document.metadata.validacion.historial)) {
      console.log(`✅ Historial con ${document.metadata.validacion.historial.length} eventos:`)
      document.metadata.validacion.historial.forEach((evento: any, idx: number) => {
        console.log(`  [${idx}]`, {
          timestamp: evento.timestamp,
          estado: evento.estado,
          revisor: evento.revisor,
          comentarios: evento.comentarios,
        })
      })
    } else {
      console.warn("❌ NO hay validacion.historial o no es array")
    }
  }

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

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const normalizedStatus = status.toUpperCase()

    const variants: Record<
      string,
      { variant: "default" | "secondary" | "destructive"; label: string; icon: React.ReactNode }
    > = {
      VALIDADO: {
        variant: "default",
        label: "Validado",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      PENDIENTE: {
        variant: "secondary",
        label: "Pendiente",
        icon: <Clock className="h-3 w-3" />,
      },
      RECHAZADO: {
        variant: "destructive",
        label: "Rechazado",
        icon: <XCircle className="h-3 w-3" />,
      },
      EN_REVISION: {
        variant: "secondary",
        label: "En Revisión",
        icon: <AlertCircle className="h-3 w-3" />,
      },
    }

    const config = variants[normalizedStatus] || {
      variant: "secondary",
      label: status,
      icon: null,
    }

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Renderizar metadata con NUEVA estructura genérica
  const renderMetadata = (metadata: any) => {
    if (!metadata) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No hay metadata disponible
        </div>
      )
    }

    // Estructura genérica v3.0: sistema_origen, datos_generales, validacion
    const hasNewStructure =
      metadata.sistema_origen || metadata.datos_generales || metadata.validacion

    if (!hasNewStructure) {
      return (
        <div className="text-sm text-muted-foreground italic">
          Estructura de metadata no reconocida
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Sistema Origen */}
        {metadata.sistema_origen && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              <Building2 className="h-4 w-4" />
              Sistema: {metadata.sistema_origen}
            </div>
          </div>
        )}

        {/* Datos Generales */}
        {metadata.datos_generales && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-bold text-purple-900 dark:text-purple-100 uppercase">
                DATOS GENERALES
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {metadata.datos_generales.id_interno && (
                <div>
                  <span className="text-muted-foreground font-medium">ID Interno:</span>
                  <p className="font-mono font-semibold">{metadata.datos_generales.id_interno}</p>
                </div>
              )}
              {metadata.datos_generales.folio && (
                <div>
                  <span className="text-muted-foreground font-medium">Folio:</span>
                  <p className="font-mono font-semibold">{metadata.datos_generales.folio}</p>
                </div>
              )}
              {metadata.datos_generales.nombre_completo && (
                <div className="col-span-2">
                  <span className="text-muted-foreground font-medium">Nombre Completo:</span>
                  <p className="font-semibold">{metadata.datos_generales.nombre_completo}</p>
                </div>
              )}
              {metadata.datos_generales.grado_academico && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground font-medium block">Grado:</span>
                    <p className="font-semibold">{metadata.datos_generales.grado_academico}</p>
                  </div>
                </div>
              )}
              {metadata.datos_generales.programa_academico && (
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground font-medium block">Programa:</span>
                    <p className="font-semibold">{metadata.datos_generales.programa_academico}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validación y Estado Actual */}
        {metadata.validacion && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-green-900 dark:text-green-100">
                  VALIDACIÓN
                </span>
              </div>
              {metadata.validacion.estado_actual && getStatusBadge(metadata.validacion.estado_actual)}
            </div>

            {/* Historial de Validación - COMPLETO */}
            {metadata.validacion.historial &&
              Array.isArray(metadata.validacion.historial) &&
              metadata.validacion.historial.length > 0 && (
                <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HistoryIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-bold text-green-900 dark:text-green-100">
                        Historial Completo de Revisiones
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metadata.validacion.historial.length}{" "}
                      {metadata.validacion.historial.length === 1 ? "evento" : "eventos"}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {/* Mostrar del más antiguo al más reciente (orden cronológico) */}
                    {metadata.validacion.historial.map((evento: any, evIdx: number) => {
                      const isFirst = evIdx === 0
                      const isLast = evIdx === metadata.validacion.historial.length - 1

                      return (
                        <div
                          key={evIdx}
                          className={cn(
                            "bg-white/70 dark:bg-black/30 rounded-lg p-3 space-y-2 text-xs border-l-4",
                            isLast
                              ? "border-green-500 shadow-md"
                              : "border-gray-300 dark:border-gray-700"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {evento.timestamp ? formatDate(evento.timestamp) : "Sin fecha"}
                              </span>
                            </div>
                            {isLast && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                Más reciente
                              </Badge>
                            )}
                            {isFirst && (
                              <Badge variant="outline" className="text-xs">
                                Inicial
                              </Badge>
                            )}
                          </div>

                          {evento.estado && (
                            <div className="flex items-center gap-2 pl-5">
                              <span className="text-muted-foreground">Estado:</span>
                              {getStatusBadge(evento.estado)}
                            </div>
                          )}

                          {evento.revisor && (
                            <div className="flex items-center gap-2 pl-5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Revisor:</span>
                              <span className="font-medium">{evento.revisor}</span>
                            </div>
                          )}

                          {evento.comentarios && (
                            <div className="pl-5 text-muted-foreground italic bg-muted/30 p-2 rounded">
                              💬 "{evento.comentarios}"
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            {/* Si no hay historial */}
            {(!metadata.validacion.historial ||
              !Array.isArray(metadata.validacion.historial) ||
              metadata.validacion.historial.length === 0) && (
              <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Sin historial de revisiones</p>
                  <p className="text-xs mt-1">Este documento aún no ha sido revisado</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Historial Completo del Documento
          </DialogTitle>
          <DialogDescription>
            {document.type_name} - {document.file_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Documento actual */}
          <div className="border-2 rounded-lg p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getFileIcon(document.file_name)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Versión Actual</p>
                    <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
                    {getStatusBadge(
                      document.metadata?.validacion?.estado_actual ||
                        document.metadata?.status
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Subido: {formatDate(document.upload_date)} • Tamaño:{" "}
                    {formatBytes(document.size_bytes)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-semibold text-muted-foreground mb-3">
                INFORMACIÓN ACTUAL
              </div>
              {renderMetadata(document.metadata)}
            </div>
          </div>

          {/* Sin versiones anteriores por ahora */}
          <div className="border rounded-lg p-8 text-center">
            <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">Sin versiones anteriores</p>
            <p className="text-sm text-muted-foreground mt-1">
              Los cambios de estado se reflejan en el historial de validación arriba
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
