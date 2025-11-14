"use client"

import { useState, useEffect, useCallback } from "react"
import type { FileItem, SortField, SortOrder } from "@/types/files"
import { useApiClient } from "@/hooks/use-api-client"
import { FileRow } from "./file-row"
import { MultiSelectToolbar } from "./multi-select-toolbar"
import { ConfirmModal } from "./confirm-modal"
import { FilePreview } from "./file-preview"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search, AlertCircle, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFileTypeCategory } from "@/utils/file-types"
import Link from "next/link"

interface FileListProps {
  bucketName: string
  subfolder?: string
}

export function FileList({ bucketName, subfolder }: FileListProps) {
  const apiClient = useApiClient()
  const { toast } = useToast()

  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Filtros y ordenamiento
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("modified")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.listFiles(bucketName, subfolder)
      console.log("[FileList] Received data:", data)
      
      // El backend devuelve { bucket, subfolder, files: [...], total_files, listed_by, listed_at }
      if (data && data.files && Array.isArray(data.files)) {
        setFiles(data.files)
      } else {
        console.error("[FileList] Invalid data format:", data)
        setFiles([])
      }
    } catch (error) {
      console.error("[v0] Error loading files:", error)
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los archivos"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiClient, bucketName, subfolder, toast])

  useEffect(() => {
    loadFiles()
    setSelectedFiles(new Set())
  }, [loadFiles])

  const filteredAndSortedFiles = files
    .filter((file) => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterType === "all") return true

      const category = getFileTypeCategory(file.mime_type, file.filename)
      return category === filterType
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "filename") {
        aValue = aValue?.toLowerCase() || ""
        bValue = bValue?.toLowerCase() || ""
      }

      if (sortField === "size" || sortField === "modified" || sortField === "created_at") {
        aValue = aValue || 0
        bValue = bValue || 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(filteredAndSortedFiles.map((f) => f.filename)))
    } else {
      setSelectedFiles(new Set())
    }
  }

  const handleSelectFile = (filename: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles)
    if (checked) {
      newSelected.add(filename)
    } else {
      newSelected.delete(filename)
    }
    setSelectedFiles(newSelected)
  }

  const handleDownload = async (filename: string) => {
    try {
      console.log("[FileList] Downloading file:", filename)
      const blob = await apiClient.downloadFile(bucketName, filename)
      
      // Crea el enlace de descarga y lo activa
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      // limpieza
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Éxito",
        description: `Archivo "${filename}" descargado`,
      })
    } catch (error) {
      console.error("[FileList] Download error:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSelected = async () => {
    try {
      await apiClient.deleteFiles(bucketName, Array.from(selectedFiles))
      toast({
        title: "Éxito",
        description: `${selectedFiles.size} archivo(s) eliminado(s)`,
      })
      setSelectedFiles(new Set())
      await loadFiles()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los archivos",
        variant: "destructive",
      })
    } finally {
      setDeleteModalOpen(false)
    }
  }

  const handleDeleteFile = async (filename: string) => {
    try {
      await apiClient.deleteFile(bucketName, filename)
      toast({
        title: "Éxito",
        description: "Archivo eliminado",
      })
      await loadFiles()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar el bucket</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          <p className="text-sm mb-4">
            El bucket &quot;{bucketName}&quot; no existe o no tienes permisos para acceder a él.
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar archivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="image">Imágenes (JPEG)</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleSort("filename")} className="gap-2">
            Nombre
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("size")} className="gap-2">
            Tamaño
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("modified")} className="gap-2">
            Fecha
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de archivos */}
      {filteredAndSortedFiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron archivos</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredAndSortedFiles.map((file) => (
            <FileRow
              key={file.filename}
              file={file}
              bucketName={bucketName}
              selected={selectedFiles.has(file.filename)}
              onSelect={(checked) => handleSelectFile(file.filename, checked)}
              onPreview={() => {
                setPreviewFile(file)
                setPreviewOpen(true)
              }}
              onDownload={() => handleDownload(file.filename)}
              onDelete={() => {
                setSelectedFiles(new Set([file.filename]))
                setDeleteModalOpen(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Barra de herramientas de selección múltiple */}
      <MultiSelectToolbar
        selectedCount={selectedFiles.size}
        onDelete={() => setDeleteModalOpen(true)}
        onClear={() => setSelectedFiles(new Set())}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteSelected}
        title="Eliminar archivos"
        description={`¿Estás seguro de que quieres eliminar ${selectedFiles.size} archivo(s)? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />

      {/* Preview WIP */}
      <FilePreview file={previewFile} bucketName={bucketName} open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  )
}
