# 🚀 Production Deployment Guide

Complete guide to deploying your PWA Chatbot to production using Docker.

---

## 📋 Pre-Deployment Checklist

### Required:
- [ ] OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- [ ] Domain name configured (for HTTPS)
- [ ] SSL/TLS certificate (Let's Encrypt recommended)
- [ ] Server with Docker and Docker Compose installed
- [ ] Min 2GB RAM, 10GB disk space

### Optional:
- [ ] Anthropic API key for Claude support
- [ ] Monitoring service (Sentry, DataDog, etc.)
- [ ] CDN for static assets
- [ ] Backup strategy

---

## 🔧 Step 1: Server Setup

### Install Docker & Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## 🔑 Step 2: Configure Environment

### 2.1 Clone Repository

```bash
git clone <your-repo-url>
cd pwa_template
```

### 2.2 Configure Production Environment

```bash
# Copy the production template
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

### 2.3 Required Configuration

**CRITICAL - Must Change:**

```bash
# Generate secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
echo "Generated SECRET_KEY: $SECRET_KEY"

# Add to .env.production:
SECRET_KEY=<your-generated-key>
OPENAI_API_KEY=<your-openai-key>
```

**Security Settings:**

```bash
# Enable HTTPS (only when you have SSL configured)
SESSION_COOKIE_SECURE=True
FORCE_HTTPS=True
```

**CORS Configuration:**

```bash
# Add your actual domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Rate Limiting:**

```bash
# Adjust based on your needs
RATELIMIT_PER_MINUTE=20
RATELIMIT_PER_HOUR=200
RATELIMIT_PER_DAY=1000
```

---

## 🐳 Step 3: Deploy with Docker

### 3.1 Build Images

```bash
# Build the application
docker compose build

# This will:
# - Build frontend with webpack (production mode)
# - Build backend with all dependencies
# - Create optimized multi-stage image
```

### 3.2 Start Services

```bash
# Start in detached mode
docker compose --env-file .env.production up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### 3.3 Verify Deployment

```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Expected response:
# {"status":"healthy","version":"1.0.0","services":{"openai":true,"claude":false}}
```

---

## 🌐 Step 4: Configure Reverse Proxy

### Option A: Nginx

```nginx
# /etc/nginx/sites-available/pwa-chatbot

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSE streaming support
    location /api/chat/stream {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE specific
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:5001;
        access_log off;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/pwa-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option B: Caddy (Automatic HTTPS)

```caddyfile
# Caddyfile

yourdomain.com {
    reverse_proxy localhost:5001

    # SSE streaming
    @streaming {
        path /api/chat/stream
    }
    reverse_proxy @streaming localhost:5001 {
        flush_interval -1
    }
}
```

Start Caddy:

```bash
sudo caddy start --config Caddyfile
```

---

## 🔒 Step 5: SSL/TLS Setup (Let's Encrypt)

### With Certbot:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔍 Step 6: Monitoring & Maintenance

### View Logs

```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f redis

# Last 100 lines
docker compose logs --tail=100
```

### Health Checks

```bash
# Check container health
docker compose ps

# Manual health check
curl https://yourdomain.com/api/health
```

### Backup Redis Data

```bash
# Backup Redis data
docker compose exec redis redis-cli BGSAVE

# Copy backup
docker cp pwa-redis:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d

# Or use zero-downtime update:
docker compose --env-file .env.production up -d --no-deps --build web
```

---

## 🛡️ Step 7: Security Hardening

### Firewall Setup

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Docker Security

```bash
# Run containers as non-root (add to docker-compose.yml)
user: "1000:1000"

# Limit container resources
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### Regular Updates

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

---

## 📊 Step 8: Performance Optimization

### Enable Gzip Compression (Nginx)

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss
           application/rss+xml font/truetype font/opentype
           application/vnd.ms-fontobject image/svg+xml;
```

### Enable HTTP/2

Already enabled in the Nginx config above with `http2` directive.

### Cache Static Assets

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs web

# Common issues:
# 1. Missing environment variables
# 2. Port already in use
# 3. Invalid configuration

# Fix and restart
docker compose down
docker compose --env-file .env.production up -d
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit container memory in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
```

### SSL Certificate Issues

```bash
# Test certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check nginx config
sudo nginx -t
```

### Redis Connection Issues

```bash
# Check Redis
docker compose exec redis redis-cli ping

# Should return: PONG

# Check connection from web container
docker compose exec web curl redis:6379
```

---

## 📈 Scaling (Optional)

### Horizontal Scaling

```yaml
# docker-compose.yml
web:
  deploy:
    replicas: 3

# Requires:
# - Load balancer (nginx upstream)
# - Shared Redis session storage
# - Database for conversation persistence
```

### Load Balancer (Nginx)

```nginx
upstream pwa_backend {
    least_conn;
    server localhost:5001;
    server localhost:5002;
    server localhost:5003;
}

server {
    location / {
        proxy_pass http://pwa_backend;
    }
}
```

---

## 🔄 Backup & Restore

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup Redis
docker compose exec redis redis-cli BGSAVE
sleep 2
docker cp pwa-redis:/data/dump.rdb $BACKUP_DIR/redis-$DATE.rdb

# Backup environment (without secrets)
cp .env.production $BACKUP_DIR/env-$DATE.bak

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "redis-*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Restore

```bash
# Stop containers
docker compose down

# Restore Redis data
docker cp ./backups/redis-YYYYMMDD.rdb pwa-redis:/data/dump.rdb

# Start containers
docker compose --env-file .env.production up -d
```

---

## 📞 Support & Maintenance

### Health Monitoring

Set up automated health checks:

```bash
# Add to crontab
*/5 * * * * curl -f https://yourdomain.com/api/health || echo "Health check failed" | mail -s "PWA Alert" admin@yourdomain.com
```

### Log Rotation

Docker handles log rotation by default, but you can configure:

```bash
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## ✅ Post-Deployment Verification

1. [ ] Application accessible via HTTPS
2. [ ] Health endpoint returns 200
3. [ ] Can send chat messages successfully
4. [ ] Token counter displays usage
5. [ ] SSL certificate valid (check with SSL Labs)
6. [ ] Security headers present (check with securityheaders.com)
7. [ ] Rate limiting works
8. [ ] Error tracking configured (if using Sentry)
9. [ ] Monitoring dashboards set up
10. [ ] Backup script tested

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**Last Updated:** 2025-10-08
**Version:** 1.0.0
