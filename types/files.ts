// Document API Types
export interface HistorialCambio {
  fecha_corte: string
  datos_anteriores: Record<string, any>
  version_asociada: number
}

// ===================================================
// NUEVA ESTRUCTURA GENÉRICA v3.0 - ÚNICA OFICIAL
// ===================================================

export interface DatosGenerales {
  id_interno: number
  folio: string
  nombre_completo: string
  programa_academico: string
  grado_academico: string
}

export interface HistorialValidacion {
  timestamp: string
  revisor: string
  estado: "VALIDADO" | "RECHAZADO" | "PENDIENTE" | "EN_REVISION"
  comentarios?: string
}

export interface Validacion {
  estado_actual: "VALIDADO" | "RECHAZADO" | "PENDIENTE" | "EN_REVISION"
  historial: HistorialValidacion[]
}

export interface DocumentMetadata {
  sistema_origen: string
  datos_generales: DatosGenerales
  validacion: Validacion
  [key: string]: any // Para campos extra opcionales
}

// ===================================================
// LEGACY - Solo para compatibilidad con docs antiguos
// ===================================================

export interface ArchivoMetadata {
  nombre: string
  estado_actual: string
  historial: Array<{
    fecha: string
    accion: string
    usuario: string
    notas?: string
  }>
}

export interface EntidadDatos {
  folio: string
  name: string
  gradoAcademico: string
  programaAcademico: string
}

export interface Entidad {
  tipo: "prospecto" | "alumno"
  id: number
  datos: EntidadDatos
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

// Bulk Upload Types
export interface BulkUploadResult {
  file_name: string
  doc_type: string
  status: "success" | "error"
  document_id?: string
  version_id?: string
  file_size_bytes?: number
  error?: string
  message?: string
}

export interface BulkUploadResponse {
  message: string
  owner_ref: number
  total_uploaded: number
  total_failed: number
  results: BulkUploadResult[]
  errors: any[]
}

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

// Document types catalog
export const DOCUMENT_TYPES = [
  { code: "INE_FRONT", name: "INE (Frente)", description: "Identificación oficial frontal" },
  { code: "INE_BACK", name: "INE (Reverso)", description: "Identificación oficial reverso" },
  { code: "ACTA_NAC", name: "Acta de Nacimiento", description: "Copia certificada" },
  { code: "CURP", name: "CURP", description: "Formato actualizado" },
  { code: "KARDEX", name: "Kárdex / Certificado", description: "Documento académico previo" },
  { code: "COMP_DOM", name: "Comprobante Domicilio", description: "Vigencia menor a 3 meses" },
] as const

export type DocumentTypeCode = typeof DOCUMENT_TYPES[number]["code"]

/**
 * Mapea el nombre del tipo de documento (type_name) a su código (type_code)
 * Útil cuando el backend no devuelve type_code pero sí type_name
 * Soporta coincidencias exactas, por código, o coincidencias parciales
 */
export function getDocumentTypeCode(typeName: string): DocumentTypeCode | null {
  if (!typeName) return null

  const normalizedInput = typeName.toLowerCase().trim()

  // Intento 1: Coincidencia exacta con el nombre
  let docType = DOCUMENT_TYPES.find(
    dt => dt.name.toLowerCase() === normalizedInput
  )

  if (docType) return docType.code

  // Intento 2: Coincidencia exacta con el código
  docType = DOCUMENT_TYPES.find(
    dt => dt.code === typeName
  )

  if (docType) return docType.code

  // Intento 3: Coincidencia parcial (type_name contiene o está contenido en name)
  docType = DOCUMENT_TYPES.find(dt => {
    const normalizedName = dt.name.toLowerCase()
    return normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName)
  })

  return docType ? docType.code : null
}
