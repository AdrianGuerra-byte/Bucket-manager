# Sistema de Gestión de Documentos - Frontend

Aplicación web para la gestión y visualización de documentos académicos del sistema de inscripciones del Centro Universitario Hidalguense.

## Stack

### Frontend
- **Next.js** 16.0.0 - Framework React con SSR y App Router
- **React** 19.2.0 - Biblioteca de interfaces de usuario
- **TypeScript** 5.0.2 - Lenguaje tipado
- **TailwindCSS** 3.4.1 - Framework CSS utility-first
- **Turbopack** - Bundler de desarrollo de alto rendimiento

### UI y Componentes
- **Radix UI** - Componentes accesibles sin estilos
- **Lucide React** 0.469.0 - Iconos
- **Sonner** 1.7.1 - Sistema de notificaciones toast

### Gestión de Estado y Validación
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas TypeScript-first

### Herramientas de Desarrollo
- **pnpm** 9.15.0 - Gestor de paquetes eficiente
- **ESLint** - Linter de código
- **PostCSS** - Procesamiento de CSS

## Arquitectura del Sistema

### Estructura de Directorios

```
FileMngmt/
├── app/
│   ├── layout.tsx                 # Layout principal de la aplicación
│   ├── page.tsx                   # Página de inicio con dashboard
│   ├── globals.css                # Estilos globales
│   └── api/
│       └── auth/
│           └── token/
│               └── route.ts       # Proxy server-side para autenticación
├── components/
│   ├── document-dashboard.tsx     # Panel principal de búsqueda y filtros
│   ├── document-list.tsx          # Listado de documentos con paginación
│   ├── document-card.tsx          # Tarjeta individual de documento
│   ├── document-history-dialog.tsx # Modal de historial de versiones
│   ├── upload-dialog.tsx          # Modal de carga de documentos
│   ├── confirm-modal.tsx          # Modal de confirmación
│   ├── logout-button.tsx          # Botón de cierre de sesión
│   ├── breadcrumbs.tsx            # Navegación de ruta
│   ├── file-preview.tsx           # Visor de archivos PDF/imágenes
│   └── ui/                        # Componentes base de Radix UI
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── checkbox.tsx
│       └── toast.tsx
├── hooks/
│   ├── use-api-client.ts          # Hook para cliente HTTP con autenticación
│   └── use-toast.ts               # Hook para notificaciones
├── lib/
│   ├── api-client.ts              # Cliente HTTP centralizado
│   ├── auth.ts                    # Utilidades de autenticación
│   └── utils.ts                   # Utilidades generales
├── types/
│   └── files.ts                   # Tipos TypeScript para documentos
├── utils/
│   ├── file-types.ts              # Validación de tipos de archivo
│   └── formatters.ts              # Formateo de datos
├── public/                        # Archivos estáticos
├── .env                           # Variables de entorno
├── tsconfig.json                  # Configuración TypeScript
├── next.config.mjs                # Configuración Next.js
├── tailwind.config.ts             # Configuración TailwindCSS
└── package.json                   # Dependencias del proyecto
```

### Modelo de Datos

#### Interfaz: `Document`
Representa un documento del sistema.

**Campos:**
- `id` (String) - Identificador UUID único
- `document_id` (String) - Identificador del documento (alias de id)
- `owner_ref` (Number) - Matrícula o folio del alumno
- `document_type_code` (String) - Código del tipo de documento
- `type_name` (String) - Nombre descriptivo del tipo
- `file_name` (String) - Nombre del archivo
- `file_size_bytes` (Number) - Tamaño del archivo en bytes
- `upload_date` (String) - Fecha de carga ISO 8601
- `status` (String) - Estado del documento: VALIDADO, PENDIENTE, RECHAZADO
- `metadata` (DocumentMetadata) - Información adicional estructurada
- `current_version` (Object) - Versión actual del archivo

#### Interfaz: `DocumentMetadata`
Información adicional del documento.

**Campos:**
- `sistema_origen` (String) - Sistema que generó el documento
- `propietario` (Propietario) - Información del dueño del documento
- `validacion` (Validacion) - Estado de validación e historial

#### Tipos de Documento Soportados

```typescript
const DOCUMENT_TYPES = [
  "INE_FRONT",    // INE (Frente)
  "INE_BACK",     // INE (Reverso)
  "ACTA_NAC",     // Acta de Nacimiento
  "CURP",         // CURP
  "KARDEX",       // Kárdex
  "COMP_DOM"      // Comprobante de Domicilio
]
```

## Configuración del Entorno

### Variables de Entorno (.env)

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Autenticación OAuth2
TOKEN_CLIENT_ID=inscripciones_online_prod_2025
TOKEN_CLIENT_SECRET=test1234
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/AdrianGuerra-byte/FileMngmt.git
cd FileMngmt

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales del backend

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## Comunicación Frontend-Backend

### Flujo de Autenticación

```
1. Frontend inicia
   ↓
2. useApiClient solicita token
   ↓
3. Next.js API Route (/api/auth/token) hace proxy
   ↓
4. Backend valida client_id/client_secret
   ↓
5. Backend devuelve JWT
   ↓
6. Frontend almacena token en memoria
   ↓
7. Todas las peticiones incluyen: Authorization: Bearer {token}
```

**Implementación:**

```typescript
// hooks/use-api-client.ts
const getToken = async () => {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  const { access_token } = await response.json()
  return access_token
}
```

### Endpoints Consumidos

#### 1. Autenticación
**POST** `/api/auth/token` (Proxy interno)
- Obtiene token JWT del backend
- Oculta credenciales del cliente

#### 2. Filtrado de Documentos
**GET** `/documents/filter/{owner_ref}?doc_types=INE_FRONT&doc_types=CURP`
- Retorna documentos filtrados por tipo
- El backend filtra en SQL (optimizado)
- Query params construidos con URLSearchParams

**Ejemplo de petición:**
```typescript
const params = new URLSearchParams()
selectedDocTypes.forEach(type => params.append('doc_types', type))
const url = `/documents/filter/666?${params.toString()}`
const response = await fetchWithAuth(url)
```

#### 3. Descarga de Documentos
**GET** `/documents/{document_id}/download`
- Descarga archivo como Blob
- Maneja Content-Disposition para nombre de archivo

#### 4. Carga de Documentos
**POST** `/documents/upload`
- Envía FormData multipart
- Campos: file, owner_ref, doc_type, metadata

### Manejo de Errores

```typescript
// Errores capturados y mostrados al usuario
try {
  const docs = await apiClient.listDocuments(ownerRef, docTypes)
  setDocuments(docs)
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  })
}
```

## Funcionalidades Principales

### 1. Dashboard de Documentos

**Componente:** `document-dashboard.tsx`

**Características:**
- Campo de búsqueda por matrícula/folio
- Panel de filtros colapsable con checklist de tipos de documento
- Contador de filtros activos
- Botón para limpiar filtros
- Integración con DocumentList para mostrar resultados

**Flujo:**
```
Usuario ingresa owner_ref (666)
  ↓
Selecciona filtros (INE_FRONT, CURP)
  ↓
Click en "Buscar"
  ↓
Estado local: selectedDocTypes = ["INE_FRONT", "CURP"]
  ↓
DocumentList recibe props: ownerRef y docTypes
  ↓
Petición: GET /documents/filter/666?doc_types=INE_FRONT&doc_types=CURP
  ↓
Backend filtra en SQL
  ↓
Frontend muestra solo documentos filtrados
```

### 2. Listado de Documentos

**Componente:** `document-list.tsx`

**Características:**
- Búsqueda local por nombre de archivo o tipo
- Filtrado por estado de validación (VALIDADO/PENDIENTE/RECHAZADO)
- Ordenamiento por nombre, tamaño o fecha
- Vista en grid responsive
- Mensajes informativos cuando no hay documentos

**Optimización:**
- No filtra por tipo de documento del lado del cliente
- Confía en el filtrado SQL del backend
- Solo aplica filtros de búsqueda y estado localmente

### 3. Tarjeta de Documento

**Componente:** `document-card.tsx`

**Características:**
- Información visual del documento (tipo, nombre, tamaño, fecha)
- Badge de estado con colores semánticos
- Botones de acción: Previsualizar, Descargar, Historial
- Responsive design

**Estados visuales:**
- VALIDADO: Verde
- PENDIENTE: Amarillo
- RECHAZADO: Rojo

### 4. Historial de Versiones

**Componente:** `document-history-dialog.tsx`

**Características:**
- Línea de tiempo de cambios
- Muestra revisor, fecha y comentarios
- Estados visuales por tipo de validación
- Modal responsive

**Estructura de datos:**
```typescript
historial: [
  {
    estado: "pendiente",
    revisor: "Sistema",
    timestamp: "2024-12-08T10:30:00Z",
    comentarios: "Documento recibido"
  }
]
```

### 5. Carga de Documentos

**Componente:** `upload-dialog.tsx`

**Características:**
- Selección de tipo de documento
- Validación de formato (PDF, JPG, PNG)
- Validación de tamaño
- Campo de comentarios para metadata

**Validaciones:**
- Tipos permitidos: application/pdf, image/jpeg, image/png
- Tamaño máximo: Configurado en backend
- Campos obligatorios: file, doc_type

## Sistema de Notificaciones

**Hook:** `use-toast.ts`

**Tipos de notificaciones:**
- **Success:** Operaciones exitosas (verde)
- **Error:** Fallos de operación (rojo)
- **Info:** Información general (azul)
- **Warning:** Advertencias (amarillo)

**Uso:**
```typescript
toast({
  title: "Éxito",
  description: "Documento cargado correctamente",
  variant: "default"
})
```

## Flujo Completo de Usuario

### Búsqueda de Documentos

```
1. Usuario ingresa matrícula en DocumentDashboard
2. Selecciona filtros (opcional): INE_FRONT, CURP
3. Click en "Buscar"
4. Frontend construye URL con query params
5. Backend filtra documentos en SQL
6. Frontend recibe lista filtrada
7. DocumentList renderiza tarjetas
8. Usuario puede:
   - Buscar localmente por nombre
   - Filtrar por estado de validación
   - Ordenar por campo
   - Ver historial
   - Descargar
   - Previsualizar
```

### Carga de Documento

```
1. Usuario click en botón "Subir Documento"
2. Modal UploadDialog se abre
3. Usuario selecciona archivo
4. Usuario elige tipo de documento (dropdown)
5. Usuario agrega comentarios (opcional)
6. Click en "Subir"
7. Frontend valida formato y tamaño
8. FormData se construye
9. POST /documents/upload con Authorization header
10. Backend procesa:
    - Valida permisos
    - Verifica si documento existe
    - Crea nueva versión o nuevo documento
    - Guarda archivo físico
    - Actualiza metadata
11. Frontend recibe respuesta
12. Toast de éxito
13. Lista se recarga automáticamente
```

## Optimización y Rendimiento

### Estrategias Implementadas

**1. Filtrado del lado del servidor**
- Query params enviados al backend
- Filtrado en SQL (no en memoria del cliente)

**2. Lazy loading de componentes**
```typescript
const DocumentHistoryDialog = dynamic(() => import('./document-history-dialog'))
```

**3. Memoización de datos**
```typescript
const filteredDocuments = useMemo(() => {
  return documents.filter(/* criterios */)
}, [documents, searchQuery, filterStatus])
```

**4. Debouncing de búsqueda**
- Evita peticiones excesivas durante escritura
- Mejora UX y reduce carga del servidor

### Límites y Escalabilidad

**Estado actual:**
- Carga completa de documentos por alumno/usuario
- Sin paginación (se asume < 100 docs por alumno/usuario)
- Filtrado de búsqueda local en memoria

**Recomendaciones futuras:**
- Implementar paginación para > 100 documentos
- Virtualización de lista para > 500 elementos
- Caché de resultados con SWR, Redis o React Query

## Seguridad

### Medidas Implementadas

**1. Proxy de autenticación**
```typescript
// app/api/auth/token/route.ts
// Credenciales nunca expuestas al cliente
const credentials = {
  client_id: process.env.TOKEN_CLIENT_ID,
  client_secret: process.env.TOKEN_CLIENT_SECRET
}
```

**2. Validación de tipos**
```typescript
// TypeScript garantiza tipos correctos
interface Document {
  id: string
  owner_ref: number
  // ...
}
```

**3. Sanitización de URLs**
```typescript
// URLSearchParams previene inyección
const params = new URLSearchParams()
params.append('doc_types', type)
```

**4. HTTPS en producción**
- Configurar variables de entorno con URLs https://
- Certificados SSL/TLS en servidor

## Deployment

### Variables de Entorno de Producción

```env
NEXT_PUBLIC_API_BASE_URL=https://api.cuh.mx
TOKEN_CLIENT_ID=inscripciones_prod_2025
TOKEN_CLIENT_SECRET=secret_produccion_seguro
```

### Build y Deploy

```bash
# Build optimizado
pnpm build

# Iniciar servidor
pnpm start
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name inscripciones.cuh.mx;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Integración Frontend-Backend

### Endpoints Relacionados

| Funcionalidad Frontend | Endpoint Backend | Método | Query Params |
|------------------------|------------------|--------|--------------|
| Autenticación | `/token` | POST | - |
| Búsqueda sin filtros | `/documents/filter/{owner_ref}` | GET | - |
| Búsqueda con filtros | `/documents/filter/{owner_ref}` | GET | `doc_types` |
| Descarga | `/documents/{id}/download` | GET | - |
| Carga | `/documents/upload` | POST | - |

### Formato de Datos Compartido

**Request de filtrado:**
```
GET /documents/filter/666?doc_types=INE_FRONT&doc_types=CURP
Authorization: Bearer eyJhbGci...
```

**Response del backend:**
```json
{
  "owner_ref": 666,
  "total_documents": 2,
  "documents": [
    {
      "id": "uuid",
      "document_id": "uuid",
      "owner_ref": 666,
      "document_type_code": "INE_FRONT",
      "type_name": "INE (Frente)",
      "file_name": "ine.pdf",
      "file_size_bytes": 524288,
      "upload_date": "2024-12-08T10:30:00",
      "status": "VALIDADO",
      "metadata": {...},
      "current_version": {...}
    }
  ]
}
```

**Procesamiento del frontend:**
```typescript
const { documents } = response
const docsArray = Array.isArray(documents) ? documents : []
setDocuments(docsArray)
```

## Troubleshooting

### Errores Comunes

**1. Error CORS**
```
Access to fetch blocked by CORS policy
```
Solución: Verificar configuración de CORS en backend

**2. Token expirado**
```
401 Unauthorized
```
Solución: El hook reintenta automáticamente obtener nuevo token

**3. Documentos no cargan**
```
documents.filter is not a function
```
Solución: Ya resuelto con validación `Array.isArray()`

**4. ID undefined en descarga**
```
GET /documents/undefined/download
```
Solución: Ya resuelto con fallback `doc.id || doc.document_id`
