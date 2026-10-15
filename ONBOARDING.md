# ONBOARDING — Try AI Writer

> 项目防失联手册。任何开发者接手此仓库后，可在 5 分钟内理解全貌。
> 本文件于 2026-10 按**当前代码状态**重写；若与代码不符，以代码为准并请更新此处。

---

## 1. 项目概览

| 字段 | 值 |
|------|------|
| 项目名称 | **Try AI Writer**（早期曾名 "Use AI Writer"，已全面迁移） |
| 域名 | https://tryaiwriter.com |
| 代码仓库 | https://github.com/xiaomo945/try-ai-writer |
| 部署平台 | Vercel（推送 `main` 自动构建部署） |
| 本地端口 | 3000（旧文档写的 3001 已不适用） |

### 技术栈（实际）

| 层 | 技术 | 注意 |
|------|------|------|
| 框架 | Next.js **16.3.8**（App Router + Turbopack） | 曾为 16.2.6，为修复严重漏洞升级 |
| UI | React **19** | 不是 18 |
| 语言 | TypeScript（strict） | |
| 样式 | Tailwind CSS **v3** | 不是 v4；生效配置是 `postcss.config.js` |
| 图标 | lucide-react | |
| 认证 | NextAuth **v5**（beta.32） | Google + Apple OAuth |
| AI | Anthropic Claude + DeepSeek | **两者都是裸 fetch 直调 REST API，未用官方 SDK** |
| 支付 | Creem | 曾有 Stripe 试验分支，未采用 |
| 分析/监控 | Vercel Analytics、Sentry（可选） | |
| 字体 | Playfair Display（标题）+ Inter（正文） | |

### 主要路由

| 路由 | 说明 |
|------|------|
| `/` | 落地页 |
| `/write` | **写作工作台**（核心）：4 种模式、流式生成、导出、改写润色、SEO 与原创性分析 |
| `/dashboard` | 用量、历史、品牌声音、记忆库 |
| `/templates` | 模板库（数据在 `lib/templates.ts`） |
| `/tools`、`/tools/headline-generator` | 小工具 |
| `/interview` | 创意采访（引导式生成） |
| `/onboarding` | 新用户引导 |
| `/blog/*` | 384 篇 SEO 文章 + 对比页 + 客户案例 |
| `/pricing`、`/pricing/credits`、`/payment/*` | 定价与支付 |
| `/login`、`/register`、`/auth/error` | 认证 |

### 核心 API

| 路径 | 说明 |
|------|------|
| `/api/generate` | 流式生成；支持 `mode`、`enhancedPrompt`、`relevantMemories`、`instruction`（改写） |
| `/api/auth/[...nextauth]` | NextAuth |
| `/api/payment/*` | Creem 支付与 webhook |
| `/api/brand-voice`、`/api/history`、`/api/user`、`/api/referral` | 需登录 |

### 核心模块

| 模块 | 文件 |
|------|------|
| 模型适配 | `lib/ai-providers/claude.ts`、`deepseek.ts` |
| 鉴权 / 支付 | `lib/auth.ts`、`lib/payment.ts` |
| 品牌声音 | `lib/brand-voice.ts`、`lib/style-matcher.ts` |
| 记忆与历史 | `lib/memory-bank.ts`、`lib/history.ts`、`lib/idea-linker.ts` |
| 模板 | `lib/templates.ts` |
| 内容分析 | `lib/content-analyzer.ts`（SEO + 原创性） |
| 其他 | `lib/rate-limiter.ts`、`lib/workflows.ts`、`lib/logger.ts` |

---

## 2. 生成管线（最重要的一块）

`app/write/page.tsx` → `POST /api/generate` → `lib/ai-providers/*` → 流式回写前端。

- 按 `mode`（blog / email / social / custom）拼装 system prompt。
- **品牌声音注入**：前端算出 `enhancedPrompt`（句长、段落长度、常用短语）一起传入。
- **记忆召回**：`relevantMemories` 把过去相关想法放进上下文。
- **改写模式**：传 `instruction` 时由指令接管 system prompt，正文当作"待改写内容"，并跳过品牌声音与记忆注入。
- **Provider 策略**：显式 `deepseek` / `claude` / `mock`，留空则自动降级 **DeepSeek → Claude → mock**。
- 每个 provider 有 2 次重试 + 30s 超时；错误做了中文本地化（key 无效、额度不足、超时等）。
- **不配 API key 也能跑**：自动模式下无 key 会回退 mock，返回预置文本并模拟流式，便于先看界面。

---

## 3. 数据存储

**当前没有数据库**，靠文件 + 客户端存储：历史、记忆、品牌声音主要在 localStorage。所以数据**不跨设备同步**。

> 曾有分支引入 Prisma + Postgres，现保留为标签 `archive/trae-1RaD7T-prisma`；要上真实数据库可从那里 cherry-pick 参考。

---

## 4. 需要登录吗

`proxy.ts`（原 `middleware.ts`）保护以下路径，未登录跳 `/login`，API 返回 401：

- 页面：`/dashboard`、`/write`、`/onboarding`、`/interview`、`/tools`、`/pricing/credits`
- API：`/api/payment`、`/api/referral`、`/api/user`、`/api/brand-voice`、`/api/history`

> `/write` 虽在保护列表内，但产品上同时强调"免登录即用"，改动鉴权前先确认产品意图。

---

## 5. 快速启动

```bash
npm install
cp .env.local.example .env.local   # 不填 key 也能跑（mock 模式）
npm run dev                        # http://localhost:3000
```

| 命令 | 作用 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建（预渲染约 452 个页面） |
| `npm run start` | 起生产服务 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | vitest |
| `npm run lint` | eslint |
| `npm run check` | typecheck + test + build |

### 环境变量要点

`AI_PROVIDER`（claude / deepseek / mock / 留空自动）、`CLAUDE_API_KEY`、`CLAUDE_MODEL`、`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`NEXTAUTH_SECRET`、`NEXTAUTH_URL`、Google/Apple OAuth、`CREEM_*`。完整列表见 `.env.local.example`。

---

## 6. 已知坑

- **Tailwind 是 v3**。仓库曾误留 `postcss.config.mjs`（引用 v4 插件）已删除，别加回来。
- **构建卡住**：若 `npm run build` 长时间无输出，移走 `.next` 后重试。
- **Next 16.3 弃用 `middleware.ts`**，本项目已迁到 `proxy.ts`。
- **依赖审计仍有 12 个 high**，全部来自 `tailwindcss` / `eslint-config-next` 构建工具链（devDependencies），不进生产运行时，已在 README 说明为何接受。
- **模板需靠 URL 参数生效**：模板链接为 `/write?template=<id>`，写作页读取后预填 prompt 与模式。

---

## 7. 规范（.trae/rules/）

`01-programming`（TS strict、零 any、Server 优先）、`02-design`（品牌色/字体/暗色模式）、`03-copywriting`（语气与 CTA）、`08-security`（环境变量、外链、依赖审计）。

---

## 8. 分支现状

仓库已清理，**只有 `main`**。早期编码 agent 产生的 12 个 `trae/solo-agent-*` 与 `vercel/*` 分支已删除；含独有工作量的两条保留为标签：

- `archive/trae-1RaD7T-prisma` — Prisma + Postgres 数据层
- `archive/trae-VCqSdK-conversion` — 转化漏斗、A/B 测试、留存系统
