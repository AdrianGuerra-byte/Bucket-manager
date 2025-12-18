"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/hooks/use-api-client"
import { DOCUMENT_TYPES, type DocumentTypeCode } from "@/types/files"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildBulkMetadata, SISTEMAS, ESTADOS_VALIDACION } from "@/lib/metadata-helpers-new"

interface FileWithType {
  file: File
  docType: DocumentTypeCode
  id: string
  status: "pending" | "uploading" | "success" | "error"
  errorMessage?: string
}

interface BulkUploadDialogProps {
  ownerRef?: number | string
  onUploadComplete?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  mode?: "new" | "existing"
}

export function BulkUploadDialog({
  ownerRef: initialOwnerRef,
  onUploadComplete,
  open: controlledOpen,
  onOpenChange,
  mode = "existing"
}: BulkUploadDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [files, setFiles] = useState<FileWithType[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [ownerRef, setOwnerRef] = useState(initialOwnerRef?.toString() || "")
  const [nombreProspecto, setNombreProspecto] = useState("")
  const [gradoAcademico, setGradoAcademico] = useState<string>("")
  const [programaAcademico, setProgramaAcademico] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const apiClient = useApiClient()

  // Manejar open state controlado o no controlado
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length === 0) return

    // Validar cantidad máxima (17 archivos)
    if (files.length + selectedFiles.length > 17) {
      toast({
        title: "Límite excedido",
        description: "Máximo 17 archivos por carga",
        variant: "destructive",
      })
      return
    }

    const newFiles: FileWithType[] = selectedFiles.map((file) => ({
      file,
      docType: "INE_FRONT", // Tipo por defecto
      id: `${Date.now()}-${Math.random()}`,
      status: "pending",
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateFileType = (id: string, docType: DocumentTypeCode) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, docType } : f))
    )
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Sin archivos",
        description: "Agrega al menos un archivo para subir",
        variant: "destructive",
      })
      return
    }

    if (mode === "new" && !ownerRef.trim()) {
      toast({
        title: "Matrícula requerida",
        description: "Ingresa la matrícula/folio del prospecto",
        variant: "destructive",
      })
      return
    }

    if (mode === "new" && !nombreProspecto.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Ingresa el nombre completo del prospecto",
        variant: "destructive",
      })
      return
    }

    if (mode === "new" && !gradoAcademico) {
      toast({
        title: "Grado académico requerido",
        description: "Selecciona el grado académico del prospecto",
        variant: "destructive",
      })
      return
    }

    if (mode === "new" && !programaAcademico.trim()) {
      toast({
        title: "Programa académico requerido",
        description: "Ingresa el programa académico del prospecto",
        variant: "destructive",
      })
      return
    }

    if (!apiClient) {
      toast({
        title: "Error",
        description: "Cliente API no inicializado",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Preparar FormData
      const formData = new FormData()

      files.forEach((item) => {
        formData.append("files", item.file)
      })

      formData.append("owner_ref", ownerRef.toString())
      formData.append("doc_types", JSON.stringify(files.map((f) => f.docType)))

      // Crear un array de metadata (uno por cada archivo) - NUEVA ESTRUCTURA GENÉRICA
      const metadataArray = files.map((item) =>
        buildBulkMetadata({
          sistema_origen: SISTEMAS.INSCRIPCIONES,
          id_interno: parseInt(ownerRef),
          folio: ownerRef,
          nombre_completo: nombreProspecto.toUpperCase(),
          programa_academico: programaAcademico.toUpperCase(),
          grado_academico: gradoAcademico,
          estado_inicial: ESTADOS_VALIDACION.PENDIENTE,
          comentario: `Documento ${item.file.name} subido durante el registro de prospecto`
        })
      )

      formData.append("metadata", JSON.stringify(metadataArray))

      // Debug: Log what we're sending
      console.log("=== BULK UPLOAD (NUEVA ESTRUCTURA GENÉRICA) ===")
      console.log("Owner Ref:", ownerRef)
      console.log("Files count:", files.length)
      console.log("Doc types:", files.map((f) => f.docType))
      console.log("\n📦 Metadata por archivo:")
      metadataArray.forEach((meta, idx) => {
        console.log(`  [${idx}] ${files[idx].file.name}:`, JSON.stringify(meta, null, 2))
      })
      console.log("\n⚠️ Todos con validacion.historial: [] (vacío)")
      console.log("✅ El backend inicializará el historial para cada documento")
      console.log("\nFormData entries:")
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`)
        } else if (key === 'metadata') {
          console.log(`  ${key}: [array de ${metadataArray.length} objetos]`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      // Actualizar estados a "uploading"
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "uploading" as const }))
      )

      const response = await apiClient.uploadMultipleDocuments(formData)

      // Debug: Log response
      console.log("Backend response:", response)
      console.log("Files enviados:", files.map(f => f.file.name))
      console.log("Results recibidos:", response.results.map((r: any) => r.file_name))

      // Validar que la respuesta tenga el formato esperado
      if (!response || !response.results || !Array.isArray(response.results)) {
        throw new Error(`Respuesta inválida del servidor: ${JSON.stringify(response)}`)
      }

      // Actualizar estados según respuesta (buscar por nombre de archivo con matching flexible)
      setFiles((prev) =>
        prev.map((f, index) => {
          // Intentar buscar por nombre exacto primero
          let result = response.results.find(
            (r: any) => r.file_name === f.file.name
          )

          // Si no encuentra, intentar buscar por índice como fallback
          if (!result && response.results[index]) {
            console.log(`No se encontró match exacto para "${f.file.name}", usando índice ${index}`)
            result = response.results[index]
          }

          // Si aún no hay resultado, intentar matching parcial (sin extensión)
          if (!result) {
            const fileNameWithoutExt = f.file.name.replace(/\.[^/.]+$/, "")
            result = response.results.find((r: any) => {
              const resultNameWithoutExt = r.file_name.replace(/\.[^/.]+$/, "")
              return resultNameWithoutExt === fileNameWithoutExt
            })
            if (result) {
              console.log(`Match parcial encontrado: "${f.file.name}" -> "${result.file_name}"`)
            }
          }

          if (!result) {
            console.error(`No se encontró resultado para: ${f.file.name}`)
            return {
              ...f,
              status: "error" as const,
              errorMessage: "Sin respuesta del servidor para este archivo",
            }
          }

          // El backend usa "status": "success" en lugar de "success": true
          if (result.status === "success") {
            return { ...f, status: "success" as const }
          } else {
            return {
              ...f,
              status: "error" as const,
              errorMessage: result.error || result.message || "Error desconocido",
            }
          }
        })
      )

      // Toast según resultado (usar campos del backend: total_uploaded, total_failed)
      if (response.total_uploaded === files.length) {
        toast({
          title: "¡Carga exitosa!",
          description: `${response.total_uploaded} documentos subidos correctamente`,
        })

        // Redirigir al dashboard del alumno después de 1.5 segundos
        setTimeout(() => {
          setOpen(false)
          setFiles([])
          if (mode === "new") {
            setOwnerRef("")
            setNombreProspecto("")
            setGradoAcademico("")
            setProgramaAcademico("")
          }
          onUploadComplete?.()

          // Redirigir a la página principal con la matrícula en la URL
          window.location.href = `/?ownerRef=${ownerRef}`
        }, 1500)
      } else if (response.total_uploaded > 0) {
        toast({
          title: "Carga parcial",
          description: `${response.total_uploaded} exitosos, ${response.total_failed} fallidos`,
          variant: "default",
        })
      } else {
        toast({
          title: "Error en carga",
          description: "No se pudo subir ningún archivo",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir archivos",
        variant: "destructive",
      })

      // Marcar todos como error
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          errorMessage: "Error de conexión",
        }))
      )
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status: FileWithType["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="h-5 w-5 text-gray-400" />
      case "uploading":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const successCount = files.filter((f) => f.status === "success").length
  const errorCount = files.filter((f) => f.status === "error").length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Subir Varios
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-[85vw] !max-w-[1400px] sm:!max-w-[85vw] max-h-[92vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === "new" ? "Crear Nuevo Prospecto" : "Subir Múltiples Documentos"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === "new"
              ? "Ingresa los datos del prospecto y sube todos sus documentos (máximo 17 archivos)"
              : "Sube hasta 17 archivos simultáneamente. Formatos: PDF, JPG, PNG"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Campos para modo nuevo prospecto */}
          {mode === "new" && (
            <div className="space-y-6 p-6 border-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-300 dark:border-gray-700">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Información del Prospecto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matrícula/Folio */}
                <div className="space-y-2">
                  <Label htmlFor="owner-ref-input" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Matrícula / Folio *
                  </Label>
                  <Input
                    id="owner-ref-input"
                    placeholder="Ej: 250001"
                    value={ownerRef}
                    onChange={(e) => setOwnerRef(e.target.value)}
                    disabled={isUploading}
                    className="font-medium h-11 text-base"
                  />
                </div>

                {/* Nombre Completo */}
                <div className="space-y-2">
                  <Label htmlFor="nombre-prospecto" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Nombre Completo *
                  </Label>
                  <Input
                    id="nombre-prospecto"
                    placeholder="Ej: ING. LEONIDAS DE MONTOYA"
                    value={nombreProspecto}
                    onChange={(e) => setNombreProspecto(e.target.value)}
                    disabled={isUploading}
                    className="font-medium h-11 text-base"
                  />Subida Inicial
                </div>

                {/* Grado Académico */}
                <div className="space-y-2">
                  <Label htmlFor="grado-academico" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Grado Académico *
                  </Label>
                  <Select
                    value={gradoAcademico}
                    onValueChange={setGradoAcademico}
                    disabled={isUploading}
                  >
                    <SelectTrigger id="grado-academico" className="h-11 text-base">
                      <SelectValue placeholder="Selecciona grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                      <SelectItem value="Maestria">Maestría</SelectItem>
                      <SelectItem value="Doctorado">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Programa Académico */}
                <div className="space-y-2">
                  <Label htmlFor="programa-academico" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Programa Académico *
                  </Label>
                  <Input
                    id="programa-academico"
                    placeholder="Ej: SISTEMAS, DERECHO, CONTADURIA"
                    value={programaAcademico}
                    onChange={(e) => setProgramaAcademico(e.target.value)}
                    disabled={isUploading}
                    className="font-medium h-11 text-base"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Botón de selección */}
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              id="bulk-file-input"
              disabled={isUploading}
            />
            <Label htmlFor="bulk-file-input">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 hover:shadow-md transition-all duration-200">
                <Upload className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <p className="text-base font-semibold text-gray-900">
                  Click para seleccionar archivos
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {files.length}/17 archivos seleccionados
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: PDF, JPG, PNG
                </p>
              </div>
            </Label>
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-300 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  <Label className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Archivos seleccionados ({files.length})
                  </Label>
                </div>
                {(successCount > 0 || errorCount > 0) && (
                  <div className="flex gap-3 text-sm font-semibold">
                    {successCount > 0 && (
                      <span className="text-green-600">✓ {successCount} exitosos</span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-red-600">✗ {errorCount} fallidos</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto border-2 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Icono de estado */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>

                    {/* Número */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {index + 1}
                      </span>
                    </div>

                    {/* Nombre del archivo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate" title={item.file.name}>{item.file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </p>
                      {item.status === "error" && item.errorMessage && (
                        <p className="text-sm text-red-600 font-semibold mt-2 break-words">{item.errorMessage}</p>
                      )}
                    </div>

                    {/* Selector de tipo */}
                    <Select
                      value={item.docType}
                      onValueChange={(value) => updateFileType(item.id, value as DocumentTypeCode)}
                      disabled={isUploading || item.status !== "pending"}
                    >
                      <SelectTrigger className="w-[200px] h-11 text-base font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.code} value={type.code}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Botón eliminar */}
                    {item.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(item.id)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Botones de acción - fuera del scroll */}
        <div className="flex justify-end gap-3 pt-6 border-t-2 mt-6">
          <Button
            variant="outline"
            size="lg"
            className="text-base font-semibold px-8"
            onClick={() => {
              setOpen(false)
              setFiles([])
              if (mode === "new") {
                setOwnerRef("")
                setNombreProspecto("")
                setGradoAcademico("")
                setProgramaAcademico("")
              }
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            size="lg"
            className="text-base font-semibold px-8"
            onClick={handleUpload}
            disabled={
              files.length === 0 ||
              isUploading ||
              (mode === "new" && (!ownerRef.trim() || !nombreProspecto.trim() || !gradoAcademico || !programaAcademico.trim()))
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Subir {files.length} {files.length === 1 ? "archivo" : "archivos"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
