"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FileItem } from "@/types/files"
import { useApiClient } from "@/hooks/use-api-client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface FilePreviewProps {
  file: FileItem | null
  bucketName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilePreview({ file, bucketName, open, onOpenChange }: FilePreviewProps) {
  const apiClient = useApiClient()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!file || !open) {
      setPreviewUrl(null)
      return
    }

    const loadPreview = async () => {
      setLoading(true)
      try {
        const blob = await apiClient.downloadFile(bucketName, file.filename)
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch (error) {
        console.error("[v0] Error loading preview:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPreview()

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [file, bucketName, open])

  if (!file) return null

  const isPdf = file.mime_type === "application/pdf" || file.filename.endsWith(".pdf")
  const isImage = file.mime_type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.filename)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-balance">{file.filename}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center min-h-[400px] bg-muted/30 rounded-lg">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : previewUrl ? (
            <>
              {isImage && (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt={file.filename}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
              {isPdf && <iframe src={previewUrl} className="w-full h-[70vh]" title={file.filename} />}
            </>
          ) : (
            <p className="text-muted-foreground">No se pudo cargar la vista previa</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
