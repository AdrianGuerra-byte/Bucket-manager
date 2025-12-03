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
import { Download, FileText, Image as ImageIcon, Clock, History as HistoryIcon, User, Building2, Mail, Phone, GraduationCap, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

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
  const [expandedVersions, setExpandedVersions] = useState<Record<number, boolean>>({})

  if (!document) return null

  const toggleVersion = (index: number) => {
    setExpandedVersions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

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
    
    const variants: Record<string, { variant: "default" | "secondary" | "destructive", label: string }> = {
      VALIDADO: { variant: "default", label: "Validado" },
      ACEPTADO: { variant: "default", label: "Aceptado" },
      PENDIENTE: { variant: "secondary", label: "Pendiente" },
      RECHAZADO: { variant: "destructive", label: "Rechazado" },
      RECHAZADA: { variant: "destructive", label: "Rechazado" },
    }
    
    const config = variants[normalizedStatus] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Renderizar metadata de forma estructurada
  const renderMetadata = (metadata: any) => {
    if (!metadata) return null

    const excludeKeys = ['historial_cambios', 'status', 'sistema_origen', 'origen']
    const hasAdvancedMetadata = metadata.sistema_origen || metadata.propietario || metadata.validacion

    if (hasAdvancedMetadata) {
      return (
        <div className="space-y-3">
          {/* Propietario */}
          {metadata.propietario && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4" />
                {metadata.propietario.tipo_entidad === "prospecto" ? "PROSPECTO" : "ALUMNO"}
              </div>
              <div className="pl-6 space-y-1.5 text-sm">
                {metadata.propietario.folio && (
                  <div><span className="text-muted-foreground">Folio:</span> <span className="font-mono">{metadata.propietario.folio}</span></div>
                )}
                {metadata.propietario.nombre_completo && (
                  <div><span className="text-muted-foreground">Nombre:</span> {metadata.propietario.nombre_completo}</div>
                )}
                {metadata.propietario.grado_academico && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    {metadata.propietario.grado_academico}
                  </div>
                )}
                {metadata.propietario.programa_academico && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    {metadata.propietario.programa_academico}
                  </div>
                )}
                {metadata.propietario.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-blue-600 dark:text-blue-400">{metadata.propietario.email}</span>
                  </div>
                )}
                {metadata.propietario.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {metadata.propietario.telefono}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historial de validación - COMPLETO con todas las entradas */}
          {metadata.validacion?.historial && Array.isArray(metadata.validacion.historial) && metadata.validacion.historial.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 space-y-2 border border-blue-200 dark:border-blue-900">
              <div className="text-sm font-semibold text-foreground">
                Historial Completo de Revisiones ({metadata.validacion.historial.length})
              </div>
              <div className="space-y-2">
                {/* Mostrar del más reciente al más antiguo */}
                {[...metadata.validacion.historial].reverse().map((revision: any, revIdx: number) => (
                  <div key={revIdx} className="bg-background/60 rounded p-2 space-y-1 border text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(revision.estado)}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground text-xs">
                        {revision.timestamp ? formatDate(revision.timestamp) : "Sin fecha"}
                      </span>
                      {revIdx === 0 && (
                        <Badge variant="outline" className="ml-auto text-xs">Más reciente</Badge>
                      )}
                    </div>
                    {revision.revisor && revision.revisor !== "Sistema" && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {revision.revisor}
                      </div>
                    )}
                    {revision.comentarios && (
                      <div className="text-xs text-muted-foreground italic pl-5">
                        "{revision.comentarios}"
                      </div>
                    )}
                    {revision.detalles_rechazo && (
                      <div className="text-xs text-destructive pl-5">
                        Motivo: {revision.detalles_rechazo.motivo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Otros campos de metadata simple */}
          {Object.entries(metadata).filter(([key]) => 
            !excludeKeys.includes(key) && !['propietario', 'validacion'].includes(key)
          ).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="text-muted-foreground font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{" "}
              <span>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</span>
            </div>
          ))}
        </div>
      )
    }

    // Metadata simple
    return (
      <div className="space-y-2 text-sm">
        {Object.entries(metadata).filter(([key]) => !excludeKeys.includes(key)).map(([key, value]) => (
          <div key={key}>
            <span className="text-muted-foreground font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{" "}
            <span>{typeof value === 'object' ? (
              <pre className="mt-1 text-xs bg-muted/30 p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
            ) : String(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const historialCambios = document.metadata?.historial_cambios || []
  const hasHistory = historialCambios.length > 0

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
                    {getStatusBadge(document.metadata?.archivos?.[0]?.estado_actual || document.metadata?.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Subido: {formatDate(document.upload_date)} • Tamaño: {formatBytes(document.size_bytes)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-semibold text-muted-foreground mb-3">INFORMACIÓN ACTUAL</div>
              {renderMetadata(document.metadata)}
            </div>
          </div>

          {/* Historial de cambios (versiones anteriores) */}
          {hasHistory ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="flex-1 border-t" />
                <span>VERSIONES ANTERIORES ({historialCambios.length})</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="space-y-3">
                {historialCambios.map((cambio, index) => {
                  const isExpanded = expandedVersions[index] || false
                  const hasDetailedData = Object.keys(cambio.datos_anteriores).length > 0

                  return (
                    <div key={index} className="border rounded-lg overflow-hidden bg-muted/20">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => toggleVersion(index)}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-sm">Versión {cambio.version_asociada}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(cambio.fecha_corte)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {isExpanded && hasDetailedData && (
                        <div className="px-4 pb-4 space-y-3 border-t bg-background/50">
                          <div className="text-sm font-semibold text-muted-foreground mt-3">DATOS DE ESTA VERSIÓN</div>
                          {renderMetadata(cambio.datos_anteriores)}
                        </div>
                      )}

                      {isExpanded && !hasDetailedData && (
                        <div className="px-4 pb-4 border-t">
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No hay datos adicionales para esta versión
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">Sin versiones anteriores</p>
              <p className="text-sm text-muted-foreground mt-1">
                Este documento no ha sido modificado desde su carga inicial
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
