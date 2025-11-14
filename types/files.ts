export interface FileItem {
  filename: string
  path?: string
  size?: number
  mime_type?: string
  modified?: string
  created_at?: string
  updated_at?: string
}

export interface FilesResponse {
  bucket: string
  subfolder: string | null
  files: FileItem[]
  total_files: number
  listed_by: string
  listed_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  permissions?: string[]
}

export interface Bucket {
  name: string
  file_count?: number
}

export type SortField = "filename" | "size" | "modified" | "created_at"
export type SortOrder = "asc" | "desc"
