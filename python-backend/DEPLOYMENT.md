# 🚀 Deployment Guide - Railway.app & Render

## Option 1: Railway.app (Easiest - Free)

### 1. Prepare Repository

```bash
# Create .env.production
# Copy from .env but use only free tier providers

# Push to GitHub
git add .
git commit -m "Add Python AI Backend"
git push origin main
```

### 2. Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd python-backend
railway init

# Link to repo
railway link

# Deploy
railway up
```

### 3. Set Environment Variables

```bash
railway variables set \
  REDIS_URL="<railway-redis-url>" \
  GOOGLE_GEMINI_API_KEY="your-key" \
  GROQ_API_KEY="your-key" \
  OPENAI_API_KEY="your-key"
```

### 4. Add Redis

In Railway dashboard:
1. Click "Add Service"
2. Select "Redis"
3. Connect to main app

### 5. Get Backend URL

```bash
railway status

# Copy the URL: https://xxxx.railway.app
```

## Option 2: Render.com (Also Easy - Free)

### 1. Connect GitHub

1. Go to https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repo (python-backend folder)

### 2. Configure

- **Name:** edulms-ai-backend
- **Environment:** Python 3.11
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python main.py`

### 3. Add Environment Variables

In Settings → Environment:
```
REDIS_URL=redis://default:...@redis...
GOOGLE_GEMINI_API_KEY=your-key
GROQ_API_KEY=your-key
...
```

### 4. Add Redis

1. Click "Add" → "PostgreSQL"
2. Wait for connection
3. Copy Redis URL

### 5. Deploy

Click "Deploy" and wait 5-10 minutes

## Option 3: Self-Hosted (Full Control)

### 1. Linux Server (Ubuntu)

```bash
# Update system
sudo apt update && apt upgrade -y

# Install Python & Redis
sudo apt install python3.11 python3-pip redis-server -y

# Install Tesseract
sudo apt install tesseract-ocr -y

# Clone repo
git clone <your-repo>
cd Education/python-backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/edulms-ai.service
```

Paste:
```ini
[Unit]
Description=EduLMS AI Backend
After=network.target redis-server.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/deploy/Education/python-backend
Environment="PATH=/home/deploy/Education/python-backend/venv/bin"
ExecStart=/home/deploy/Education/python-backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable edulms-ai
sudo systemctl start edulms-ai

# Check status
sudo systemctl status edulms-ai
```

### 2. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/edulms-ai

# Paste:
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable
sudo ln -s /etc/nginx/sites-available/edulms-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

## Production Environment File

Create `.env.production`:

```bash
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False

# Redis
REDIS_URL=redis://production-redis-url:6379

# APIs (use only ones with generous free tier)
GROQ_API_KEY=xxxx  # 14 RPM free
GOOGLE_GEMINI_API_KEY=xxxx  # 60 RPM free
HUGGINGFACE_API_KEY=xxxx  # Free tier
OPENAI_API_KEY=xxxx  # Only for emergencies (pay per use)

# Optional
ANTHROPIC_API_KEY=xxxx
COHERE_API_KEY=xxxx

# Rate limiting (adjust for traffic)
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_PERIOD=3600
```

## Monitoring & Logging

### Railway
```bash
railway logs -f
```

### Render
In dashboard → Logs

### Self-hosted
```bash
sudo journalctl -u edulms-ai -f
```

## Update Deployment

### Push New Changes

```bash
git add .
git commit -m "Update AI providers"
git push origin main
```

### Railway Auto-redeploy
Will automatically redeploy on push

### Render Manual Redeploy
Click "Manual Deploy" in dashboard

### Self-hosted
```bash
cd /home/deploy/Education/python-backend
git pull
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart edulms-ai
```

## Traffic Scaling

### Low Traffic (< 100 users/day)
- Single instance
- No caching needed
- Any free API tier works

### Medium Traffic (100-1000 users/day)
- Add Redis
- Rate limiting: 100 requests/minute per user
- Use multiple cheap APIs

### High Traffic (1000+ users/day)
- Multiple backend instances
- Load balancer (Nginx/HAProxy)
- Aggressive caching (24-48 hours TTL)
- Dedicated API keys per provider
- Consider paid APIs for critical paths

## Cost Estimation

**Free Tier (Recommended):**
- Railway: $0 (dormancy after 0.5 hrs)
- Render: $0 (free tier)
- Self-hosted: $5-10/month (cheapest VPS)

**Low Cost:**
- Groq: Free (14 RPM)
- Gemini: Free (60 RPM)
- HuggingFace: Free
- **Total: $0 with free APIs**

**Scale Up:**
- OpenAI GPT-4o mini: $0.15 per 1M input tokens
- At 1000 requests/day: ~$5-10/month
- Render paid: $7-12/month
- Redis: Free with Render

## Troubleshooting

### Backend not responding
```bash
# Check if service is running
sudo systemctl status edulms-ai

# Check logs
sudo journalctl -u edulms-ai -n 50

# Restart
sudo systemctl restart edulms-ai
```

### API keys not working
- Check .env file
- Verify keys are correct
- Check rate limits on provider dashboards
- Ensure Redis connection if caching enabled

### High latency
- Check Redis connection
- Monitor API provider response times
- Check if hitting rate limits
- Scale to multiple instances

### Memory issues
- Reduce image size limits
- Enable image compression
- Clear old Redis cache
- Monitor with: `free -h`

## Database Backup (Production)

### Redis Backup
```bash
# Manual backup
redis-cli BGSAVE

# Get backup
scp user@server:/var/lib/redis/dump.rdb .

# Restore
redis-cli --pipe < dump.rdb
```

## SSL Certificates

### Auto-renew
```bash
sudo certbot renew --dry-run
```

### Manual renew
```bash
sudo certbot renew --force-renewal
```

## CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'python-backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link --project ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Performance Optimization

1. **Enable response caching** (24-48 hours)
2. **Compress images** before storing
3. **Use CDN** for static images
4. **Batch requests** where possible
5. **Monitor slow queries** and optimize
6. **Use async operations** everywhere
7. **Implement circuit breaker** for failing APIs

## Next Steps

1. ✅ Choose deployment platform (Railway/Render/Self-hosted)
2. ✅ Configure environment variables
3. ✅ Deploy backend
4. ✅ Test endpoints
5. ✅ Update frontend API URL
6. ✅ Monitor in production
7. ✅ Scale as needed

🎉 You're ready to deploy!
