# ONBOARDING — Use AI Writer

> 项目防失联手册。任何开发者接手此仓库后，可在 5 分钟内理解全貌。

---

## 1. 项目概览

| 字段 | 值 |
|------|------|
| 项目名称 | Use AI Writer |
| 域名 | https://tryaiwriter.com |
| 代码仓库 | https://github.com/xiaomo945/use-ai-writer |
| 部署平台 | Vercel (CI/CD 自动部署) |
| 本地开发端口 | 3001 |

### 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript (strict mode) |
| 样式 | Tailwind CSS v4 |
| UI 图标 | lucide-react |
| 认证 | NextAuth v5 (Google Provider) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| 分析 | Vercel Analytics |
| 字体 | Playfair Display (标题) + Inter (正文) |

### 页面清单

| 路由 | 文件 | 类型 | 说明 |
|------|------|------|------|
| `/` | `app/page.tsx` | Static | 品牌着陆页 (Hero/Features/Comparison/Pricing/CTA) |
| `/login` | `app/login/page.tsx` | Static | 登录页 (Google OAuth) |
| `/pricing` | `app/pricing/page.tsx` | Static | 定价页 (Free/Pro/Team + FAQ) |
| `/dashboard` | `app/dashboard/page.tsx` | Client | 仪表盘 (用量统计/历史记录) |
| `/write` | `app/write/page.tsx` | Client | 写作编辑器 (4种模式/流式生成/历史) |

### API 路由

| 路径 | 文件 | 说明 |
|------|------|------|
| `/api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` | NextAuth 端点 |
| `/api/generate` | `app/api/generate/route.ts` | Claude API 流式生成 |

### 核心模块

| 模块 | 文件 | 说明 |
|------|------|------|
| 认证配置 | `lib/auth.ts` | NextAuth v5 Google Provider |
| 用量管理 | `lib/usage.ts` | localStorage 每日 10 次限制 |
| 历史记录 | `lib/history.ts` | localStorage 最近 20 条生成记录 |

### Sitemap URL 数

当前 sitemap 包含 4 个 URL：`/`, `/write`, `/login`, `/pricing`。

---

## 2. 变现通路

| 方式 | 说明 |
|------|------|
| 订阅付费 | Free ($0/10次/天) → Pro ($5/月) → Team ($15/月) |
| 联盟链接 | 预留 (CTA 按钮可配置 affiliate URL) |
| API 接入 | Pro/Team 计划包含 API 访问权限 |

---

## 3. 架构决策

### Server vs Client Component 分离原则

- **Server Components (默认)**: 着陆页、定价页、登录页 — 纯静态渲染，无交互
- **Client Components (`"use client"`)**: 写作编辑器、仪表盘 — 需要 useState/useEffect 等 React hooks
- **原则**: 优先 Server Component，仅在有客户端交互需求时使用 Client Component

### 数据存储方式

| 数据类型 | 存储方式 | 位置 |
|------|------|------|
| 每日用量 | localStorage | `use-ai-writer-usage` key |
| 生成历史 | localStorage | `use-ai-writer-history` key (最多 20 条) |
| 认证会话 | NextAuth cookies | 自动管理 |
| API 密钥 | 环境变量 | `.env.local` |

### 环境变量命名规范

| 变量 | 用途 | 必需 |
|------|------|------|
| `CLAUDE_API_KEY` | Anthropic Claude API 密钥 | 是 (生成功能) |
| `NEXTAUTH_SECRET` | NextAuth 会话加密密钥 | 是 |
| `NEXTAUTH_URL` | NextAuth 回调 URL | 是 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | 是 (登录功能) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | 是 (登录功能) |

### 部署流程

1. 代码推送到 `main` 分支
2. Vercel 自动检测变更并触发构建
3. `npm run build` 执行生产构建
4. 构建成功后自动部署到生产环境
5. 环境变量在 Vercel Dashboard 中配置

---

## 4. 规范体系 (.trae/rules/)

| 文件 | 用途 |
|------|------|
| `01-programming.md` | 编程标准 (TypeScript strict, 零 any, Server > Client) |
| `02-design.md` | 设计规范 (品牌色、字体、间距、暗色模式、动画) |
| `03-copywriting.md` | 文案指南 (语气、CTA、标题策略) |
| `08-security.md` | 安全实践 (环境变量、外链处理、依赖审计) |

### 核心铁律

1. **TypeScript strict mode** — `tsconfig.json` 中 `strict: true`
2. **零 any** — 所有类型必须明确声明，禁止使用 `any`
3. **Single responsibility** — 每个文件只做一件事
4. **Prefer interfaces** — 公共 API 使用 interface 而非 type alias
5. **完整状态处理** — 所有异步操作必须处理 loading/error/empty 状态
6. **无硬编码敏感信息** — 所有密钥和令牌必须在 `.env.local` 中
7. **ESLint 零 Error** — 构建必须通过 `next lint` 检查

---

## 5. 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入真实值

# 3. 开发模式
npm run dev -- -p 3001

# 4. 生产构建
npm run build

# 5. 代码检查
npm run lint
```

---

## 6. 目录结构

```
use-ai-writer/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth API
│   │   └── generate/route.ts             # Claude 流式生成
│   ├── dashboard/page.tsx                # 仪表盘 (Client)
│   ├── login/page.tsx                    # 登录页
│   ├── pricing/page.tsx                  # 定价页
│   ├── write/page.tsx                    # 写作编辑器 (Client)
│   ├── layout.tsx                        # 根布局 + 元数据
│   ├── page.tsx                          # 着陆页
│   ├── robots.ts                         # robots.txt
│   ├── sitemap.ts                        # sitemap.xml
│   └── globals.css                       # 全局样式 + Tailwind
├── lib/
│   ├── auth.ts                           # NextAuth 配置
│   ├── usage.ts                          # 用量管理 Hook
│   └── history.ts                        # 历史记录 Hook
├── .trae/rules/                          # 项目规范文件
├── .env.local.example                    # 环境变量模板
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── ONBOARDING.md                         # ← 本文件
```
