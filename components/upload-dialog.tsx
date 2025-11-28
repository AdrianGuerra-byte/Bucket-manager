"use client"

import { useState } from "react"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { formatBytes } from "@/utils/formatters"
import { cn } from "@/lib/utils"

interface UploadDialogProps {
  ownerRef: number | string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]

// Document types catalog
const DOCUMENT_TYPES = [
  { code: "INE_FRONT", name: "INE (Frente)" },
  { code: "INE_BACK", name: "INE (Reverso)" },
  { code: "ACTA_NACIMIENTO", name: "Acta de Nacimiento" },
  { code: "CURP", name: "CURP" },
  { code: "COMPROBANTE_DOMICILIO", name: "Comprobante de Domicilio" },
  { code: "CERTIFICADO", name: "Certificado de Estudios" },
  { code: "KARDEX", name: "Kardex" },
  { code: "FOTOGRAFIA", name: "Fotografía" },
  { code: "OTRO", name: "Otro Documento" },
]

export function UploadDialog({ ownerRef, open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<string>("")
  const [ciclo, setCiclo] = useState<string>("")
  const [comentario, setComentario] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient()

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Formato no válido. Solo aceptamos PDF o Imágenes (JPG/PNG)."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo pesa más de 2MB. Por favor comprímelo."
    }
    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0] // Solo un archivo
    const error = validateFile(file)

    if (error) {
      toast({
        title: "Archivo no válido",
        description: error,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
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

  const removeFile = () => {
    setSelectedFile(null)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setDocType("")
    setCiclo("")
    setComentario("")
  }

  const handleUpload = async () => {
    if (!selectedFile || !docType) {
      toast({
        title: "Campos incompletos",
        description: "Debes seleccionar un archivo y un tipo de documento",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      await apiClient.uploadDocument({
        file: selectedFile,
        owner_ref: ownerRef,
        doc_type: docType,
        metadata: {
          ciclo: ciclo || undefined,
          origen: "portal_web",
          comentario: comentario || undefined,
        },
      })
      
      toast({
        title: "Documento subido",
        description: `${selectedFile.name} se subió correctamente`,
      })
      
      resetForm()
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
    if (type.startsWith("image/")) return ImageIcon
    return FileText
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir documento</DialogTitle>
          <DialogDescription>
            Arrastra un archivo PDF o imagen aquí, o haz clic para seleccionar. Máximo 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Documento */}
          <div className="space-y-2">
            <Label htmlFor="doc-type">Tipo de Documento *</Label>
            <Select value={docType} onValueChange={setDocType} disabled={uploading}>
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Selecciona el tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ciclo Escolar */}
          <div className="space-y-2">
            <Label htmlFor="ciclo">Ciclo Escolar</Label>
            <Input
              id="ciclo"
              placeholder="Ej: 2025-1"
              value={ciclo}
              onChange={(e) => setCiclo(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (Opcional)</Label>
            <Input
              id="comentario"
              placeholder="Agrega un comentario sobre el documento"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={uploading}
            />
          </div>

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
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Solo PDF, JPG o PNG, máximo 2MB
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
                Seleccionar archivo
              </Button>
            </label>
          </div>

          {/* Archivo seleccionado */}
          {selectedFile && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Archivo seleccionado</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group">
                {(() => {
                  const Icon = getFileIcon(selectedFile.type)
                  return <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={removeFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !docType || uploading}
            >
              {uploading ? "Subiendo..." : "Subir Documento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
