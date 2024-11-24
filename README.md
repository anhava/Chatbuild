# Chatbotti

A modern AI chatbot platform with real-time chat capabilities and custom training.

## Features

### AI Chatbot
- Train on your custom data
- Upload files (PDF, DOCX, TXT, CSV)
- Add website URLs and sitemaps
- Real-time responses

### Live Chat
- Real-time communication with customers
- Agent dashboard
- Chat assignment system
- Typing indicators

### Analytics & History
- Chat history tracking
- Usage analytics
- Performance metrics
- Export capabilities

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment:
```bash
cp .env.example .env
```

3. Start development:
```bash
pnpm dev
```

## Integration

Add to your website:
```html
<div id="chatbot"></div>
<script src="https://unpkg.com/@aihiochat/cdn@latest/dist/index.js"></script>
<script>
   Chatbot.mount(document.getElementById('chatbot'), {
       api_key: "your-api-key"
    })
</script>
```

## Plans & Pricing

### Pro (€39.99/mo)
- 5k messages
- Live chat
- 100 web pages
- 10 file uploads
- Basic support

### Premium (€84.99/mo)
- 20k messages
- Live chat
- 200 web pages
- 10 file uploads
- Priority support

### Enterprise (€349.99/mo)
- 100k messages
- Live chat
- 500 web pages
- 20 file uploads
- Priority phone support

## Project Structure

```
apps/
  web/           # Landing page
  dashboard/     # Dashboard
  socket/        # Socket.io server
packages/
  chatbot/       # Widget library
  ui/           # Shared components
  database/     # Database models
  config/       # Shared configs
```

## Documentation

- [Setup Guide](SETUP.md) - Development setup instructions
- [Deployment Guide](DEPLOYMENT.md) - Production deployment guide
- [Implementation Plan](TODO.md) - Feature implementation roadmap

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React Server Components
- Tailwind CSS
- shadcn/ui components

### Backend
- Socket.io with TypeScript
- Prisma + PlanetScale/Neon
- tRPC
- Auth.js

### Infrastructure
- Vercel deployment
- Redis Cloud
- Uploadthing
- Edge Functions

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+
- Git

### Commands
```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Create pull request

See [SETUP.md](SETUP.md) for detailed development instructions.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Implementation Plan

See [TODO.md](TODO.md) for the feature implementation roadmap.

## License

[MIT License](LICENSE)

## Support

- Email: support@chatbotti.com
- Documentation: https://docs.chatbotti.com
- Community Forum: https://community.chatbotti.com
