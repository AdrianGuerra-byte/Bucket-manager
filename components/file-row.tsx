"use client"

import type { FileItem } from "@/types/files"
import { formatBytes, formatDate } from "@/utils/formatters"
import { getFileIcon, isPreviewable } from "@/utils/file-types"
import { Button } from "@/components/ui/button"
import { Download, Eye, MoreVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface FileRowProps {
  file: FileItem
  bucketName: string
  selected: boolean
  onSelect: (checked: boolean) => void
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

export function FileRow({ file, selected, onSelect, onPreview, onDownload, onDelete }: FileRowProps) {
  const FileIcon = getFileIcon(file.mime_type, file.filename)
  const canPreview = isPreviewable(file.mime_type, file.filename)

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors",
        selected && "bg-muted/70",
      )}
    >
      <Checkbox checked={selected} onCheckedChange={onSelect} aria-label={`Seleccionar ${file.filename}`} />

      <button
        onClick={canPreview ? onPreview : undefined}
        className={cn(
          "flex items-center gap-3 flex-1 min-w-0 text-left",
          canPreview && "cursor-pointer hover:text-primary",
        )}
        disabled={!canPreview}
      >
        <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" title={file.filename}>
            {file.filename}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.modified || file.created_at)}</span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPreview && (
          <Button variant="ghost" size="icon" onClick={onPreview} aria-label="Vista previa">
            <Eye className="h-4 w-4" />
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={onDownload} aria-label="Descargar">
          <Download className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Más opciones">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
