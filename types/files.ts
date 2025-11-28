// Document API Types
export interface HistorialCambio {
  fecha_corte: string
  datos_anteriores: Record<string, any>
  version_asociada: number
}

export interface DocumentMetadata {
  status?: "VALIDADO" | "PENDIENTE" | "RECHAZADO"
  ciclo?: string
  origen?: string
  comentario?: string
  historial_cambios?: HistorialCambio[]
  [key: string]: any
}

export interface Document {
  document_id: string
  type_code: string
  type_name: string
  file_name: string
  upload_date: string
  size_bytes: number
  metadata: DocumentMetadata
  download_url: string
}

export interface DocumentUploadRequest {
  file: File
  owner_ref: number | string
  doc_type: string
  metadata?: DocumentMetadata
}

export interface DocumentListResponse extends Array<Document> {}

// Auth Types
export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  permissions?: string[]
}

// Legacy types (for backward compatibility)
export interface FileItem {
  type: "file" | "folder"
  filename: string
  path?: string
  size?: number
  mime_type?: string
  modified?: string
  created_at?: string
  updated_at?: string
}

export type SortField = "filename" | "size" | "modified" | "created_at" | "upload_date"
export type SortOrder = "asc" | "desc"
