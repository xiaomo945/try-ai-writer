# Try AI Writer 技术架构文档

> 2026-10 按当前代码复核重写。早期版本描述的是旧架构（React 18 / 单一 Claude / Tailwind v4），已不准确。

## 技术栈概览

### 前端框架
- **Next.js 16.3.8** — App Router，Turbopack 构建
- **React 19** — 组件化，Hooks
- **TypeScript** — 严格模式，零 any
- **Tailwind CSS v3** — 原子化 CSS + 自定义主题（`tailwind.config.js`）

### UI / 设计系统
- **新奢简美学** — 液态玻璃卡片、黑曜石深色模式
- **Playfair Display** — 标题（700/800）
- **Inter** — 正文（400/500/600）
- **Lucide Icons** — 图标库

### AI 模型集成
- **Anthropic Claude**（`claude-sonnet-4-20250514`）
- **DeepSeek**（`deepseek-chat`）
- **接入方式**：两者都通过**裸 `fetch` 直调各自 REST API** 并手写 SSE 流式解析，**未使用官方 SDK**（曾依赖 `@anthropic-ai/sdk` 但从未引用，已移除）
- **降级策略**：自动模式 DeepSeek → Claude → mock；每个 provider 2 次重试 + 30s 超时

### 认证与支付
- **NextAuth v5（beta.32）** — Google + Apple OAuth，中间件保护页面与 API
- **Creem** — 订阅与积分包，含 checkout、成功/待处理页、webhook

### 部署与基础设施
- **Vercel** — 主部署平台，推送 `main` 自动构建
- **GitHub** — 版本控制
- **Sentry**（可选，配置了 `SENTRY_DSN` 才启用）+ Vercel Analytics

## 核心模块

```
lib/
├── ai-providers/
│   ├── claude.ts        # Claude REST 流式
│   └── deepseek.ts      # DeepSeek REST 流式
├── auth.ts              # NextAuth v5
├── payment.ts           # Creem
├── brand-voice.ts       # 品牌声音档案
├── style-matcher.ts     # 风格匹配评分
├── memory-bank.ts       # 记忆库
├── history.ts           # 生成历史
├── idea-linker.ts       # 相关想法召回
├── templates.ts         # 写作模板目录
├── content-analyzer.ts  # SEO + 原创性分析
├── rate-limiter.ts      # 限流
└── logger.ts            # 结构化日志
```

### API 路由
```
app/api/
├── generate/route.ts          # 流式生成（含改写模式）
├── auth/[...nextauth]/        # NextAuth
├── payment/                   # Creem 支付与 webhook
├── brand-voice/               # 品牌声音
├── history/                   # 历史
├── referral/                  # 推荐/联盟
└── user/                      # 用户信息
```

## 数据持久化

**当前无数据库。** 历史、记忆、品牌声音存放于 localStorage（客户端），不跨设备同步。

遗留参考：标签 `archive/trae-1RaD7T-prisma` 保存了 Prisma + Postgres 数据层的历史实现，如需上真实数据库可参考。

## 安全架构
- 环境变量隔离（`.env.local` / Vercel 环境变量）
- API key 仅在服务端使用，不下发客户端
- 依赖漏洞：严重项已清零；剩余 high 级全部位于构建期工具链（devDependencies），详见 README
- 中间件（`proxy.ts`）保护受登录限制的页面与 API

## 性能优化
- Turbopack 构建
- React Server Components + 静态预渲染（约 452 页，利于 SEO）
- 生成结果流式返回，首字延迟低

## 代码质量标准
- TypeScript 严格模式，零 any
- ESLint（`eslint-config-next`）
- 组件单一职责
- 异步操作完整处理 loading / error / empty 状态
