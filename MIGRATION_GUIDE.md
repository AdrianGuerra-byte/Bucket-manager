# Document Management System - Migration Guide

## Overview
The frontend has been completely refactored to work with the new document-centric API instead of the bucket-based system.

## Key Changes

### 1. API Endpoints
- **Old**: `/buckets/{bucket}/files`
- **New**: `/documents/bucket/{owner_ref}`

### 2. Upload System
**Old Endpoint**: `POST /buckets/{bucket}/upload`
```javascript
// Only file and optional subfolder
formData.append("file", file)
```

**New Endpoint**: `POST /documents/upload`
```javascript
// Requires file, owner_ref, doc_type, and optional metadata
formData.append("file", file)
formData.append("owner_ref", matricula)  // e.g., 2500001
formData.append("doc_type", tipoDoc)     // e.g., "INE_FRONT"
formData.append("metadata", JSON.stringify({
  ciclo: "2025-1",
  origen: "portal_web",
  status: "PENDIENTE",
  comentario: "Uploaded by student"
}))
```

### 3. Document Types Catalog
The system now uses a predefined catalog of document types:
- `INE_FRONT` - INE (Front)
- `INE_BACK` - INE (Back)
- `ACTA_NACIMIENTO` - Birth Certificate
- `CURP` - CURP
- `COMPROBANTE_DOMICILIO` - Proof of Address
- `CERTIFICADO` - Certificate of Studies
- `KARDEX` - Transcript
- `FOTOGRAFIA` - Photograph
- `OTRO` - Other Document

### 4. Document Status
Documents now have a status field with visual indicators:
- **VALIDADO** (Green badge with checkmark)
- **PENDIENTE** (Gray badge with clock)
- **RECHAZADO** (Red badge with X)

### 5. File Constraints
- **Max file size**: 2MB
- **Allowed formats**: PDF, JPG, PNG
- **HTTP Errors Handled**:
  - 413: File exceeds 2MB
  - 415: Unsupported file format
  - 400: Validation error
  - 403: Session expired or no permission

## New Components

### DocumentDashboard
- Main entry point
- Allows entering student ID (owner_ref/matricula)
- Displays search interface

### DocumentList
- Shows all documents for a student
- Filterable by status (All, Validated, Pending, Rejected)
- Sortable by name, date, size
- Search functionality

### DocumentCard
- Individual document card with:
  - Status badge
  - File icon (PDF/Image)
  - Metadata (cycle, comments, version)
  - Actions: View, Download, Delete

### UploadDialog (Refactored)
- Single file upload
- Document type selector
- Metadata fields (cycle, comments)
- Drag-and-drop support
- File validation

## API Client Methods

### New Methods
```typescript
// List documents for a student
listDocuments(ownerRef: number | string): Promise<Document[]>

// Upload document with metadata
uploadDocument(request: DocumentUploadRequest): Promise<any>

// Download document
downloadDocument(documentId: string, fileName: string): Promise<void>

// Get document blob for preview
getDocumentBlob(documentId: string): Promise<Blob>

// Delete document
deleteDocument(documentId: string): Promise<void>
```

### Removed Methods
- `listBuckets()`
- `getBucket()`
- `createBucket()`
- `uploadFile()` / `uploadMultipleFiles()`
- `downloadFile()` (bucket-based)
- `deleteFiles()` (bucket-based)

## Type Definitions

### Document
```typescript
interface Document {
  document_id: string
  type_code: string
  type_name: string
  file_name: string
  upload_date: string
  size_bytes: number
  metadata: DocumentMetadata
  download_url: string
  version?: number
}
```

### DocumentMetadata
```typescript
interface DocumentMetadata {
  status?: "VALIDADO" | "PENDIENTE" | "RECHAZADO"
  ciclo?: string
  origen?: string
  comentario?: string
  [key: string]: any
}
```

### DocumentUploadRequest
```typescript
interface DocumentUploadRequest {
  file: File
  owner_ref: number | string
  doc_type: string
  metadata?: DocumentMetadata
}
```

## Migration Steps

1. **Authentication remains the same** - JWT Bearer token in Authorization header
2. **Home page** now shows document dashboard instead of bucket list
3. **Old bucket routes** (`/buckets/[bucket]`) redirect to home
4. **Search workflow**: Enter matricula → View documents → Upload/Download/Delete

## Error Handling

The system provides user-friendly error messages for:
- File too large (>2MB)
- Invalid file format
- Validation errors
- Permission issues
- Session expiration

## Security
- All requests require valid JWT token
- HTTP-only cookies with strict SameSite policy
- Download uses blob creation (not direct links) for token-protected endpoints
- No sensitive data logged to console

## UI Features
- Dark/Light mode support maintained
- Responsive design for mobile/desktop
- Drag-and-drop file upload
- Real-time file preview
- Status color coding
- Sort and filter capabilities
