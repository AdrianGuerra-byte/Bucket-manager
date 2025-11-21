import type { FilesResponse, BucketsApiResponse, Bucket } from "@/types/files"

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

  async getMyPermissions(): Promise<any> {
    const response = await this.fetchWithAuth("/buckets/my-permissions")

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al obtener permisos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async listBuckets(): Promise<BucketsApiResponse> {
    const response = await this.fetchWithAuth("/buckets?include_files=true")

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al listar buckets" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async getBucket(bucketName: string): Promise<Bucket | undefined> {
    const response = await this.listBuckets()
    return response.buckets.find((bucket) => bucket.name === bucketName)
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

  async deleteFile(bucketName: string, path: string): Promise<void> {
    const parts = path.split("/")
    const filename = parts.pop()!
    const subfolder = parts.join("/")

    let url = `/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(filename)}`
    if (subfolder) {
      const params = new URLSearchParams({ subfolder })
      url += `?${params.toString()}`
    }
    
    const response = await this.fetchWithAuth(
      url,
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

  async downloadFile(bucketName: string, path: string): Promise<Blob> {
    const parts = path.split("/")
    const filename = parts.pop()!
    const subfolder = parts.join("/")
    
    let url = `/buckets/${encodeURIComponent(bucketName)}/files/${encodeURIComponent(filename)}/download`
    if (subfolder) {
      const params = new URLSearchParams({ subfolder })
      url += `?${params.toString()}`
    }
    
    const response = await this.fetchWithAuth(url)

    if (!response.ok) {
      throw new Error("Error al descargar archivo")
    }

    return response.blob()
  }

  async createBucket(bucketName: string): Promise<string> {
    const response = await this.fetchWithAuth(`/buckets/${encodeURIComponent(bucketName)}`, {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al crear bucket" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async uploadFile(bucketName: string, file: File, subfolder?: string): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    
    if (subfolder) {
      formData.append("subfolder", subfolder)
    }

    const token = await this.getToken()
    let url = `${this.baseUrl}/buckets/${encodeURIComponent(bucketName)}/upload`
    
    if (subfolder) {
      const params = new URLSearchParams({ subfolder })
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al subir archivo" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async uploadMultipleFiles(bucketName: string, files: File[], subfolder?: string): Promise<string> {
    if (files.length > 20) {
      throw new Error("Máximo 20 archivos por carga")
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    
    if (subfolder) {
      formData.append("subfolder", subfolder)
    }

    const token = await this.getToken()
    const response = await fetch(`${this.baseUrl}/buckets/${encodeURIComponent(bucketName)}/upload-multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al subir archivos" }))
      throw new Error(error.detail || `Error ${response.status}`)
    }

    return response.json()
  }
}
