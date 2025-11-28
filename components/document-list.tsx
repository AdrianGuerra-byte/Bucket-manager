"use client"

import { useState, useEffect, useCallback } from "react"
import type { Document, SortField, SortOrder } from "@/types/files"
import { useApiClient } from "@/hooks/use-api-client"
import { DocumentCard } from "./document-card"
import { UploadDialog } from "./upload-dialog"
import { ConfirmModal } from "./confirm-modal"
import { DocumentHistoryDialog } from "./document-history-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Search, Upload, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DocumentListProps {
  ownerRef: number | string
}

export function DocumentList({ ownerRef }: DocumentListProps) {
  const apiClient = useApiClient()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historyDocument, setHistoryDocument] = useState<Document | null>(null)

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("upload_date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const loadDocuments = useCallback(async () => {
    console.log(`[DocumentList] Cargando documentos para owner_ref: ${ownerRef}`)
    setLoading(true)
    setError(null)
    try {
      const docs = await apiClient.listDocuments(ownerRef)
      console.log(`[DocumentList] Documentos recibidos:`, docs)
      setDocuments(docs)
      
      if (docs.length === 0) {
        console.log(`[DocumentList] No hay documentos para owner_ref: ${ownerRef}`)
        toast({
          title: "Sin documentos",
          description: "Este alumno no tiene documentos registrados aún",
          variant: "default",
        })
      } else {
        console.log(`[DocumentList] Se encontraron ${docs.length} documento(s)`)
      }
    } catch (error) {
      console.error(`[DocumentList] Error al cargar documentos:`, error)
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los documentos"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiClient, ownerRef, toast])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      if (filterStatus === "all") return true
      return doc.metadata?.status === filterStatus
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "filename":
          aValue = a.file_name.toLowerCase()
          bValue = b.file_name.toLowerCase()
          break
        case "size":
          aValue = a.size_bytes
          bValue = b.size_bytes
          break
        case "upload_date":
          aValue = new Date(a.upload_date).getTime()
          bValue = new Date(b.upload_date).getTime()
          break
        default:
          aValue = a.upload_date
          bValue = b.upload_date
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

  const handleDownload = async (doc: Document) => {
    try {
      await apiClient.downloadDocument(doc.document_id, doc.file_name)
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${doc.file_name}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo descargar el documento",
        variant: "destructive",
      })
    }
  }

  const handlePreview = async (doc: Document) => {
    try {
      const blob = await apiClient.getDocumentBlob(doc.document_id)
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo previsualizar el documento",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc)
    setDeleteModalOpen(true)
  }

  const handleViewHistory = (doc: Document) => {
    setHistoryDocument(doc)
    setHistoryDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return

    try {
      await apiClient.deleteDocument(documentToDelete.document_id)
      toast({
        title: "Documento eliminado",
        description: `${documentToDelete.file_name} fue eliminado`,
      })
      await loadDocuments()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el documento",
        variant: "destructive",
      })
    } finally {
      setDeleteModalOpen(false)
      setDocumentToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar documentos</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={loadDocuments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="VALIDADO">Validados</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="RECHAZADO">Rechazados</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("filename")}
            className="gap-2"
          >
            Nombre <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("upload_date")}
            className="gap-2"
          >
            Fecha <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("size")}
            className="gap-2"
          >
            Tamaño <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={() => setUploadDialogOpen(true)} size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Subir Documento
        </Button>
      </div>

      {/* Document Grid */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se encontraron documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onDelete={handleDeleteClick}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        ownerRef={ownerRef}
        onSuccess={loadDocuments}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar documento"
        description={`¿Estás seguro de que quieres eliminar "${documentToDelete?.file_name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />

      <DocumentHistoryDialog
        document={historyDocument}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  )
}
