"use client"

import { useState, useEffect, useCallback } from "react"
import type { FileItem, SortField, SortOrder, BucketStructure } from "@/types/files"
import { useApiClient } from "@/hooks/use-api-client"
import { FileRow } from "./file-row"
import { FolderRow } from "./folder-row"
import { MultiSelectToolbar } from "./multi-select-toolbar"
import { ConfirmModal } from "./confirm-modal"
import { FilePreview } from "./file-preview"
import { UploadDialog } from "./upload-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search, AlertCircle, Home, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFileTypeCategory } from "@/utils/file-types"
import Link from "next/link"


interface FileListProps {
  bucketName: string
  subfolder?: string
}

function findSubfolder(structure: BucketStructure, path: string): BucketStructure | null {
  for (const item of structure) {
    if (item.path === path && item.type === "folder") {
      return item.children
    }
    if (item.type === "folder" && path.startsWith(item.path)) {
      const result = findSubfolder(item.children, path)
      if (result) return result
    }
  }
  return null
}

export function FileList({ bucketName, subfolder }: FileListProps) {
  const apiClient = useApiClient()
  const { toast } = useToast()

  const [items, setItems] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Filtros y ordenamiento
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("modified")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const bucket = await apiClient.getBucket(bucketName)
      if (!bucket) {
        throw new Error("Bucket not found")
      }

      let currentItems: BucketStructure = bucket.structure
      if (subfolder) {
        const foundSubfolder = findSubfolder(bucket.structure, subfolder)
        if (foundSubfolder) {
          currentItems = foundSubfolder
        } else {
          // Si no se encuentra la subcarpeta, establecer items como vacío
          currentItems = []
        }
      }

      const mappedItems: FileItem[] = currentItems.map((item) => ({
        type: item.type,
        filename: item.name,
        path: item.path,
        size: item.type === "file" ? item.size : undefined,
        modified: item.type === "file" ? item.modified : undefined,
        mime_type: item.type === "file" ? "application/octet-stream" : undefined, // Placeholder
      }))
      setItems(mappedItems)
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
    loadItems()
    setSelectedFiles(new Set())
  }, [loadItems])

  const filteredAndSortedItems = items
    .filter((item) => {
      const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (item.type === "folder") return true // Siempre mostrar carpetas si coinciden con la búsqueda

      if (filterType === "all") return true
      const category = getFileTypeCategory(item.mime_type, item.filename)
      return category === filterType
    })
    .sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1
      if (a.type === "file" && b.type === "folder") return 1

      if (a.type === "folder" && b.type === "folder") {
        return a.filename.localeCompare(b.filename)
      }

      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === "filename") {
        aValue = aValue?.toLowerCase() || ""
        bValue = bValue?.toLowerCase() || ""
      }

      if (sortField === "size" || sortField === "modified") {
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
      const allFiles = filteredAndSortedItems.filter((i) => i.type === "file").map((f) => f.path || f.filename)
      setSelectedFiles(new Set(allFiles))
    } else {
      setSelectedFiles(new Set())
    }
  }

  const handleSelectFile = (path: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles)
    if (checked) {
      newSelected.add(path)
    } else {
      newSelected.delete(path)
    }
    setSelectedFiles(newSelected)
  }

  const handleDownload = async (path: string) => {
    try {
      const blob = await apiClient.downloadFile(bucketName, path)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = path.split("/").pop() || path
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: "Éxito", description: `Archivo "${path}" descargado` })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo descargar el archivo", variant: "destructive" })
    }
  }

  const handleDeleteSelected = async () => {
    try {
      await apiClient.deleteFiles(bucketName, Array.from(selectedFiles))
      toast({ title: "Éxito", description: `${selectedFiles.size} archivo(s) eliminado(s)` })
      setSelectedFiles(new Set())
      await loadItems()
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron eliminar los archivos", variant: "destructive" })
    } finally {
      setDeleteModalOpen(false)
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
          <p className="text-sm mb-4">El bucket &quot;{bucketName}&quot; no existe o no tienes permisos para acceder a él.</p>
          <Link href="/"><Button variant="outline" size="sm"><Home className="mr-2 h-4 w-4" />Volver al inicio</Button></Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar archivos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="image">Imágenes (JPEG)</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleSort("filename")} className="gap-2">Nombre <ArrowUpDown className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("size")} className="gap-2">Tamaño <ArrowUpDown className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => toggleSort("modified")} className="gap-2">Fecha <ArrowUpDown className="h-4 w-4" /></Button>
          <Button onClick={() => setUploadDialogOpen(true)} size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Subir
          </Button>
        </div>
      </div>
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><p>No se encontraron archivos o carpetas</p></div>
      ) : (
        <div className="space-y-1">
          {filteredAndSortedItems.map((item) =>
            item.type === "folder" ? (
              <FolderRow key={item.path} item={item} bucketName={bucketName} />
            ) : (
              <FileRow
                key={item.path}
                file={item}
                bucketName={bucketName}
                selected={selectedFiles.has(item.path!)}
                onSelect={(checked) => handleSelectFile(item.path!, checked)}
                onPreview={() => { setPreviewFile(item); setPreviewOpen(true); }}
                onDownload={() => handleDownload(item.path!)}
                onDelete={() => { setSelectedFiles(new Set([item.path!])); setDeleteModalOpen(true); }}
              />
            ),
          )}
        </div>
      )}
      <MultiSelectToolbar selectedCount={selectedFiles.size} onDelete={() => setDeleteModalOpen(true)} onClear={() => setSelectedFiles(new Set())} />
      <ConfirmModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={handleDeleteSelected} title="Eliminar archivos" description={`¿Estás seguro de que quieres eliminar ${selectedFiles.size} archivo(s)? Esta acción no se puede deshacer.`} confirmText="Eliminar" />
      <FilePreview file={previewFile} bucketName={bucketName} open={previewOpen} onOpenChange={setPreviewOpen} />
      <UploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
        bucketName={bucketName}
        subfolder={subfolder}
        onSuccess={loadItems}
      />
    </div>
  )
}
