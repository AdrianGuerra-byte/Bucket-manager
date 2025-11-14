# Administrador de Archivos - Buckets

Aplicación Next.js para gestión interna de archivos en buckets.

# TODO:
- [ ] Visualizar todos los Buckets disponibles
- [ ] Subir archivos a un Bucket
- [ ] Crear nuevas carpetas dentro de un Bucket
- [ ] Mover archivos entre carpetas
- [ ] Renombrar archivos y carpetas
- [ ] Descargar múltiples archivos como ZIP

## Características

- [x] Autenticación basada en tokens (server-side proxy)
- [x] Listado de archivos con paginación
- [x] Eliminación simple y múltiple de archivos
- [x] Descarga de archivos
- [x] Vista previa de imágenes y PDFs
- [x] Navegación por carpetas con breadcrumbs
- [x] Búsqueda y filtrado por tipo
- [x] Ordenación por nombre, tamaño y fecha

## Configuración

### Variables de Entorno

Crear un archivo `.env.local` con:

```env
# URL del backend FastAPI
NEXT_PUBLIC_API_BASE_URL=
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## Estructura del Proyecto

```
├── app/
│   ├── api/auth/token/        # Proxy server-side para autenticación
│   ├── buckets/[bucket]/      # Vista principal de bucket
│   └── layout.tsx             # Layout raíz
├── components/
│   ├── breadcrumbs.tsx        # Navegación por carpetas
│   ├── confirm-modal.tsx      # Modal de confirmación
│   ├── file-list.tsx          # Lista principal de archivos
│   ├── file-preview.tsx       # Vista previa de archivos
│   ├── file-row.tsx           # Componente de fila de archivo
│   └── multi-select-toolbar.tsx # Barra de acciones múltiples
├── hooks/
│   └── use-api-client.ts      # Hook para cliente API
├── lib/
│   ├── api-client.ts          # Cliente centralizado para API
│   └── auth.ts                # Lógica de autenticación server-side
├── types/
│   └── files.ts               # Interfaces TypeScript
└── utils/
    ├── file-types.ts          # Utilidades para tipos de archivo
    └── formatters.ts          # Formateadores (tamaño, fecha)
```

## Uso

1. La aplicación se conecta automáticamente al backend configurado en `NEXT_PUBLIC_API_BASE_URL`
2. La autenticación se maneja automáticamente usando el proxy server-side
3. Navega a `/buckets/{nombre-del-bucket}` para ver los archivos
4. Usa los filtros y búsqueda para encontrar archivos específicos
5. Selecciona múltiples archivos con click + shift/ctrl para acciones masivas
6. Haz click en un archivo para vista previa (imágenes y PDFs)

## Endpoints del Backend

La aplicación espera los siguientes endpoints en el backend FastAPI:

- `POST /token` - Obtener token de acceso
- `GET /buckets/{bucket_name}/files` - Listar archivos (soporta query param `subfolder`)
- `DELETE /buckets/{bucket_name}/files` - Eliminar múltiples archivos (array de nombres)
- `DELETE /buckets/{bucket_name}/files/{filename}` - Eliminar un archivo
- `GET /buckets/{bucket_name}/files/{filename}/download` - Descargar archivo

## Tecnologías

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React 19
