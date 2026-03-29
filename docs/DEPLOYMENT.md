# Deployment Guide

This guide covers deploying Smart Evaluation to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [AI Services Deployment](#ai-services-deployment)
- [Docker Deployment](#docker-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Security Considerations](#security-considerations)
- [Scaling](#scaling)

## Prerequisites

### Required Software
- Node.js 18+ LTS
- MongoDB 5.0+
- Nginx (for production)
- PM2 (process manager)
- Docker & Docker Compose (optional)
- SSL certificate

### Cloud Providers
- **AWS**: EC2, RDS, S3, CloudFront
- **Google Cloud**: Compute Engine, Cloud SQL, Cloud Storage
- **Azure**: Virtual Machines, Cosmos DB, Blob Storage
- **DigitalOcean**: Droplets, Managed Databases, Spaces

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```bash
# Database
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/smartevaluation
DB_NAME=smartevaluation

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=5000

# AI Services
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_VISION_API_KEY=your-google-vision-api-key

# File Storage
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# CORS & Security
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/smart-evaluation/app.log
```

## Database Setup

### MongoDB Configuration

1. **Install MongoDB**:
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# CentOS/RHEL
sudo yum install -y mongodb

# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:5.0
```

2. **Create Database and User**:
```javascript
// Connect to MongoDB
mongo

// Create database and user
use smartevaluation
db.createUser({
  user: "smarteval",
  pwd: "secure-password",
  roles: [
    { role: "readWrite", db: "smartevaluation" }
  ]
})
```

3. **Enable Authentication**:
```bash
# Edit /etc/mongod.conf
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

4. **Create Indexes**:
```javascript
// Connect to your database
mongo smartevaluation

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.marks.createIndex({ studentId: 1, date: -1 })
db.marks.createIndex({ teacherId: 1, date: -1 })
db.marks.createIndex({ evaluationId: 1 }, { unique: true })
db.subjects.createIndex({ teacherId: 1 })
db.subjects.createIndex({ code: 1 }, { unique: true })
```

## Backend Deployment

### Using PM2

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Create PM2 Configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'smart-evaluation-server',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/smart-evaluation/error.log',
    out_file: '/var/log/smart-evaluation/out.log',
    log_file: '/var/log/smart-evaluation/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

3. **Deploy with PM2**:
```bash
# Install dependencies
cd server && npm ci --production

# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Using Systemd

1. **Create service file** (`/etc/systemd/system/smart-evaluation.service`):
```ini
[Unit]
Description=Smart Evaluation Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/smart-evaluation/server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

2. **Enable and start service**:
```bash
sudo systemctl enable smart-evaluation
sudo systemctl start smart-evaluation
sudo systemctl status smart-evaluation
```

## Frontend Deployment

### Build for Production

1. **Install dependencies and build**:
```bash
cd client
npm ci
npm run build
```

2. **Configure Nginx** (`/etc/nginx/sites-available/smart-evaluation`):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Frontend
    location / {
        root /var/www/smart-evaluation/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        alias /var/www/smart-evaluation/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

3. **Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/smart-evaluation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Deploy to Vercel (Alternative)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Configure vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

3. **Deploy**:
```bash
cd client
vercel --prod
```

## AI Services Deployment

### Individual Service Deployment

1. **Deploy each AI service**:
```bash
cd ai-services

# OCR Service
PORT=8001 npm run ocr

# Evaluation Service  
PORT=8002 npm run evaluation

# Feedback Service
PORT=8003 npm run feedback

# Analytics Service
PORT=8004 npm run analytics

# Study Planner Service
PORT=8005 npm run trainer
```

2. **Create PM2 configuration for AI services**:
```javascript
module.exports = {
  apps: [
    {
      name: 'ocr-service',
      script: './ai-services/ocr/ocrAgent.js',
      instances: 2,
      env_production: {
        PORT: 8001,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'evaluation-service',
      script: './ai-services/evaluation/evaluationAgent.js',
      instances: 2,
      env_production: {
        PORT: 8002,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'feedback-service',
      script: './ai-services/feedback/feedbackAgent.js',
      instances: 2,
      env_production: {
        PORT: 8003,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'analytics-service',
      script: './ai-services/analytics/performanceAgent.js',
      instances: 2,
      env_production: {
        PORT: 8004,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'trainer-service',
      script: './ai-services/trainer/studyPlannerAgent.js',
      instances: 2,
      env_production: {
        PORT: 8005,
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## Docker Deployment

### Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: smart-eval-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: smartevaluation
    volumes:
      - mongodb_data:/data/db
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    container_name: smart-eval-redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: smart-eval-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/smartevaluation?authSource=admin
      REDIS_URL: redis://redis:6379
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis

  ocr-service:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.ocr
    container_name: smart-eval-ocr
    restart: unless-stopped
    environment:
      PORT: 8001
    ports:
      - "8001:8001"

  evaluation-service:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.evaluation
    container_name: smart-eval-evaluation
    restart: unless-stopped
    environment:
      PORT: 8002
    ports:
      - "8002:8002"

  feedback-service:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.feedback
    container_name: smart-eval-feedback
    restart: unless-stopped
    environment:
      PORT: 8003
    ports:
      - "8003:8003"

  analytics-service:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.analytics
    container_name: smart-eval-analytics
    restart: unless-stopped
    environment:
      PORT: 8004
    ports:
      - "8004:8004"

  trainer-service:
    build:
      context: ./ai-services
      dockerfile: Dockerfile.trainer
    container_name: smart-eval-trainer
    restart: unless-stopped
    environment:
      PORT: 8005
    ports:
      - "8005:8005"

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: smart-eval-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: smart-eval-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  mongodb_data:
```

### Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3 --scale ocr-service=2

# Update services
docker-compose pull
docker-compose up -d
```

## Monitoring & Logging

### Application Monitoring

1. **Install monitoring tools**:
```bash
# For PM2
pm2 install pm2-server-monit

# For Docker
docker run -d --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:rw \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor:latest
```

2. **Set up log rotation** (`/etc/logrotate.d/smart-evaluation`):
```
/var/log/smart-evaluation/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Checks

Add health check endpoints to monitor service status:

```javascript
// server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

## Security Considerations

### SSL/TLS Configuration

1. **Generate SSL certificate**:
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or use self-signed for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

2. **Configure security headers**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Firewall Configuration

```bash
# UFW configuration
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5000/tcp  # Deny direct backend access
sudo ufw deny 8001:8005/tcp  # Deny direct AI service access
sudo ufw enable
```

## Scaling

### Horizontal Scaling

1. **Load Balancer Configuration**:
```nginx
upstream backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

2. **Database Scaling**:
```javascript
// MongoDB replica set configuration
const replicaSet = {
  _id: "smart-eval-set",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
};
```

### Auto-scaling with Kubernetes

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smart-evaluation-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smart-evaluation-backend
  template:
    metadata:
      labels:
        app: smart-evaluation-backend
    spec:
      containers:
      - name: backend
        image: your-registry/smart-evaluation-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: smart-evaluation-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: smart-evaluation-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Backup Strategy

### Database Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
DB_NAME="smartevaluation"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --host localhost:27017 \
  --db $DB_NAME \
  --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Automated Backup

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly backup to cloud storage
0 3 * * 0 aws s3 sync /backup/mongodb s3://your-backup-bucket/mongodb
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**:
```bash
# Check memory usage
pm2 monit

# Restart with increased memory
pm2 restart smart-evaluation-server --max-memory-restart 1G
```

2. **Database Connection Issues**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --eval "db.adminCommand('ismaster')"
```

3. **File Upload Issues**:
```bash
# Check disk space
df -h

# Check permissions
ls -la /var/www/uploads/

# Fix permissions
sudo chown -R www-data:www-data /var/www/uploads/
sudo chmod -R 755 /var/www/uploads/
```

### Performance Optimization

1. **Enable Caching**:
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache API responses
app.get('/api/student/performance/:id', async (req, res) => {
  const cacheKey = `performance:${req.params.id}`;
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const data = await getPerformanceData(req.params.id);
  await client.setex(cacheKey, 300, JSON.stringify(data)); // 5 minutes
  res.json(data);
});
```

2. **Database Optimization**:
```javascript
// Use aggregation for complex queries
const pipeline = [
  { $match: { studentId: ObjectId(studentId) } },
  { $group: { _id: '$subject', avgScore: { $avg: '$marks' } } },
  { $sort: { avgScore: -1 } }
];

const results = await Marks.aggregate(pipeline);
```

This deployment guide covers all aspects of deploying Smart Evaluation to production. Adjust configurations based on your specific requirements and infrastructure.
