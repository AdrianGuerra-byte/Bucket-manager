# Guía de Debugging - Sistema de Documentos

## 🔍 Problema: No se muestran archivos

### Pasos para Diagnosticar

1. **Abrir DevTools del Navegador**
   - Chrome: `F12` o `Ctrl+Shift+I`
   - Ver pestaña "Console"

2. **Buscar Documentos**
   - Ingresar matrícula (ej: 777)
   - Hacer clic en "Buscar Documentos"

3. **Revisar Logs en Console**
   
   Deberías ver algo como:
   ```
   [useApiClient] Inicializando ApiClient con baseUrl: http://127.0.0.1:8000
   [DocumentList] Cargando documentos para owner_ref: 777
   [useApiClient] Solicitando token...
   [useApiClient] Token obtenido exitosamente
   [ApiClient] Solicitando: http://127.0.0.1:8000/documents/bucket/777
   [ApiClient] Respuesta recibida: status 200
   [ApiClient] Datos parseados: [{document_id: "...", ...}]
   [DocumentList] Documentos recibidos: [...]
   [DocumentList] Se encontraron 1 documento(s)
   ```

### Posibles Problemas

#### A) baseUrl está vacío o incorrecto
**Síntoma**: `[useApiClient] Inicializando ApiClient con baseUrl: ""`

**Solución**:
```bash
# Verificar .env.local
cat .env.local

# Debe contener:
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Si no existe o está mal, corregirlo y reiniciar:
rm -rf .next
pnpm dev
```

#### B) Error 404 en /documents/bucket/{owner_ref}
**Síntoma**: `[ApiClient] Respuesta recibida: status 404`

**Solución**: El backend no está corriendo o no tiene el endpoint implementado
```bash
# Verificar que el backend esté corriendo
curl http://127.0.0.1:8000/docs

# Probar endpoint directamente (necesitas un token válido)
curl -X 'GET' \
  'http://127.0.0.1:8000/documents/bucket/777' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer TU_TOKEN_AQUI'
```

#### C) Error de CORS
**Síntoma**: En console aparece `CORS policy` o `Access-Control-Allow-Origin`

**Solución**: Configurar CORS en el backend FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.16.60:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### D) Error de Autenticación
**Síntoma**: `[ApiClient] Respuesta recibida: status 403`

**Solución**: Verificar credenciales en `.env.local`
```bash
# Las credenciales deben ser correctas
NEXT_PUBLIC_AUTH_USERNAME=inscripciones_2026
NEXT_PUBLIC_AUTH_PASSWORD=cuh2026$secure
```

#### E) No hay documentos en la BD
**Síntoma**: `[DocumentList] No hay documentos para owner_ref: 777`

**Solución**: Subir documentos usando el botón "Subir Documento" o verificar en el backend

### Verificar Backend Manualmente

```bash
# 1. Obtener token
curl -X 'POST' \
  'http://127.0.0.1:8000/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=inscripciones_2026&password=cuh2026$secure'

# Copiar el access_token de la respuesta

# 2. Listar documentos de alumno 777
curl -X 'GET' \
  'http://127.0.0.1:8000/documents/bucket/777' \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN_AQUI'

# 3. Subir un documento de prueba
curl -X 'POST' \
  'http://127.0.0.1:8000/documents/upload' \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN_AQUI' \
  -F 'file=@test.pdf' \
  -F 'owner_ref=777' \
  -F 'doc_type=INE_FRONT' \
  -F 'metadata={"ciclo":"2025-1"}'
```

### Logs del Servidor Next.js

También revisa la terminal donde corre `pnpm dev`:
```
GET /api/auth/token 200 in Xms
```

Si ves errores 500 o 401, hay problema con la autenticación.

### Network Tab

En DevTools → Network:
1. Filtrar por "Fetch/XHR"
2. Buscar request a `/documents/bucket/777`
3. Ver:
   - Request Headers (debe incluir `Authorization: Bearer ...`)
   - Response (debe ser JSON con array de documentos)
   - Status (debe ser 200)

### Checklist Rápido

- [ ] Backend corriendo en http://127.0.0.1:8000
- [ ] `.env.local` tiene `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
- [ ] Frontend reiniciado después de cambiar `.env.local` (`rm -rf .next && pnpm dev`)
- [ ] No hay errores de CORS en console
- [ ] Token se obtiene correctamente (ver logs)
- [ ] Request a `/documents/bucket/{owner_ref}` retorna 200
- [ ] Existen documentos en la BD para ese `owner_ref`

### Limpiar Todo y Empezar de Nuevo

```bash
# Frontend
cd /home/guerra/Work/bucket_front/FileMngmt
rm -rf .next
rm -rf node_modules/.cache
pnpm dev

# Luego en el navegador
# 1. Abrir http://localhost:3000
# 2. Ctrl+Shift+R (hard refresh)
# 3. Abrir DevTools (F12)
# 4. Ir a Application → Clear storage → Clear site data
# 5. Recargar página
```

## 📊 Formato de Respuesta Esperado

El backend debe retornar:
```json
[
  {
    "document_id": "uuid-aqui",
    "type_code": "INE_BACK",
    "type_name": "INE (Reverso)",
    "file_name": "documento.pdf",
    "upload_date": "2025-11-28T14:43:00.558172",
    "size_bytes": 15137,
    "metadata": {
      "historial_cambios": [...],
      "status": "PENDIENTE",
      "ciclo": "2025-1",
      "comentario": "..."
    },
    "download_url": "/api/documents/uuid-aqui/download"
  }
]
```

Si el formato es diferente, el frontend puede no mostrar los datos correctamente.
