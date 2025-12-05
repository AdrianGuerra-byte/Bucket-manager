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
    // El backend retorna { owner_ref, total_documents, documents: [...] }
    // Retornamos solo el array de documents para compatibilidad
    return data.documents || []
  }

  /**
   * Upload a document with metadata
   * POST /documents/upload
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<any> {
    const formData = new FormData()
    
    // Attach file
    formData.append("file", request.file)
    
    // Attach required fields
    formData.append("owner_ref", request.owner_ref.toString())
    formData.append("doc_type", request.doc_type)
    
    // Attach metadata (must be JSON stringified)
    if (request.metadata) {
      formData.append("metadata", JSON.stringify(request.metadata))
    }

    const token = await this.getToken()
    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
}
