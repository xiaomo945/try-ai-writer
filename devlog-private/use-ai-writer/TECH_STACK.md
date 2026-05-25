# Use AI Writer — 技术架构
- Next.js 16, TypeScript 5 strict, Tailwind CSS 4
- AI: DeepSeek V3.2 + Claude Sonnet 4.6
- 认证: NextAuth.js v5 (Google + Apple)
- 支付: Creem, 部署: Vercel
- 核心路由: /api/generate, /api/auth/[...nextauth], /api/payment/checkout, /api/file/process, /api/history/search, /api/edit, /api/brand-voice/samples, /api/brand-voice/upload-document
- 核心库: ai-providers, brand-voice, creative-interview, prompt-builder, memory-bank, tone-analyzer, style-matcher, style-checker, cost-control, payment
