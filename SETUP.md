# Development Setup Guide

## Prerequisites

- Node.js 18+
- pnpm 8+
- Git
- VSCode (recommended)

## Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/chatbotti.git
cd chatbotti
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy environment files
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/cdn/.env.example apps/cdn/.env
```

Required environment variables:
```env
# Database (PlanetScale/Neon)
DATABASE_URL="mysql://..."

# Auth.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."

# File Storage (Uploadthing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Redis
REDIS_URL="redis://..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Development Workflow

1. Start all services:
```bash
pnpm dev
```

This will start:
- Landing page: http://localhost:3000
- Socket server: http://localhost:8080
- CDN build: http://localhost:5173
- Widget dev: http://localhost:5174

2. Run tests:
```bash
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
```

3. Lint code:
```bash
pnpm lint
pnpm format
```

## Project Structure

```
apps/
  web/           # Landing page
  dashboard/     # Dashboard
  socket/        # Socket.io server
packages/
  chatbot/       # Widget library
  ui/           # Shared components
  database/     # Database models and utils
  config/       # Shared configurations
```

## Database Setup

1. Install Prisma CLI:
```bash
pnpm add -g prisma
```

2. Run migrations:
```bash
cd apps/web
pnpm prisma migrate dev
```

3. Generate Prisma Client:
```bash
pnpm prisma generate
```

## Socket.io Development

1. Socket events are typed:
```typescript
interface ServerToClientEvents {
  botResponse: (msg: Message) => void;
}

interface ClientToServerEvents {
  userMessage: (msg: Message) => void;
}
```

2. Test socket connections:
```bash
# Terminal 1: Start socket server
cd apps/socket
pnpm dev

# Terminal 2: Run socket tests
pnpm test:socket
```

## Widget Development

1. Build widget:
```bash
cd packages/chatbot
pnpm build
```

2. Test locally:
```html
<div id="chatbot"></div>
<script src="http://localhost:5173/index.js"></script>
<script>
   Chatbot.mount(document.getElementById('chatbot'), {
       api_key: "test-key"
    })
</script>
```

## Common Tasks

### Adding a New Feature
1. Create feature branch:
```bash
git checkout -b feature/feature-name
```

2. Implement following MVP approach:
   - Basic functionality first
   - Add types
   - Write tests
   - Add documentation

3. Create PR with:
   - Feature description
   - Testing instructions
   - Screenshots/videos if UI changes

### Database Changes
1. Create migration:
```bash
cd apps/web
pnpm prisma migrate dev --name feature_name
```

2. Update schema:
```prisma
model Feature {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

3. Generate client:
```bash
pnpm prisma generate
```

### Adding API Endpoints
1. Create route handler:
```typescript
// apps/web/app/api/feature/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    // Handle request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

## Troubleshooting

### Common Issues

1. Database connection errors:
- Check DATABASE_URL in .env
- Ensure database is running
- Try `pnpm prisma generate`

2. Socket connection issues:
- Check CORS settings
- Verify port settings
- Check client connection URL

3. Build errors:
- Clear build cache: `pnpm clean`
- Remove node_modules: `pnpm clean:modules`
- Reinstall: `pnpm install`

### Getting Help

1. Check documentation:
- Project docs in /docs
- Component docs in packages/*/README.md

2. Debug tools:
- Browser console for widget issues
- Socket.io admin UI for socket issues
- Prisma Studio for database inspection

3. Development tools:
- VSCode debugger
- React DevTools
- Network inspector
