import type { FilesResponse } from "@/types/files"

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
    console.log("[API] Making request:", {
      url: `${this.baseUrl}${url}`,
      method: options.method || "GET",
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + "...",
    })

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("[API] Response received:", {
      url: `${this.baseUrl}${url}`,
      status: response.status,
      ok: response.ok,
    })

    // Retry on network errors or 5xx errors
    if (!response.ok && response.status >= 500 && retries < MAX_RETRIES) {
      await sleep(RETRY_DELAY * Math.pow(2, retries))
      return this.fetchWithAuth(url, options, retries + 1)
    }

    return response
  }

  async getMyPermissions(): Promise<any> {
    const response = await this.fetchWithAuth("/buckets/my-permissions")

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al obtener permisos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async listFiles(bucketName: string, subfolder?: string): Promise<FilesResponse> {
    const params = new URLSearchParams()
    if (subfolder) {
      params.append("subfolder", subfolder)
    }

    const url = `/buckets/${encodeURIComponent(bucketName)}/files${params.toString() ? `?${params.toString()}` : ""}`

    const response = await this.fetchWithAuth(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al listar archivos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async deleteFiles(bucketName: string, filenames: string[]): Promise<void> {
    const response = await this.fetchWithAuth(`/buckets/${encodeURIComponent(bucketName)}/files`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filenames),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al eliminar archivos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }
  }

  async deleteFile(bucketName: string, filename: string): Promise<void> {
    const response = await this.fetchWithAuth(
      `/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      },
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al eliminar archivo" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }
  }

  getDownloadUrl(bucketName: string, filename: string): string {
    return `${this.baseUrl}/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(filename)}/download`
  }

  async downloadFile(bucketName: string, filename: string): Promise<Blob> {
    const url = `/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(filename)}/download`
    console.log("[API] Downloading file:", { bucketName, filename, url: `${this.baseUrl}${url}` })
    
    const response = await this.fetchWithAuth(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API] Download failed:", { status: response.status, error: errorText })
      throw new Error("Error al descargar archivo")
    }

    return response.blob()
  }
}
