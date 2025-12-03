// Document API Types
export interface HistorialCambio {
  fecha_corte: string
  datos_anteriores: Record<string, any>
  version_asociada: number
}

// Nueva estructura de metadata para portal_inscripciones
export interface ValidacionHistorial {
  timestamp: string
  revisor: string
  estado: "aceptado" | "rechazado" | "pendiente"
  comentarios: string
  detalles_rechazo?: {
    motivo: string
    [key: string]: any
  }
}

export interface Validacion {
  estado_actual: "aceptado" | "rechazado" | "pendiente"
  ultima_actualizacion: string
  historial: ValidacionHistorial[]
}

export interface Propietario {
  id: number
  tipo_entidad: "prospecto" | "alumno"
  folio: string
  nombre_completo: string
  programa_academico?: string
  grado_academico?: string
  email?: string
  telefono?: string
}

export interface MetadataInscripciones {
  sistema_origen: string
  propietario: Propietario
  validacion: Validacion
}

export interface DocumentMetadata {
  // Legacy fields
  status?: "VALIDADO" | "PENDIENTE" | "RECHAZADO"
  ciclo?: string
  origen?: string
  comentario?: string
  historial_cambios?: HistorialCambio[]
  // Nueva estructura de inscripciones
  sistema_origen?: string
  propietario?: Propietario
  validacion?: Validacion
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
