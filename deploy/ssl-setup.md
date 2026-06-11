# SSL Setup con Let's Encrypt

Requisitos: dominio apuntando al VPS, puertos 80/80 abiertos.

```bash
# 1. Instalar certbot
sudo apt install certbot python3-certbot-nginx

# 2. Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# 3. Verificar renovación automática
sudo certbot renew --dry-run
```

## nginx con SSL (una vez emitido el certificado)

Reemplazar `frontend/nginx.conf` o crear un segundo server block:

```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # mismo contenido del location /, /api/, /ws/ que en nginx.conf
}

server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}
```

## Alternativa: Caddy (SSL automático)

Si preferís no lidiar con certbot, usá Caddy en vez de nginx:

```dockerfile
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist/ /usr/share/caddy/
```

```caddyfile
tudominio.com {
    root * /usr/share/caddy
    try_files {path} /index.html
    reverse_proxy /api/* backend:8080
    reverse_proxy /ws/* backend:8080
}
```

Caddy obtiene y renueva SSL automáticamente.
