"use client"

import { useState } from "react"
import { Upload, X, FileText, Image as ImageIcon, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { formatBytes } from "@/utils/formatters"
import { cn } from "@/lib/utils"
import { MetadataInscripciones } from "@/types/files"

interface UploadDialogProps {
  ownerRef?: number | string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode?: "existing" | "new" // Modo: usuario existente o crear prospecto
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]

// Document types catalog - DEBE coincidir exactamente con document_types en BD
const DOCUMENT_TYPES = [
  { code: "INE_FRONT", name: "INE (Frente)", description: "Identificación oficial frontal" },
  { code: "INE_BACK", name: "INE (Reverso)", description: "Identificación oficial reverso" },
  { code: "ACTA_NAC", name: "Acta de Nacimiento", description: "Copia certificada" },
  { code: "CURP", name: "CURP", description: "Formato actualizado" },
  { code: "KARDEX", name: "Kárdex / Certificado", description: "Documento académico previo" },
  { code: "COMP_DOM", name: "Comprobante Domicilio", description: "Vigencia menor a 3 meses" },
]

const GRADOS_ACADEMICOS = [
  "Licenciatura",
  "Ingeniería",
  "Maestría",
  "Doctorado",
  "Técnico Superior Universitario",
]

const PROGRAMAS_ACADEMICOS = [
  "SISTEMAS",
  "INDUSTRIAL",
  "ADMINISTRACIÓN",
  "CONTADURÍA",
  "DERECHO",
  "PSICOLOGÍA",
  "EDUCACIÓN",
]

export function UploadDialog({ ownerRef, open, onOpenChange, onSuccess, mode = "existing" }: UploadDialogProps) {
  // Form state
  const [uploadMode, setUploadMode] = useState<"existing" | "new">(mode)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Existing user mode
  const [existingOwnerRef, setExistingOwnerRef] = useState<string>(ownerRef?.toString() || "")
  
  // New prospecto mode
  const [newFolio, setNewFolio] = useState<string>("")
  const [nombreCompleto, setNombreCompleto] = useState<string>("")
  const [gradoAcademico, setGradoAcademico] = useState<string>("")
  const [programaAcademico, setProgramaAcademico] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  
  // Document metadata
  const [comentarioInicial, setComentarioInicial] = useState<string>("")
  
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

    const file = files[0]
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
    setExistingOwnerRef(ownerRef?.toString() || "")
    setNewFolio("")
    setNombreCompleto("")
    setGradoAcademico("")
    setProgramaAcademico("")
    setEmail("")
    setTelefono("")
    setComentarioInicial("")
  }

  const handleUpload = async () => {
    // Validaciones
    if (!selectedFile || !docType) {
      toast({
        title: "Campos incompletos",
        description: "Debes seleccionar un archivo y un tipo de documento",
        variant: "destructive",
      })
      return
    }

    let finalOwnerRef: number
    let metadata: MetadataInscripciones

    if (uploadMode === "existing") {
      if (!existingOwnerRef.trim()) {
        toast({
          title: "Falta Matrícula/Folio",
          description: "Ingresa la matrícula o folio del usuario existente",
          variant: "destructive",
        })
        return
      }
      finalOwnerRef = parseInt(existingOwnerRef)
      
      // Solo enviar la nueva entrada del historial (el backend hace el merge)
      metadata = {
        sistema_origen: "portal_inscripciones",
        propietario: {
          id: finalOwnerRef,
          tipo_entidad: "alumno",
          folio: existingOwnerRef,
          nombre_completo: "Alumno Existente", // TODO: obtener nombre real si está disponible
        },
        validacion: {
          estado_actual: "pendiente",
          ultima_actualizacion: new Date().toISOString(),
          historial: [
            // SOLO LA NUEVA ENTRADA - el backend la agregará al historial existente
            {
              timestamp: new Date().toISOString(),
              revisor: "Sistema",
              estado: "pendiente",
              comentarios: comentarioInicial || "Documento actualizado por usuario",
            },
          ],
        },
      }
    } else {
      // Modo crear prospecto nuevo
      if (!newFolio.trim() || !nombreCompleto.trim()) {
        toast({
          title: "Datos incompletos",
          description: "Debes ingresar al menos el folio y nombre del prospecto",
          variant: "destructive",
        })
        return
      }

      finalOwnerRef = parseInt(newFolio)
      
      // Primera subida - metadata completa con primer historial
      metadata = {
        sistema_origen: "portal_inscripciones",
        propietario: {
          id: finalOwnerRef,
          tipo_entidad: "prospecto",
          folio: newFolio,
          nombre_completo: nombreCompleto,
          programa_academico: programaAcademico || undefined,
          grado_academico: gradoAcademico || undefined,
          email: email || undefined,
          telefono: telefono || undefined,
        },
        validacion: {
          estado_actual: "pendiente",
          ultima_actualizacion: new Date().toISOString(),
          historial: [
            {
              timestamp: new Date().toISOString(),
              revisor: "Sistema",
              estado: "pendiente",
              comentarios: comentarioInicial || "Documento inicial de prospecto",
            },
          ],
        },
      }
    }

    setUploading(true)
    try {
      await apiClient.uploadDocument({
        file: selectedFile,
        owner_ref: finalOwnerRef,
        doc_type: docType,
        metadata: metadata as any,
      })
      
      toast({
        title: uploadMode === "new" ? "Prospecto creado" : "Documento subido",
        description: uploadMode === "new" 
          ? `Se creó el prospecto ${newFolio} y se subió el documento`
          : `${selectedFile.name} se subió correctamente`,
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {uploadMode === "new" ? "Crear Prospecto y Subir Documento" : "Subir Documento"}
          </DialogTitle>
          <DialogDescription>
            {uploadMode === "new"
              ? "Completa los datos del prospecto y sube su primer documento"
              : "Arrastra un archivo PDF o imagen aquí, o haz clic para seleccionar. Máximo 2MB."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de Modo */}
          {!ownerRef && (
            <div className="space-y-2">
              <Label>Tipo de Operación</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={uploadMode === "existing" ? "default" : "outline"}
                  className="h-auto p-4"
                  onClick={() => setUploadMode("existing")}
                  disabled={uploading}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-semibold">Usuario Existente</div>
                      <div className="text-xs opacity-80">Agregar documento a matrícula conocida</div>
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === "new" ? "default" : "outline"}
                  className="h-auto p-4"
                  onClick={() => setUploadMode("new")}
                  disabled={uploading}
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-semibold">Crear Prospecto</div>
                      <div className="text-xs opacity-80">Registrar nuevo prospecto con documento</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Formulario para Usuario Existente */}
          {uploadMode === "existing" && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <Label htmlFor="existing-ref">Matrícula / Folio del Usuario *</Label>
              <Input
                id="existing-ref"
                placeholder="Ej: 2500001"
                value={existingOwnerRef}
                onChange={(e) => setExistingOwnerRef(e.target.value)}
                disabled={uploading || !!ownerRef}
                type="text"
              />
              <p className="text-xs text-muted-foreground">
                El documento se asociará a este usuario existente en el sistema
              </p>
            </div>
          )}

          {/* Formulario para Prospecto Nuevo */}
          {uploadMode === "new" && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-folio">Folio del Prospecto *</Label>
                  <Input
                    id="new-folio"
                    placeholder="Ej: 250001"
                    value={newFolio}
                    onChange={(e) => setNewFolio(e.target.value)}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Pérez García"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grado">Grado Académico</Label>
                  <Select value={gradoAcademico} onValueChange={setGradoAcademico} disabled={uploading}>
                    <SelectTrigger id="grado">
                      <SelectValue placeholder="Selecciona el grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADOS_ACADEMICOS.map((grado) => (
                        <SelectItem key={grado} value={grado}>
                          {grado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programa">Programa Académico</Label>
                  <Select value={programaAcademico} onValueChange={setProgramaAcademico} disabled={uploading}>
                    <SelectTrigger id="programa">
                      <SelectValue placeholder="Selecciona el programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMAS_ACADEMICOS.map((programa) => (
                        <SelectItem key={programa} value={programa}>
                          {programa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="7751234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          )}

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
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comentario Inicial */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario Inicial</Label>
            <Input
              id="comentario"
              placeholder="Agrega un comentario sobre el documento"
              value={comentarioInicial}
              onChange={(e) => setComentarioInicial(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Drop zone - solo se muestra si NO hay archivo seleccionado */}
          {!selectedFile && (
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
          )}

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
              {uploading 
                ? "Subiendo..." 
                : uploadMode === "new" 
                  ? "Crear Prospecto y Subir" 
                  : "Subir Documento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
