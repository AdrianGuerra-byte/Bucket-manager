"use client"

import { useState } from "react"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { formatBytes } from "@/utils/formatters"
import { cn } from "@/lib/utils"

interface UploadDialogProps {
  bucketName: string
  subfolder?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const MAX_FILES = 20
const ALLOWED_TYPES = ["application/pdf", "image/jpeg"]

export function UploadDialog({ bucketName, subfolder, open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient()

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Solo se permiten archivos PDF y JPEG`
    }
    if (file.size > 2 * 1024 * 1024) {
      return `${file.name}: El archivo excede 2MB`
    }
    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)
    const errors: string[] = []
    const validFiles: File[] = []

    newFiles.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (selectedFiles.length + validFiles.length > MAX_FILES) {
      toast({
        title: "Límite excedido",
        description: `Máximo ${MAX_FILES} archivos por carga`,
        variant: "destructive",
      })
      return
    }

    if (errors.length > 0) {
      toast({
        title: "Archivos no válidos",
        description: errors.join("\n"),
        variant: "destructive",
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...validFiles])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      if (selectedFiles.length === 1) {
        await apiClient.uploadFile(bucketName, selectedFiles[0], subfolder)
        toast({
          title: "Archivo subido",
          description: `${selectedFiles[0].name} se subió correctamente`,
        })
      } else {
        await apiClient.uploadMultipleFiles(bucketName, selectedFiles, subfolder)
        toast({
          title: "Archivos subidos",
          description: `${selectedFiles.length} archivos se subieron correctamente`,
        })
      }
      setSelectedFiles([])
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error al subir",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") return FileText
    if (type === "image/jpeg") return ImageIcon
    return FileText
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir archivos</DialogTitle>
          <DialogDescription>
            Arrastra archivos PDF o JPEG aquí, o haz clic para seleccionar. Máximo {MAX_FILES} archivos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              uploading && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Solo PDF y JPEG, máximo 2MB por archivo
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                disabled={uploading}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Seleccionar archivos
              </Button>
            </label>
          </div>

          {/* Lista de archivos */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Archivos seleccionados ({selectedFiles.length}/{MAX_FILES})
              </p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => {
                  const Icon = getFileIcon(file.type)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 group"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFiles([])
                onOpenChange(false)
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? "Subiendo..." : `Subir ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
