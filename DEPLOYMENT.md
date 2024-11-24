# Deployment Guide

## Infrastructure Overview

### Services Used
- **Vercel**: Frontend deployment
- **PlanetScale/Neon**: Database
- **Redis Cloud**: Caching & real-time features
- **Uploadthing**: File handling
- **OpenAI**: AI integration
- **Stripe**: Payment processing

## Deployment Setup

### 1. Database (PlanetScale/Neon)

1. Create database:
```bash
# Using PlanetScale CLI
pscale database create chatbotti production

# Or using Neon dashboard
- Create new project
- Get connection string
```

2. Run migrations:
```bash
# Production migration
pnpm prisma migrate deploy
```

3. Set up connection pooling for better performance

### 2. Vercel Deployment

1. Import projects:
```bash
# Landing page & API
vercel --cwd apps/web

# Dashboard
vercel --cwd apps/dashboard
```

2. Configure environment variables:
```env
# Database
DATABASE_URL="mysql://..."

# Auth
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"

# OpenAI
OPENAI_API_KEY="sk-..."

# Redis
REDIS_URL="redis://..."

# Stripe
STRIPE_SECRET_KEY="sk-live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Upload
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."
```

3. Set up Edge Config:
```bash
# Create Edge Config
vercel edge-config add chatbotti-config

# Add configurations
vercel edge-config set feature-flags.live-chat true
```

### 3. Socket Server Deployment

1. Deploy to Vercel:
```bash
vercel --cwd apps/socket
```

2. Configure WebSocket settings:
```env
# Socket server
SOCKET_SERVER_URL="wss://your-socket-server.com"
CORS_ORIGIN="https://your-domain.com"
```

### 4. CDN Setup

1. Build widget:
```bash
# Build widget
cd packages/chatbot
pnpm build

# Deploy to CDN
vercel --cwd dist
```

2. Configure CORS and caching:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring & Scaling

### 1. Error Tracking

1. Set up Sentry:
```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

2. Configure error boundaries and monitoring

### 2. Performance Monitoring

1. Set up Vercel Analytics:
```typescript
export function Analytics() {
  return <Analytics />;
}
```

2. Configure custom metrics:
```typescript
// Track important events
export function trackEvent(name: string, data: any) {
  // Implementation
}
```

### 3. Scaling Configuration

1. Database scaling:
```bash
# Scale PlanetScale
pscale branch scale production --size large

# Or scale Neon compute units
```

2. Redis scaling:
```bash
# Increase Redis memory
redis-cli CONFIG SET maxmemory 2gb
```

3. Socket server scaling:
```typescript
// Enable sticky sessions
const io = new Server({
  adapter: createAdapter(),
  sticky: true
});
```

## Security Setup

### 1. API Security

1. Configure rate limiting:
```typescript
// apps/web/middleware.ts
import { Ratelimit } from "@upstash/ratelimit"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

2. Set up CORS:
```typescript
// apps/web/middleware.ts
export const config = {
  matcher: '/api/:path*',
}

export function middleware(request: Request) {
  // CORS logic
}
```

### 2. Authentication

1. Configure Auth.js for production:
```typescript
export const authOptions = {
  providers: [
    // Production providers
  ],
  session: {
    strategy: 'database'
  }
}
```

2. Set up secure session handling

### 3. File Upload Security

1. Configure Uploadthing:
```typescript
export const ourFileRouter = {
  chatbotFile: f({ pdf: { maxFileSize: "10MB" } })
    .middleware(async ({ req }) => {
      // Auth & validation
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Handle upload
    })
}
```

## Backup & Recovery

### 1. Database Backups

1. Automated backups:
```bash
# PlanetScale backup
pscale backup create chatbotti production

# Or Neon backup
neonctl backup create
```

2. Configure backup schedule

### 2. File Backups

1. Set up file replication:
```typescript
// Backup important files
async function backupFiles() {
  // Implementation
}
```

2. Configure backup retention policy

## Post-Deployment

### 1. Monitoring Setup

1. Set up alerts:
```typescript
// Configure alert thresholds
const ALERT_THRESHOLDS = {
  errorRate: 0.01,
  responseTime: 1000,
  cpuUsage: 80
}
```

2. Configure dashboards

### 2. Documentation

1. Update API documentation
2. Update integration guides
3. Update troubleshooting guides

### 3. Support Setup

1. Configure support channels
2. Set up error reporting workflow
3. Create incident response plan
