/**
 * Metadata Helpers para Sistema de Gestión Documental
 *
 * Nueva estructura genérica v3.0 según backend
 *
 * @version 3.0
 * @author Centro Universitario Hidalguense
 */

// ============================================
// TIPOS Y CONSTANTES
// ============================================

export const SISTEMAS = {
  INSCRIPCIONES: "portal_inscripciones",
  NEXUS: "nexus_academico",
} as const

export const ESTADOS_VALIDACION = {
  PENDIENTE: "PENDIENTE",
  VALIDADO: "VALIDADO",
  RECHAZADO: "RECHAZADO",
  EN_REVISION: "EN_REVISION",
} as const

export const GRADOS_ACADEMICOS = {
  LICENCIATURA: "Licenciatura",
  MAESTRIA: "Maestria",
  DOCTORADO: "Doctorado",
} as const

export type Sistema = typeof SISTEMAS[keyof typeof SISTEMAS]
export type EstadoValidacion = typeof ESTADOS_VALIDACION[keyof typeof ESTADOS_VALIDACION]
export type GradoAcademico = typeof GRADOS_ACADEMICOS[keyof typeof GRADOS_ACADEMICOS]

// ============================================
// INTERFACES PARA NUEVA ESTRUCTURA
// ============================================

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
  estado: EstadoValidacion
  comentarios?: string
}

export interface Validacion {
  estado_actual: EstadoValidacion
  historial: HistorialValidacion[]
}

export interface DocumentMetadata {
  sistema_origen: string
  datos_generales: DatosGenerales
  validacion: Validacion
}

// ============================================
// FUNCIONES BUILDER
// ============================================

export interface BuildMetadataParams {
  sistema_origen?: string
  id_interno: number
  folio: string
  nombre_completo: string
  programa_academico: string
  grado_academico: string
  estado_inicial?: EstadoValidacion
  comentario?: string // Comentario que el backend agregará al historial
}

/**
 * Construye metadata para subida individual de documento
 *
 * Según especificación del backend:
 * - Se envía con validacion.historial = [] (vacío)
 * - El backend hace el merge automáticamente al actualizar
 *
 * @param params Datos del prospecto/alumno
 * @returns Metadata completo listo para enviar al backend
 */
export function buildDocumentMetadata(params: BuildMetadataParams): DocumentMetadata {
  const {
    sistema_origen = SISTEMAS.INSCRIPCIONES,
    id_interno,
    folio,
    nombre_completo,
    programa_academico,
    grado_academico,
    estado_inicial = ESTADOS_VALIDACION.PENDIENTE,
    comentario,
  } = params

  console.log("🔨 Construyendo metadata para documento individual")
  console.log("  Sistema:", sistema_origen)
  console.log("  ID Interno:", id_interno)
  console.log("  Folio:", folio)
  console.log("  Nombre:", nombre_completo)
  console.log("  Estado inicial:", estado_inicial)
  if (comentario) {
    console.log("  💬 Comentario:", comentario)
    console.log("  ➡️ Se incluye como evento en validacion.historial")
    console.log("  ✅ Backend hará MERGE con historial existente")
  } else {
    console.log("  ⚠️ Sin comentario - historial: [] (vacío)")
  }

  // Construir en orden específico para mantener estructura legible
  const metadata: any = {}

  // 1. Sistema origen
  metadata.sistema_origen = sistema_origen

  // 2. Datos generales (en orden específico)
  metadata.datos_generales = {
    id_interno,
    folio,
    nombre_completo,
    programa_academico,
    grado_academico,
  }

  // 3. Validación con historial
  // Si hay comentario, agregarlo como evento en el historial
  // El backend hará MERGE con los eventos existentes
  const historial: HistorialValidacion[] = []

  if (comentario && comentario.trim()) {
    historial.push({
      timestamp: new Date().toISOString(),
      revisor: nombre_completo,
      estado: estado_inicial,
      comentarios: comentario.trim(),
    })
  }

  metadata.validacion = {
    estado_actual: estado_inicial,
    historial, // Array con evento nuevo o vacío []
  }

  return metadata as DocumentMetadata
}

/**
 * Construye metadata para carga masiva (bulk upload)
 *
 * Idéntica estructura que individual, pero preparada para lotes
 *
 * @param params Datos del prospecto/alumno
 * @returns Metadata completo para bulk upload
 */
export function buildBulkMetadata(params: BuildMetadataParams): DocumentMetadata {
  console.log("📦 Construyendo metadata para carga masiva")
  return buildDocumentMetadata(params)
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Valida que la metadata tenga la estructura correcta
 */
export function validateMetadata(metadata: any): metadata is DocumentMetadata {
  if (!metadata || typeof metadata !== "object") return false

  const hasSystemOrigin = typeof metadata.sistema_origen === "string"
  const hasDatosGenerales = metadata.datos_generales && typeof metadata.datos_generales === "object"
  const hasValidacion = metadata.validacion && typeof metadata.validacion === "object"

  if (!hasSystemOrigin || !hasDatosGenerales || !hasValidacion) return false

  const dg = metadata.datos_generales
  const hasRequiredFields =
    typeof dg.id_interno === "number" &&
    typeof dg.folio === "string" &&
    typeof dg.nombre_completo === "string" &&
    typeof dg.programa_academico === "string" &&
    typeof dg.grado_academico === "string"

  const val = metadata.validacion
  const hasValidacionFields =
    typeof val.estado_actual === "string" &&
    Array.isArray(val.historial)

  return hasRequiredFields && hasValidacionFields
}

/**
 * Obtiene el historial de validación de un documento
 */
export function getValidacionHistorial(metadata: any): HistorialValidacion[] {
  if (!metadata?.validacion?.historial) return []
  if (!Array.isArray(metadata.validacion.historial)) return []
  return metadata.validacion.historial
}

/**
 * Obtiene el estado actual de validación
 */
export function getEstadoActual(metadata: any): EstadoValidacion | null {
  if (!metadata?.validacion?.estado_actual) return null
  return metadata.validacion.estado_actual as EstadoValidacion
}

/**
 * Formatea el nombre completo de forma consistente
 */
export function formatNombreCompleto(nombre: string): string {
  return nombre.trim().toUpperCase()
}

/**
 * Genera un folio único basado en timestamp
 */
export function generateFolio(prefix: string = "250"): string {
  const timestamp = Date.now().toString().slice(-6)
  return `${prefix}${timestamp}`
}

/**
 * Obtiene un resumen legible de la metadata
 */
export function getMetadataSummary(metadata: DocumentMetadata): string {
  const { datos_generales, validacion } = metadata
  return `${datos_generales.folio} - ${datos_generales.nombre_completo} (${validacion.estado_actual})`
}

// ============================================
// EJEMPLO DE USO
// ============================================

/*
EJEMPLO PARA SUBIDA INDIVIDUAL:

const metadata = buildDocumentMetadata({
  id_interno: 42,
  folio: "250001",
  nombre_completo: "ING. LEONIDAS DE MONTOYA",
  programa_academico: "SISTEMAS",
  grado_academico: "Licenciatura",
})

// Enviar al endpoint:
POST /documents/upload
{
  file: [archivo],
  metadata: metadata  // <- con historial: []
}

// El backend automáticamente:
// 1. Si el documento existe, hace MERGE del historial
// 2. Si es nuevo, crea el historial inicial
// 3. Actualiza estado_actual según sea necesario
*/
