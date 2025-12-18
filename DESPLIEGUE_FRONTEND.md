# Manual de Despliegue: Sistema de Gestión Documental - Frontend (Next.js)

**Versión del Documento:** 1.0
**Fecha:** 16 de Diciembre, 2025
**Autor:** Centro Universitario Hidalguense
**Objetivo:** Guía completa para el despliegue del frontend del Sistema de Gestión Documental en Ubuntu Server con NGINX.

---

## 1. Requisitos Previos

### 1.1 Hardware Recomendado

- **CPU:** 2 vCPU o superior
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Almacenamiento:** 20 GB SSD para aplicación y dependencias
- **Red:** Conexión estable con el servidor backend

### 1.2 Software Base

- **Sistema Operativo:** Ubuntu Server 22.04 LTS o superior
- **Node.js:** 18.x LTS o 20.x LTS
- **Gestor de Paquetes:** pnpm 8.x
- **Gestor de Procesos:** PM2
- **Servidor Web:** NGINX 1.22+
- **Seguridad:** UFW (firewall), Let's Encrypt (SSL)
- **Backend:** Bucket CUH API desplegado y funcionando

### 1.3 Información del Proyecto

- **Framework:** Next.js 15.1.3
- **React:** 19.0.0
- **TypeScript:** 5.x
- **Estilos:** Tailwind CSS 3.4.1
- **Componentes UI:** Radix UI
- **Puerto por defecto:** 3000
- **Repositorio:** https://github.com/Centro-Universitario-Hidalguense/bucket_frontend

---

## 2. Preparación del Sistema

### 2.1 Actualizar Sistema

```bash
# Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    ufw \
    certbot \
    python3-certbot-nginx
```

### 2.2 Instalar Node.js 20 LTS

```bash
# Agregar repositorio oficial de Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

### 2.3 Instalar pnpm y PM2

```bash
# Instalar pnpm globalmente
sudo npm install -g pnpm

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Verificar instalaciones
pnpm --version  # Debe mostrar 8.x.x o superior
pm2 --version   # Debe mostrar 5.x.x o superior
```

### 2.4 Configurar Firewall (UFW)

```bash
# Permitir SSH (si no está permitido)
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Habilitar firewall
sudo ufw enable

# Verificar reglas
sudo ufw status
```

**Resultado esperado:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 3. Clonar y Configurar el Proyecto

### 3.1 Crear Directorio y Clonar Repositorio

```bash
# Crear directorio de aplicación
sudo mkdir -p /var/www/bucket_frontend
sudo chown $USER:$USER /var/www/bucket_frontend

# Clonar repositorio
git clone https://github.com/Centro-Universitario-Hidalguense/bucket_frontend.git /var/www/bucket_frontend

# Navegar al directorio
cd /var/www/bucket_frontend
```

### 3.2 Configurar Variables de Entorno

**⚠️ IMPORTANTE:** El archivo `.env` NO debe versionarse en Git.

```bash
cd /var/www/bucket_frontend

# Crear archivo .env.local para producción
cat > .env.local << 'EOF'
# === BACKEND API ===
NEXT_PUBLIC_API_BASE_URL=http://192.168.16.60:8001

# === AUTENTICACIÓN ===
# URL del endpoint de token
NEXT_PUBLIC_TOKEN_URL=http://192.168.16.60:8001/token

# === ENTORNO ===
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# === CONFIGURACIÓN DE BUILD ===
# Desactivar verificación de TypeScript en build (opcional)
# NEXT_PUBLIC_IGNORE_TYPESCRIPT_ERRORS=false
EOF

# Proteger archivo
chmod 600 .env.local
```

**Notas importantes:**
- Reemplaza `192.168.16.60:8001` con la IP y puerto real de tu backend
- Si el backend usa HTTPS, cambia `http://` por `https://`
- El archivo `.env.local` tiene prioridad sobre `.env` en producción

### 3.3 Instalar Dependencias

```bash
cd /var/www/bucket_frontend

# Instalar dependencias con pnpm
pnpm install --frozen-lockfile

# Verificar que se instalaron correctamente
ls -la node_modules/
```

**Tiempo estimado:** 2-5 minutos dependiendo de la conexión.

### 3.4 Compilar para Producción

```bash
cd /var/www/bucket_frontend

# Ejecutar build de producción
pnpm build

# Verificar que se creó correctamente
ls -la .next/
```

**Resultado esperado:**
```
.next/
├── BUILD_ID
├── cache/
├── server/
├── static/
└── trace
```

**⚠️ Si el build falla:**
- Revisa los errores de TypeScript
- Verifica que todas las dependencias estén instaladas
- Consulta los logs: `cat .next/build-error.log`

---

## 4. Configurar PM2 (Gestor de Procesos)

### 4.1 Crear Archivo de Configuración

```bash
cd /var/www/bucket_frontend

# Crear ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bucket-frontend',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/bucket_frontend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/pm2/bucket-frontend-error.log',
    out_file: '/var/log/pm2/bucket-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
}
EOF
```

**Parámetros importantes:**
- `instances: 2` - Ejecuta 2 instancias en modo cluster para mejor rendimiento
- `exec_mode: 'cluster'` - Aprovecha múltiples núcleos CPU
- `max_memory_restart: '1G'` - Reinicia si usa más de 1GB de RAM
- `autorestart: true` - Reinicia automáticamente en caso de fallo

### 4.2 Crear Directorio de Logs

```bash
# Crear directorio para logs de PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

### 4.3 Iniciar Aplicación con PM2

```bash
cd /var/www/bucket_frontend

# Iniciar aplicación
pm2 start ecosystem.config.js

# Verificar estado
pm2 status

# Ver logs en tiempo real
pm2 logs bucket-frontend
```

**Resultado esperado:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name             │ mode    │ status  │ cpu      │ memory │
├─────┼──────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ bucket-frontend  │ cluster │ online  │ 0%       │ 150MB  │
│ 1   │ bucket-frontend  │ cluster │ online  │ 0%       │ 145MB  │
└─────┴──────────────────┴─────────┴─────────┴──────────┴────────┘
```

### 4.4 Configurar Inicio Automático

```bash
# Guardar configuración actual de PM2
pm2 save

# Configurar inicio automático en el boot del sistema
pm2 startup systemd

# Ejecutar el comando que PM2 muestre (ejemplo):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

**Verificar:**
```bash
# Reiniciar PM2 para probar
pm2 restart all

# Verificar que sigue funcionando
pm2 status
```

### 4.5 Comandos Útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs bucket-frontend

# Ver logs de los últimos 100 líneas
pm2 logs bucket-frontend --lines 100

# Ver logs solo de errores
pm2 logs bucket-frontend --err

# Reiniciar aplicación
pm2 restart bucket-frontend

# Detener aplicación
pm2 stop bucket-frontend

# Recargar (sin downtime)
pm2 reload bucket-frontend

# Ver información detallada
pm2 show bucket-frontend

# Monitorear recursos
pm2 monit
```

---

## 5. Configurar NGINX como Reverse Proxy

### 5.1 Crear Configuración del Sitio

```bash
sudo nano /etc/nginx/sites-available/bucket_frontend
```

**Contenido inicial (HTTP):**

```nginx
# Upstream para el frontend Next.js
upstream nextjs_frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Servidor HTTP (se redirigirá a HTTPS después de SSL)
server {
    listen 80;
    listen [::]:80;
    server_name documentos.cuh.edu.mx;

    # Logs específicos del frontend
    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log warn;

    # Tamaño máximo de carga (para archivos grandes)
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Permitir renovación de certificados Let's Encrypt
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Proxy a Next.js
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;

        # Headers esenciales
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (para Hot Reload en desarrollo)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Next.js assets estáticos (_next/static/)
    location /_next/static/ {
        proxy_pass http://nextjs_frontend;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_cache_control;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js images optimization
    location /_next/image {
        proxy_pass http://nextjs_frontend;
        proxy_cache_valid 200 60m;
    }

    # Favicon y archivos públicos
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5.2 Activar Sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/bucket_frontend /etc/nginx/sites-enabled/

# Verificar sintaxis de NGINX
sudo nginx -t

# Si la sintaxis es correcta, reiniciar NGINX
sudo systemctl restart nginx

# Verificar estado
sudo systemctl status nginx
```

**Resultado esperado:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running)
```

### 5.3 Probar Acceso HTTP

```bash
# Desde el servidor
curl http://localhost

# Desde otra máquina (reemplaza con tu IP)
curl http://TU_IP_DEL_SERVIDOR

# Verificar que responde Next.js
curl -I http://localhost
```

---

## 6. Configurar SSL/HTTPS con Let's Encrypt

### 6.1 Verificar Requisitos Previos

**⚠️ ANTES de continuar, asegúrate de:**
1. El dominio `documentos.cuh.edu.mx` apunta a la IP del servidor (DNS configurado)
2. Los puertos 80 y 443 están abiertos en el firewall
3. NGINX está funcionando correctamente en HTTP

### 6.2 Obtener Certificado SSL

```bash
# Instalar Certbot (si no está instalado)
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado y configurar NGINX automáticamente
sudo certbot --nginx -d documentos.cuh.edu.mx
```

**Durante el proceso, Certbot preguntará:**
1. **Email:** Ingresa un email válido para notificaciones
2. **Términos de servicio:** Acepta (A)
3. **Compartir email con EFF:** Opcional (Y/N)
4. **Redirect HTTP → HTTPS:** Elige opción 2 (Redirect)

**Resultado esperado:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/documentos.cuh.edu.mx/fullchain.pem
Key is saved at: /etc/letsencrypt/live/documentos.cuh.edu.mx/privkey.pem
Deploying certificate
Successfully deployed certificate for documentos.cuh.edu.mx to /etc/nginx/sites-enabled/bucket_frontend
Congratulations! You have successfully enabled HTTPS on https://documentos.cuh.edu.mx
```

### 6.3 Verificar Renovación Automática

```bash
# Probar renovación en modo dry-run (simulación)
sudo certbot renew --dry-run

# Ver certificados instalados
sudo certbot certificates
```

**La renovación automática está configurada en:**
```bash
# Verificar timer de systemd
sudo systemctl status certbot.timer

# Ver próxima ejecución
sudo systemctl list-timers | grep certbot
```

### 6.4 Configuración NGINX Final (Después de SSL)

Certbot modifica automáticamente la configuración. El archivo final quedará así:

```nginx
# Upstream
upstream nextjs_frontend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Redirección HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name documentos.cuh.edu.mx;

    # Certbot agrega automáticamente
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name documentos.cuh.edu.mx;

    # Certificados SSL (agregados por Certbot)
    ssl_certificate /etc/letsencrypt/live/documentos.cuh.edu.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/documentos.cuh.edu.mx/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log warn;

    # Tamaño máximo de carga
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Proxy a Next.js
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js assets estáticos
    location /_next/static/ {
        proxy_pass http://nextjs_frontend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js image optimization
    location /_next/image {
        proxy_pass http://nextjs_frontend;
    }

    # Archivos estáticos con caché
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.5 Verificar HTTPS

```bash
# Probar desde el servidor
curl -I https://documentos.cuh.edu.mx

# Verificar certificado
openssl s_client -connect documentos.cuh.edu.mx:443 -servername documentos.cuh.edu.mx

# Probar redirección HTTP → HTTPS
curl -I http://documentos.cuh.edu.mx
# Debe devolver: HTTP/1.1 301 Moved Permanently
```

---

## 7. Integración con Backend

### 7.1 Verificar Comunicación Frontend ↔ Backend

El frontend debe poder comunicarse con el backend. Verifica:

```bash
# Desde el servidor frontend, probar conexión al backend
curl http://192.168.16.60:8001/docs

# Probar endpoint de token
curl -X POST http://192.168.16.60:8001/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=inscripciones_2026&password=test1234"
```

**Resultado esperado:** Debe devolver un JSON con `access_token`.

### 7.2 Configurar CORS en el Backend

**⚠️ IMPORTANTE:** El backend debe permitir solicitudes desde el dominio del frontend.

En el archivo `.env` del backend (`/var/www/bucket_api/.env`):

```bash
# Agregar o modificar
FRONTEND_URL=https://documentos.cuh.edu.mx
```

En el código del backend (`app/main.py`):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://documentos.cuh.edu.mx",
        "http://192.168.16.60:3000"  # Para desarrollo
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Reiniciar backend después de cambios:**
```bash
sudo systemctl restart bucket_api
```

### 7.3 Probar Integración Completa

1. Abre el navegador: `https://documentos.cuh.edu.mx`
2. Intenta hacer login
3. Sube un documento de prueba
4. Descarga el documento

**Si hay errores de CORS:**
- Revisa la consola del navegador (F12)
- Verifica los logs del backend: `sudo journalctl -u bucket_api -f`
- Confirma que `FRONTEND_URL` está correcto en el backend

---

## 8. Monitoreo y Logs

### 8.1 Ubicación de Logs

```bash
# Logs de PM2 (aplicación Next.js)
/var/log/pm2/bucket-frontend-error.log  # Errores
/var/log/pm2/bucket-frontend-out.log    # Salida estándar

# Logs de NGINX (proxy)
/var/log/nginx/frontend_access.log      # Accesos
/var/log/nginx/frontend_error.log       # Errores de proxy
```

### 8.2 Comandos de Monitoreo

```bash
# Ver logs de la aplicación en tiempo real
pm2 logs bucket-frontend --lines 100

# Ver solo errores
pm2 logs bucket-frontend --err

# Ver logs de NGINX
sudo tail -f /var/log/nginx/frontend_error.log

# Ver logs de accesos
sudo tail -f /var/log/nginx/frontend_access.log

# Monitoreo de recursos en tiempo real
pm2 monit

# Estado del sistema
pm2 status
sudo systemctl status nginx
```

### 8.3 Rotación de Logs

Crear archivo de configuración para logrotate:

```bash
sudo nano /etc/logrotate.d/bucket_frontend
```

Contenido:

```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}

/var/log/nginx/frontend_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

Probar configuración:

```bash
sudo logrotate -d /etc/logrotate.d/bucket_frontend
```

---

## 9. Actualización y Despliegue Continuo

### 9.1 Script de Actualización Manual

Crear script para facilitar actualizaciones:

```bash
sudo nano /usr/local/bin/update_frontend.sh
```

Contenido:

```bash
#!/bin/bash
#
# Script de Actualización del Frontend
#

set -e  # Salir si hay algún error

echo "🔄 Actualizando frontend..."

# Ir al directorio
cd /var/www/bucket_frontend

# Hacer backup del .env
cp .env.local .env.local.backup

# Git pull
echo "📥 Descargando cambios..."
git pull origin main

# Restaurar .env
cp .env.local.backup .env.local

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install --frozen-lockfile

# Build de producción
echo "🏗️ Compilando..."
pnpm build

# Reiniciar PM2
echo "🔄 Reiniciando aplicación..."
pm2 reload bucket-frontend --update-env

# Ver estado
pm2 status

echo "✅ Actualización completada!"
echo "📊 Verifica los logs: pm2 logs bucket-frontend"
```

Dar permisos de ejecución:

```bash
sudo chmod +x /usr/local/bin/update_frontend.sh

# Ejecutar actualización
sudo /usr/local/bin/update_frontend.sh
```

### 9.2 Rollback en Caso de Errores

Si la actualización falla:

```bash
cd /var/www/bucket_frontend

# Ver commits recientes
git log --oneline -10

# Volver al commit anterior
git reset --hard HEAD~1

# Reconstruir
pnpm build

# Reiniciar
pm2 reload bucket-frontend
```

---

## 10. Optimizaciones de Rendimiento

### 10.1 Configuración de Cache en NGINX

Agregar al archivo de configuración de NGINX:

```nginx
# Configuración de caché
proxy_cache_path /var/cache/nginx/nextjs levels=1:2 keys_zone=nextjs_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    # ... configuración existente ...

    # Caché para páginas estáticas
    location ~* \.(html|json)$ {
        proxy_pass http://nextjs_frontend;
        proxy_cache nextjs_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

Crear directorio de caché:

```bash
sudo mkdir -p /var/cache/nginx/nextjs
sudo chown www-data:www-data /var/cache/nginx/nextjs
sudo systemctl reload nginx
```

### 10.2 Compresión Gzip

NGINX ya tiene gzip habilitado por defecto, pero puedes optimizarlo:

```bash
sudo nano /etc/nginx/nginx.conf
```

Buscar la sección `gzip` y asegurar:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
gzip_disable "msie6";
```

### 10.3 Ajustar Instancias de PM2

Según los recursos del servidor:

```bash
# Ver CPU disponibles
nproc

# Editar ecosystem.config.js
nano /var/www/bucket_frontend/ecosystem.config.js
```

Ajustar `instances`:
- Servidor con 2 CPUs: `instances: 2`
- Servidor con 4 CPUs: `instances: 3` (dejar 1 CPU libre)
- Servidor con 8+ CPUs: `instances: 'max'` (usa todos)

Reiniciar:

```bash
pm2 reload bucket-frontend
pm2 scale bucket-frontend 4  # Cambiar a 4 instancias
```

---

## 11. Seguridad

### 11.1 Configurar Fail2Ban para NGINX

```bash
# Instalar Fail2Ban
sudo apt install fail2ban -y

# Crear filtro para NGINX
sudo nano /etc/fail2ban/filter.d/nginx-limit-req.conf
```

Contenido:

```ini
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
```

Configurar jail:

```bash
sudo nano /etc/fail2ban/jail.local
```

Agregar:

```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/frontend_error.log
maxretry = 5
findtime = 600
bantime = 3600
```

Reiniciar Fail2Ban:

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status nginx-limit-req
```

### 11.2 Rate Limiting en NGINX

Agregar al archivo de configuración:

```nginx
# Límite de peticiones por IP
limit_req_zone $binary_remote_addr zone=frontend_limit:10m rate=10r/s;

server {
    # ... configuración existente ...

    location / {
        limit_req zone=frontend_limit burst=20 nodelay;
        # ... resto de configuración ...
    }
}
```

### 11.3 Headers de Seguridad Adicionales

Ya están configurados en la sección SSL, pero verifica que estén presentes:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

## 12. Respaldos

### 12.1 Script de Respaldo

```bash
sudo mkdir -p /root/scripts
sudo nano /root/scripts/backup_frontend.sh
```

Contenido:

```bash
#!/bin/bash
#
# Script de Respaldo del Frontend
#

FECHA=$(date +%Y-%m-%d_%H%M%S)
BACKUP_DIR="/mnt/backups_bucket/frontend"
SOURCE_DIR="/var/www/bucket_frontend"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# Backup del código (sin node_modules)
echo "[$(date)] Creando backup del frontend..."
tar -czf "$BACKUP_DIR/frontend_$FECHA.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -C "$(dirname $SOURCE_DIR)" "$(basename $SOURCE_DIR)"

# Backup del .env
cp "$SOURCE_DIR/.env.local" "$BACKUP_DIR/.env.local_$FECHA"

# Eliminar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "[$(date)] ✅ Backup completado"
ls -lh "$BACKUP_DIR" | tail -5
```

Dar permisos y automatizar:

```bash
sudo chmod +x /root/scripts/backup_frontend.sh

# Agregar a crontab
sudo crontab -e
```

Agregar línea:

```cron
# Backup del frontend cada semana (domingos a las 2 AM)
0 2 * * 0 /bin/bash /root/scripts/backup_frontend.sh >> /var/log/backup_frontend.log 2>&1
```

---

## 13. Verificación Post-Despliegue

### 13.1 Checklist de Verificación

```bash
# 1. Verificar Node.js y pnpm
node --version
pnpm --version

# 2. Verificar PM2
pm2 status
pm2 list

# 3. Verificar NGINX
sudo systemctl status nginx
sudo nginx -t

# 4. Verificar puertos
sudo netstat -tulpn | grep -E ':(80|443|3000)'

# 5. Verificar logs sin errores
pm2 logs bucket-frontend --lines 50 --nostream
sudo tail -50 /var/log/nginx/frontend_error.log

# 6. Verificar SSL
curl -I https://documentos.cuh.edu.mx

# 7. Probar endpoints del frontend
curl -I https://documentos.cuh.edu.mx
curl -I https://documentos.cuh.edu.mx/_next/static/

# 8. Verificar comunicación con backend
curl http://192.168.16.60:8001/docs
```

### 13.2 Pruebas Funcionales

**Desde el navegador:**

1. ✅ Accede a `https://documentos.cuh.edu.mx`
2. ✅ Verifica que carga correctamente
3. ✅ Prueba el login
4. ✅ Busca un prospecto/alumno
5. ✅ Sube un documento de prueba
6. ✅ Descarga el documento
7. ✅ Verifica los filtros por tipo de documento
8. ✅ Prueba la creación de nuevo prospecto
9. ✅ Verifica el historial de documentos

**Verificar en la consola del navegador (F12):**
- ✅ No debe haber errores de JavaScript
- ✅ No debe haber errores de CORS
- ✅ Las peticiones al backend deben ser exitosas

---

## 14. Troubleshooting

### 14.1 Error: "Cannot find module 'next'"

```bash
cd /var/www/bucket_frontend
pnpm install --frozen-lockfile
pm2 restart bucket-frontend
```

### 14.2 Error: 502 Bad Gateway

```bash
# Verificar que PM2 esté corriendo
pm2 status

# Ver logs de PM2
pm2 logs bucket-frontend --lines 100

# Verificar que Next.js esté en puerto 3000
curl http://localhost:3000

# Reiniciar PM2
pm2 restart bucket-frontend

# Verificar NGINX
sudo nginx -t
sudo systemctl restart nginx
```

### 14.3 Error: "CORS policy blocked"

**Verifica:**
1. Backend tiene configurado el `FRONTEND_URL` correcto
2. Backend tiene el middleware CORS configurado
3. Reinicia el backend: `sudo systemctl restart bucket_api`

```bash
# Ver logs del backend
sudo journalctl -u bucket_api -f

# Probar petición CORS manual
curl -H "Origin: https://documentos.cuh.edu.mx" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://192.168.16.60:8001/token -v
```

### 14.4 Error: "Module not found" después de actualización

```bash
cd /var/www/bucket_frontend

# Limpiar caché
rm -rf .next node_modules

# Reinstalar todo
pnpm install
pnpm build

# Reiniciar
pm2 restart bucket-frontend
```

### 14.5 Alto uso de memoria

```bash
# Ver uso de memoria
pm2 monit

# Reducir instancias
pm2 scale bucket-frontend 1

# O ajustar max_memory_restart en ecosystem.config.js
nano /var/www/bucket_frontend/ecosystem.config.js
# Cambiar: max_memory_restart: '512M'

pm2 reload bucket-frontend
```

---

## 15. Comandos Útiles

### 15.1 Gestión de PM2

```bash
# Ver todas las apps
pm2 list

# Ver logs en tiempo real
pm2 logs bucket-frontend

# Ver logs de las últimas 200 líneas
pm2 logs bucket-frontend --lines 200

# Ver solo errores
pm2 logs bucket-frontend --err

# Ver información detallada
pm2 show bucket-frontend

# Monitorear CPU/RAM en tiempo real
pm2 monit

# Reiniciar (con downtime mínimo)
pm2 restart bucket-frontend

# Recargar (sin downtime)
pm2 reload bucket-frontend

# Detener
pm2 stop bucket-frontend

# Iniciar
pm2 start ecosystem.config.js

# Escalar instancias
pm2 scale bucket-frontend 4

# Guardar configuración
pm2 save

# Ver procesos del sistema
pm2 prettylist
```

### 15.2 Gestión de NGINX

```bash
# Verificar sintaxis
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Recargar (sin downtime)
sudo systemctl reload nginx

# Ver estado
sudo systemctl status nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/frontend_access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/frontend_error.log

# Ver configuración activa
sudo nginx -T

# Ver sitios habilitados
ls -la /etc/nginx/sites-enabled/
```

### 15.3 Gestión de Certificados SSL

```bash
# Renovar certificados manualmente
sudo certbot renew

# Probar renovación
sudo certbot renew --dry-run

# Ver certificados instalados
sudo certbot certificates

# Revocar certificado
sudo certbot revoke --cert-path /etc/letsencrypt/live/documentos.cuh.edu.mx/cert.pem

# Eliminar certificado
sudo certbot delete --cert-name documentos.cuh.edu.mx
```

---

## 16. Mantenimiento Programado

### 16.1 Tareas Semanales

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Verificar espacio en disco
df -h

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d

# Verificar certificados SSL (30 días antes de expirar)
sudo certbot certificates | grep "VALID"
```

### 16.2 Tareas Mensuales

```bash
# Revisar logs de errores
sudo grep -i error /var/log/nginx/frontend_error.log | tail -100

# Actualizar dependencias de Node.js
cd /var/www/bucket_frontend
pnpm update

# Verificar rendimiento
pm2 monit

# Revisar uso de disco
du -sh /var/www/bucket_frontend/
```

### 16.3 Actualización de Next.js

```bash
cd /var/www/bucket_frontend

# Ver versión actual
pnpm list next

# Actualizar Next.js (minor/patch)
pnpm update next

# Actualizar Next.js (major version - CUIDADO)
# pnpm add next@latest

# Rebuild y reiniciar
pnpm build
pm2 reload bucket-frontend
```

---

## 17. Documentación Adicional

### 17.1 URLs Importantes

- **Frontend:** https://documentos.cuh.edu.mx
- **Backend API:** http://192.168.16.60:8001
- **Backend Docs:** http://192.168.16.60:8001/docs
- **Repositorio Backend:** https://github.com/Centro-Universitario-Hidalguense/bucket_cuh
- **Repositorio Frontend:** https://github.com/Centro-Universitario-Hidalguense/bucket_frontend

### 17.2 Estructura del Proyecto

```
/var/www/bucket_frontend/
├── .next/                    # Build de producción
├── app/                      # Páginas y rutas (Next.js App Router)
│   ├── page.tsx             # Página principal
│   ├── layout.tsx           # Layout principal
│   ├── login/               # Página de login
│   ├── buckets/[bucket]/    # Vista de documentos por alumno
│   └── api/                 # API routes de Next.js
├── components/              # Componentes React
│   ├── document-dashboard.tsx
│   ├── document-list.tsx
│   ├── bulk-upload-dialog.tsx
│   └── ui/                  # Componentes UI (Radix)
├── lib/                     # Utilidades
│   ├── api-client.ts        # Cliente HTTP para backend
│   └── auth.ts              # Autenticación
├── types/                   # Tipos TypeScript
├── public/                  # Assets estáticos
├── .env.local              # Variables de entorno
├── ecosystem.config.js     # Configuración PM2
├── next.config.mjs         # Configuración Next.js
├── package.json            # Dependencias
└── pnpm-lock.yaml          # Lock file
```

### 17.3 Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://192.168.16.60:8001  # URL del backend
NEXT_PUBLIC_TOKEN_URL=http://192.168.16.60:8001/token
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 18. Contacto y Soporte

**Equipo de Desarrollo:**
- Centro Universitario Hidalguense
- Repositorio Frontend: https://github.com/Centro-Universitario-Hidalguense/bucket_frontend
- Repositorio Backend: https://github.com/Centro-Universitario-Hidalguense/bucket_cuh

**Logs importantes para reportar problemas:**
```bash
# Frontend (Next.js/PM2)
pm2 logs bucket-frontend --lines 200 > frontend_logs.txt

# NGINX
sudo tail -200 /var/log/nginx/frontend_error.log > nginx_logs.txt

# Sistema
sudo journalctl -xe > system_logs.txt
```

**Información del sistema:**
```bash
# Versiones
node --version
pnpm --version
pm2 --version
nginx -v
cat /etc/os-release

# Estado de servicios
pm2 status
sudo systemctl status nginx
df -h
free -h
```

---

## 19. Referencias

- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
- **NGINX Documentation:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices

---

## Fin del Documento

**Versión:** 1.0
**Última actualización:** 16 de Diciembre, 2025
**Estado:** Producción
**Servidor:** Ubuntu Server 22.04 LTS
**Framework:** Next.js 15.1.3 + React 19.0.0
