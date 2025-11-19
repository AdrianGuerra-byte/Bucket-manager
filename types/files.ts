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

export interface BucketFile {
  name: string
  type: "file"
  path: string
  size: number
  modified: string
}

export interface BucketFolder {
  name: string
  type: "folder"
  path: string
  children: (BucketFile | BucketFolder)[]
}

export type BucketStructure = (BucketFile | BucketFolder)[]

export interface Bucket {
  name: string
  path: string
  total_files: number
  total_size_bytes: number
  total_size_mb: number
  structure: BucketStructure
  created: string
}

export interface BucketsApiResponse {
  total_buckets: number
  buckets: Bucket[]
  storage_path: string
  include_files: boolean
}

export type SortField = "filename" | "size" | "modified" | "created_at"
export type SortOrder = "asc" | "desc"
