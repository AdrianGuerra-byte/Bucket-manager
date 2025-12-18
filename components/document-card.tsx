"use client"

import { Document } from "@/types/files"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, FileText, Image as ImageIcon, CheckCircle2, Clock, XCircle, History, User, Building2, Mail, Phone, GraduationCap, BookOpen, RefreshCw } from "lucide-react"
import { formatBytes } from "@/utils/formatters"
import { formatDate } from "@/utils/formatters"

interface DocumentCardProps {
  document: Document
  onPreview: (doc: Document) => void
  onDownload: (doc: Document) => void
  onDelete: (doc: Document) => void
  onViewHistory: (doc: Document) => void
  onUpdate: (doc: Document) => void
}

export function DocumentCard({ document, onPreview, onDownload, onDelete, onViewHistory, onUpdate }: DocumentCardProps) {
  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const normalizedStatus = status.toUpperCase()

    switch (normalizedStatus) {
      case "VALIDADO":
      case "ACEPTADO":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Validado
          </Badge>
        )
      case "RECHAZADO":
      case "RECHAZADA":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        )
      case "PENDIENTE":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  const getFileIcon = () => {
    const fileName = document.file_name.toLowerCase()
    if (fileName.endsWith(".pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  // Renderizar metadata avanzada (nueva estructura de inscripciones)
  const renderMetadataAvanzada = () => {
    const metadata = document.metadata
    if (!metadata) return null

    const sections = []

    // Nueva estructura v2.0 (sistema, entidades, archivo)
    if (metadata.sistema) {
      sections.push(
        <div key="sistema" className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-100">
            <Building2 className="h-3 w-3" />
            {metadata.sistema}
          </div>
        </div>
      )
    }

    // Entidades (prospecto/alumno)
    if (metadata.entidades && Array.isArray(metadata.entidades)) {
      metadata.entidades.forEach((entidad: any, idx: number) => {
        sections.push(
          <div key={`entidad-${idx}`} className="space-y-2 p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-100">
              <User className="h-3 w-3" />
              {entidad.tipo === "prospecto" ? "PROSPECTO" : "ALUMNO"}
            </div>
            {entidad.datos && (
              <div className="grid gap-1.5 pl-5">
                {entidad.datos.folio && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Folio:</span>
                    <span className="text-foreground font-mono font-semibold">{entidad.datos.folio}</span>
                  </div>
                )}
                {entidad.datos.name && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Nombre:</span>
                    <span className="text-foreground font-semibold">{entidad.datos.name}</span>
                  </div>
                )}
                {entidad.datos.gradoAcademico && (
                  <div className="flex items-center gap-2 text-xs">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{entidad.datos.gradoAcademico}</span>
                  </div>
                )}
                {entidad.datos.programaAcademico && (
                  <div className="flex items-center gap-2 text-xs">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground">{entidad.datos.programaAcademico}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })
    }

    // Información del archivo
    if (metadata.archivo) {
      const archivoSections = []

      if (metadata.archivo.estado_actual) {
        archivoSections.push(
          <div key="estado" className="flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Estado:</span>
            {getStatusBadge(metadata.archivo.estado_actual)}
          </div>
        )
      }

      if (metadata.archivo.historial && metadata.archivo.historial.length > 0) {
        const ultimoEvento = metadata.archivo.historial[metadata.archivo.historial.length - 1]
        archivoSections.push(
          <div key="ultimo-evento" className="text-xs p-2 bg-white/50 dark:bg-black/20 rounded border border-green-200 dark:border-green-800">
            <div className="font-medium text-muted-foreground mb-1">Última acción:</div>
            <div className="space-y-0.5 pl-2">
              {ultimoEvento.accion && (
                <div className="flex gap-1.5">
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold">{ultimoEvento.accion}</span>
                </div>
              )}
              {ultimoEvento.fecha && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(ultimoEvento.fecha)}</span>
                </div>
              )}
              {ultimoEvento.usuario && (
                <div className="flex gap-1.5 text-xs">
                  <span className="text-muted-foreground">por</span>
                  <span className="font-medium">{ultimoEvento.usuario}</span>
                </div>
              )}
            </div>
            {metadata.archivo.historial.length > 1 && (
              <div className="text-xs text-muted-foreground text-center pt-2 mt-2 border-t">
                + {metadata.archivo.historial.length - 1} evento(s) anterior(es)
              </div>
            )}
          </div>
        )
      }

      if (archivoSections.length > 0) {
        sections.push(
          <div key="archivo" className="space-y-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-900 dark:text-green-100">
              <FileText className="h-3 w-3" />
              ARCHIVO
            </div>
            <div className="space-y-2">
              {archivoSections}
            </div>
          </div>
        )
      }
    }

    // Estructura antigua: Propietario (prospecto/alumno)
    if (metadata.propietario) {
      const prop = metadata.propietario
      sections.push(
        <div key="propietario" className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <User className="h-3 w-3" />
            {prop.tipo_entidad === "prospecto" ? "PROSPECTO" : "ALUMNO"}
          </div>
          <div className="grid gap-1.5 pl-5">
            {prop.folio && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Folio:</span>
                <span className="text-foreground font-mono">{prop.folio}</span>
              </div>
            )}
            {prop.nombre_completo && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Nombre:</span>
                <span className="text-foreground">{prop.nombre_completo}</span>
              </div>
            )}
            {prop.grado_academico && (
              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{prop.grado_academico}</span>
              </div>
            )}
            {prop.programa_academico && (
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{prop.programa_academico}</span>
              </div>
            )}
            {prop.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-blue-600 dark:text-blue-400">{prop.email}</span>
              </div>
            )}
            {prop.telefono && (
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{prop.telefono}</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Historial de validación - SOLO LA ENTRADA MÁS RECIENTE
    if (metadata.validacion?.historial && metadata.validacion.historial.length > 0) {
      const latestRevision = metadata.validacion.historial[metadata.validacion.historial.length - 1]

      sections.push(
        <div key="validacion" className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="text-xs font-semibold text-foreground">
            Última Revisión
          </div>

          <div className="bg-background/60 rounded p-2 space-y-1 border border-border/50">
            <div className="flex items-center gap-2 text-xs">
              {getStatusBadge(latestRevision.estado)}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {latestRevision.timestamp ? formatDate(latestRevision.timestamp) : "Sin fecha"}
              </span>
            </div>
            {latestRevision.revisor && latestRevision.revisor !== "Sistema" && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{latestRevision.revisor}</span>
              </div>
            )}
            {latestRevision.comentarios && (
              <div className="text-xs text-muted-foreground italic pl-5">
                "{latestRevision.comentarios}"
              </div>
            )}
            {latestRevision.detalles_rechazo && (
              <div className="text-xs text-destructive pl-5">
                Motivo: {latestRevision.detalles_rechazo.motivo}
              </div>
            )}
          </div>

          {metadata.validacion.historial.length > 1 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              + {metadata.validacion.historial.length - 1} revisión(es) anterior(es)
            </div>
          )}
        </div>
      )
    }

    return sections.length > 0 ? sections : null
  }

  // Renderizar metadata simple (estructura antigua)
  const renderMetadataSimple = () => {
    const metadata = document.metadata
    if (!metadata) return null

    const excludeKeys = ['historial_cambios', 'status', 'sistema', 'entidades', 'archivo', 'archivos', 'sistema_origen', 'propietario', 'validacion']
    const simpleEntries = Object.entries(metadata).filter(([key]) => !excludeKeys.includes(key))

    if (simpleEntries.length === 0) return null

    return (
      <div className="space-y-1.5 text-xs">
        {simpleEntries.map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 p-2 bg-muted/20 rounded">
            <span className="font-medium text-muted-foreground capitalize min-w-[80px]">
              {key.replace(/_/g, ' ')}:
            </span>
            <span className="text-foreground flex-1 break-words">
              {typeof value === 'object'
                ? <pre className="text-xs bg-muted/30 p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Determinar si tiene metadata avanzada
  const hasAdvancedMetadata = document.metadata && (
    document.metadata.sistema ||
    document.metadata.entidades ||
    document.metadata.archivo ||
    document.metadata.sistema_origen ||
    document.metadata.propietario ||
    document.metadata.validacion
  )

  // Determinar el estado principal del documento
  const mainStatus = document.metadata?.archivo?.estado_actual ||
                      document.metadata?.validacion?.estado_actual ||
                      document.metadata?.status

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getFileIcon()}
            <div className="space-y-1">
              <CardTitle className="text-base">{document.type_name}</CardTitle>
              <CardDescription className="text-xs">{document.file_name}</CardDescription>
            </div>
          </div>
          {getStatusBadge(mainStatus)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Tamaño:</span> {formatBytes(document.size_bytes)}
          </div>
          <div>
            <span className="font-medium">Fecha:</span> {formatDate(document.upload_date)}
          </div>
        </div>

        {/* Metadata */}
        {hasAdvancedMetadata ? (
          <div className="space-y-3 pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground">INFORMACIÓN DEL DOCUMENTO</div>
            {renderMetadataAvanzada()}
          </div>
        ) : (
          document.metadata && Object.keys(document.metadata).filter(k => !['historial_cambios', 'status'].includes(k)).length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-semibold text-muted-foreground">METADATA</div>
              {renderMetadataSimple()}
            </div>
          )
        )}

        {/* Historial de cambios de versiones (backend) */}
        {document.metadata?.historial_cambios && document.metadata.historial_cambios.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <History className="h-3 w-3" />
              HISTORIAL DE VERSIONES ({document.metadata.historial_cambios.length})
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {document.metadata.historial_cambios.map((cambio, index) => (
                <div key={index} className="bg-muted/30 rounded-md p-2 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">v{cambio.version_asociada}</span>
                    <span>•</span>
                    <span>{formatDate(cambio.fecha_corte)}</span>
                  </div>
                  {Object.keys(cambio.datos_anteriores).length > 0 && (
                    <div className="pl-4 space-y-0.5 text-xs">
                      {Object.entries(cambio.datos_anteriores).map(([key, value]) => (
                        <div key={key} className="flex gap-1.5">
                          <span className="text-muted-foreground">• {key}:</span>
                          <span className="text-foreground font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onPreview(document)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onDownload(document)}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={() => onUpdate(document)}
          title="Actualizar documento con nueva versión"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewHistory(document)}
          title="Ver historial completo"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(document)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
