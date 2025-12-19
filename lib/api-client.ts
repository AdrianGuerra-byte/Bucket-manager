import type { Document, DocumentUploadRequest, DocumentListResponse } from "@/types/files"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiClient {
  private baseUrl: string
  private getToken: () => Promise<string>

  constructor(baseUrl: string, getToken: () => Promise<string>) {
    this.baseUrl = baseUrl
    this.getToken = getToken
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}, retries = 0): Promise<Response> {
    const token = await this.getToken()

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    })

    if (!response.ok && response.status >= 500 && retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY * Math.pow(2, retries))
      return this.fetchWithAuth(url, options, retries + 1)
    }

    return response
  }

  // ========================================
  // DOCUMENT API METHODS
  // ========================================

  /**
   * List all documents for a specific owner (student)
   * GET /documents/filter/{owner_ref}?doc_types=TYPE1&doc_types=TYPE2...
   */
  async listDocuments(ownerRef: number | string, docTypes?: string[]): Promise<DocumentListResponse> {
    // Construir query params si hay filtros
    const params = new URLSearchParams()
    if (docTypes && docTypes.length > 0) {
      docTypes.forEach(type => params.append("doc_types", type))
    }

    const queryString = params.toString()
    const url = `/documents/filter/${ownerRef}${queryString ? `?${queryString}` : ''}`
    console.log(`[ApiClient] Solicitando: ${this.baseUrl}${url}`)

    const response = await this.fetchWithAuth(url)
    console.log(`[ApiClient] Respuesta recibida: status ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[ApiClient] 404 - No hay documentos para owner_ref: ${ownerRef}`)
        // No hay documentos para este alumno, retornar respuesta vacía
        return { owner_ref: Number(ownerRef), total_documents: 0, documents: [] }
      }
      if (response.status === 403) {
        throw new Error("No tienes permisos para ver estos documentos")
      }
      const error = await response.json().catch(() => ({ detail: "Error al listar documentos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    const data = await response.json()
    console.log(`[ApiClient] Datos parseados:`, data)

    // Debug: Verificar campos de los documentos
    const docs = Array.isArray(data) ? data : (Array.isArray(data.documents) ? data.documents : [])
    if (docs.length > 0) {
      console.log(`[ApiClient] Primer documento tiene estos campos:`, Object.keys(docs[0]))
      console.log(`[ApiClient] type_code del primer doc:`, docs[0].type_code)
      console.log(`[ApiClient] doc_type del primer doc:`, docs[0].doc_type)

      const docsWithoutSize = docs.filter((d: any) => !d.size_bytes || d.size_bytes === 0)
      if (docsWithoutSize.length > 0) {
        console.warn(`⚠️ El backend no envió size_bytes para ${docsWithoutSize.length} documento(s):`,
          docsWithoutSize.map((d: any) => d.file_name))
      }

      const docsWithoutTypeCode = docs.filter((d: any) => !d.type_code)
      if (docsWithoutTypeCode.length > 0) {
        console.warn(`⚠️ El backend no envió type_code para ${docsWithoutTypeCode.length} documento(s)`)
        console.warn(`📋 Campos disponibles:`, Object.keys(docsWithoutTypeCode[0]))
      }
    }    // El backend retorna { owner_ref, total_documents, documents: [...] }
    // Retornamos solo el array de documents para compatibilidad
    let documents: any[]
    if (Array.isArray(data)) {
      documents = data
    } else {
      documents = Array.isArray(data.documents) ? data.documents : []
    }

    // Mapear campos si el backend usa nombres diferentes
    // Si backend usa "doc_type" en vez de "type_code", hacer el mapping
    documents = documents.map((doc: any) => ({
      ...doc,
      type_code: doc.type_code || doc.doc_type, // Fallback a doc_type si type_code no existe
    }))

    return documents
  }

  /**
   * Upload a document with metadata
   * POST /documents/upload
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<any> {
    const formData = new FormData()

    // Log detallado de lo que se va a enviar
    console.log("[ApiClient] uploadDocument request:", {
      fileName: request.file.name,
      fileSize: request.file.size,
      fileType: request.file.type,
      owner_ref: request.owner_ref,
      doc_type: request.doc_type,
      hasMetadata: !!request.metadata
    })

    // Validar doc_type antes de enviar
    if (!request.doc_type || request.doc_type === "undefined") {
      console.error("[ApiClient] ❌ doc_type inválido:", request.doc_type)
      throw new Error(`Código de documento inválido: "${request.doc_type}". Debe ser un código válido como INE_FRONT, ACTA_NAC, etc.`)
    }

    // Attach file
    formData.append("file", request.file)

    // Attach required fields
    formData.append("owner_ref", request.owner_ref.toString())
    formData.append("doc_type", request.doc_type)

    console.log("[ApiClient] FormData construido:")
    console.log("  - file:", request.file.name)
    console.log("  - owner_ref:", request.owner_ref.toString())
    console.log("  - doc_type:", request.doc_type)

    // Attach metadata (must be JSON stringified)
    if (request.metadata) {
      const metadataStr = JSON.stringify(request.metadata)
      formData.append("metadata", metadataStr)
      console.log("  - metadata:", metadataStr.substring(0, 200) + "...")
    }

    const token = await this.getToken()
    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        // Don't set Content-Type, browser will set it with boundary for multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 413) {
        throw new Error("El archivo pesa más de 2MB. Por favor comprímelo.")
      }
      if (response.status === 415) {
        throw new Error("Formato no válido. Solo aceptamos PDF o Imágenes (JPG/PNG).")
      }
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ detail: "Error de validación" }))
        throw new Error(error.detail || "Error de validación. Verifica los datos enviados.")
      }
      if (response.status === 403) {
        throw new Error("Tu sesión expiró o no tienes permiso.")
      }

      const error = await response.json().catch(() => ({ detail: "Error al subir documento" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  /**
   * Download a document by ID
   * GET /documents/{document_id}/download
   */
  async downloadDocument(documentId: string, fileName: string): Promise<void> {
    const response = await this.fetchWithAuth(`/documents/${documentId}/download`)

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Tu sesión expiró o no tienes permiso para ver este archivo.")
      }
      throw new Error("Error al descargar documento")
    }

    // Convert to blob and trigger download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  /**
   * Get document blob for preview
   * GET /documents/{document_id}/download
   */
  async getDocumentBlob(documentId: string): Promise<Blob> {
    const response = await this.fetchWithAuth(`/documents/${documentId}/download`)

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Tu sesión expiró o no tienes permiso para ver este archivo.")
      }
      throw new Error("Error al obtener documento")
    }

    return response.blob()
  }

  /**
   * Update document metadata with new file
   * PATCH /documents/{document_id}/metadata
   */
  async updateDocumentMetadata(
    documentId: string,
    file: File,
    metadata: any
  ): Promise<any> {
    const formData = new FormData()

    // Attach new file
    formData.append("file", file)

    // Attach metadata (must be JSON stringified)
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }

    console.log(`[ApiClient] PATCH /documents/${documentId}/metadata`)
    console.log("  File:", file.name)
    console.log("  Metadata:", JSON.stringify(metadata, null, 2))

    const token = await this.getToken()
    const response = await fetch(`${this.baseUrl}/documents/${documentId}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        // Don't set Content-Type, browser will set it with boundary for multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Documento no encontrado")
      }
      if (response.status === 413) {
        throw new Error("El archivo pesa más de 2MB. Por favor comprímelo.")
      }
      if (response.status === 415) {
        throw new Error("Formato no válido. Solo aceptamos PDF o Imágenes (JPG/PNG).")
      }
      if (response.status === 403) {
        throw new Error("Tu sesión expiró o no tienes permiso.")
      }

      const error = await response.json().catch(() => ({ detail: "Error al actualizar documento" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    const result = await response.json()
    console.log("[ApiClient] Documento actualizado:", result)
    return result
  }

  /**
   * Delete a document
   * DELETE /documents/{document_id}
   */
  async deleteDocument(documentId: string): Promise<void> {
    const response = await this.fetchWithAuth(`/documents/${documentId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al eliminar documento" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }
  }

  /**
   * Upload multiple documents at once
   * POST /documents/upload-multiple
   */
  async uploadMultipleDocuments(formData: FormData): Promise<any> {
    const token = await this.getToken()

    console.log("=== API CLIENT: uploadMultipleDocuments ===")
    console.log("URL:", `${this.baseUrl}/documents/upload-multiple`)
    console.log("Token:", token ? "Present" : "Missing")

    const response = await fetch(`${this.baseUrl}/documents/upload-multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    })

    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error("Los archivos exceden el límite de tamaño permitido")
      }
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ detail: "Error de validación" }))
        console.error("400 Error details:", error)
        throw new Error(error.detail || "Verifica los archivos seleccionados")
      }
      if (response.status === 403) {
        throw new Error("Tu sesión expiró o no tienes permiso")
      }

      const error = await response.json().catch(() => ({ detail: "Error al subir documentos" }))
      console.error("Error details:", error)
      throw new Error(error.detail || `Error ${response.status}`)
    }

    const data = await response.json()
    console.log("Response data:", data)
    return data
  }
}
