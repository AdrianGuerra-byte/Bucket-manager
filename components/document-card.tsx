"use client"

import { Document } from "@/types/files"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, FileText, Image as ImageIcon, CheckCircle2, Clock, XCircle, History } from "lucide-react"
import { formatBytes } from "@/utils/formatters"
import { formatDate } from "@/utils/formatters"

interface DocumentCardProps {
  document: Document
  onPreview: (doc: Document) => void
  onDownload: (doc: Document) => void
  onDelete: (doc: Document) => void
  onViewHistory: (doc: Document) => void
}

export function DocumentCard({ document, onPreview, onDownload, onDelete, onViewHistory }: DocumentCardProps) {
  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case "VALIDADO":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Validado
          </Badge>
        )
      case "RECHAZADO":
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
          {getStatusBadge(document.metadata?.status)}
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

        {/* Metadata adicional (excluyendo historial_cambios y status) */}
        {Object.entries(document.metadata || {}).filter(([key]) => 
          !['historial_cambios', 'status'].includes(key)
        ).length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground">METADATA</div>
            <div className="space-y-1.5 text-xs">
              {Object.entries(document.metadata || {}).map(([key, value]) => {
                if (['historial_cambios', 'status'].includes(key)) return null
                return (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium text-foreground">{key}:</span>
                    <span className="text-muted-foreground flex-1 break-words">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Historial de cambios */}
        {document.metadata?.historial_cambios && document.metadata.historial_cambios.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <History className="h-3 w-3" />
              HISTORIAL ({document.metadata.historial_cambios.length})
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
        {document.metadata?.historial_cambios && document.metadata.historial_cambios.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(document)}
            title="Ver historial de cambios"
          >
            <History className="h-4 w-4" />
          </Button>
        ) : null}
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
