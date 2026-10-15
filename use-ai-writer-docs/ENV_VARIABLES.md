# Try AI Writer 环境变量清单

> 权威来源是仓库根目录的 `.env.local.example`（与代码同步）。本文件补充分组说明与安全注意事项。
> 2026-10 复核：补上了此前遗漏的 `AI_PROVIDER`、`*_MODEL`、`CREEM_ENV` 与积分包产品 ID。

## AI Provider

| 变量 | 说明 |
|------|------|
| `AI_PROVIDER` | `claude` \| `deepseek` \| `mock` \| **留空 = 自动降级** |
| `CLAUDE_API_KEY` | Anthropic 密钥 |
| `CLAUDE_MODEL` | 默认 `claude-sonnet-4-20250514` |
| `DEEPSEEK_API_KEY` | DeepSeek 密钥 |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` |

**自动模式（推荐）**：`AI_PROVIDER` 留空时按 DeepSeek → Claude → mock 依次降级，任一环节失败不会让整体硬失败。
**不配 key 也能跑**：无可用 key 时回退 mock，返回预置文本并模拟流式，便于本地看界面。

## 认证

| 变量 | 说明 |
|------|------|
| `NEXTAUTH_SECRET` | 会话加密密钥，用 `openssl rand -hex 32` 生成 |
| `NEXTAUTH_URL` | 回调基地址，生产为 `https://tryaiwriter.com`，本地 `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` | Apple OAuth |

## 支付（Creem）

| 变量 | 说明 |
|------|------|
| `CREEM_ENV` | `test`（沙箱，不真扣款）或 `production` |
| `CREEM_API_KEY` | `creem_test_xxx` / `creem_live_xxx` |
| `CREEM_PRODUCT_PRO` / `_MAX` / `_TEAM` | 订阅产品 ID |
| `CREEM_PRODUCT_CREDITS_SMALL` / `_MEDIUM` / `_LARGE` | 积分包（$5/50、$12/150、$35/500） |
| `CREEM_WEBHOOK_SECRET` | Webhook 签名密钥 |

> 测试环境务必使用 `CREEM_ENV=test` 与 `creem_test_` 前缀密钥，避免真实扣款。

## 可选

- `SENTRY_DSN`：配置后启用 Sentry，不配则不启用。

## 安全准则

1. **绝不提交** `.env.local` 到 Git。
2. 测试与生产使用**不同**密钥。
3. 定期轮换密钥，启用用量告警与速率限制。
4. Webhook 必须校验签名。

生成密钥：

```bash
openssl rand -hex 32
# 或
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## 配置检查清单

- [ ] `AI_PROVIDER` 已按意图设置（或留空走自动）
- [ ] 所有 API 密钥已配置
- [ ] `.env.local` 未提交到 Git
- [ ] 生产/测试密钥分离，`CREEM_ENV` 正确
- [ ] `NEXTAUTH_SECRET` 符合安全标准
- [ ] Webhook 签名校验已启用
