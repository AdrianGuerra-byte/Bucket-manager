import { FileText, Image, File, LucideIcon } from "lucide-react"

export function getFileIcon(mimeType?: string, filename?: string): LucideIcon {
  if (!mimeType && filename) {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return FileText
    if (["jpg", "jpeg"].includes(ext || "")) return Image
    return File
  }

  if (mimeType === "application/pdf") return FileText
  if (mimeType === "image/jpeg") return Image

  return File
}

export function isPreviewable(mimeType?: string, filename?: string): boolean {
  if (mimeType === "application/pdf") return true
  if (mimeType === "image/jpeg") return true

  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "pdf"].includes(ext || "")) {
      return true
    }
  }

  return false
}

export function getFileTypeCategory(mimeType?: string, filename?: string): string {
  if (!mimeType && filename) {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg"].includes(ext || "")) return "image"
    if (ext === "pdf") return "pdf"
    return "other"
  }

  if (mimeType === "image/jpeg") return "image"
  if (mimeType === "application/pdf") return "pdf"

  return "other"
}
