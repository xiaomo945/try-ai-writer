# Use AI Writer 环境变量清单

## 生产环境配置
```env
# ==================== AI模型配置 ====================
CLAUDE_API_KEY=sk-ant-...              # Anthropic Claude API密钥
DEEPSEEK_API_KEY=sk-...                # DeepSeek API密钥（备用）

# ==================== 支付系统配置 ====================
CREEM_API_KEY=creem_live_...           # Creem生产环境API密钥
CREEM_PRODUCT_PRO=prod_abc123          # 专业版产品ID
CREEM_PRODUCT_MAX=prod_def456          # 旗舰版产品ID
CREEM_PRODUCT_TEAM=prod_ghi789         # 团队版产品ID
CREEM_WEBHOOK_SECRET=whsec_...         # Creem Webhook签名密钥

# ==================== 认证配置 ====================
NEXTAUTH_SECRET=your-secure-random-string-here  # NextAuth加密密钥（32字符+）
NEXTAUTH_URL=https://tryaiwriter.com             # 生产环境URL

# ==================== OAuth提供商 ====================
GOOGLE_CLIENT_ID=...apps.googleusercontent.com   # Google OAuth客户端ID
GOOGLE_CLIENT_SECRET=...                        # Google OAuth客户端密钥
APPLE_CLIENT_ID=com.tryaiwriter.service         # Apple OAuth客户端ID
APPLE_CLIENT_SECRET=...                         # Apple OAuth客户端密钥

# ==================== 部署配置 ====================
NODE_ENV=production                            # 环境标识
VERCEL_ENV=production                          # Vercel环境
```

## 开发环境配置
```env
# ==================== AI模型配置 ====================
CLAUDE_API_KEY=sk-ant-...              # 测试用Claude API密钥
DEEPSEEK_API_KEY=sk-...                # 测试用DeepSeek API密钥

# ==================== 支付系统配置 ====================
CREEM_API_KEY=creem_test_...           # Creem测试环境API密钥
CREEM_PRODUCT_PRO=prod_test_abc123     # 测试版专业版产品ID
CREEM_PRODUCT_MAX=prod_test_def456     # 测试版旗舰版产品ID
CREEM_PRODUCT_TEAM=prod_test_ghi789    # 测试版团队版产品ID
CREEM_WEBHOOK_SECRET=whsec_test_...    # 测试Webhook密钥

# ==================== 认证配置 ====================
NEXTAUTH_SECRET=dev-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# ==================== OAuth提供商 ====================
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...

# ==================== 部署配置 ====================
NODE_ENV=development
VERCEL_ENV=development
```

## 安全注意事项

### 必须遵守的安全准则
1. **永远不要提交** `.env.local` 到Git仓库
2. **定期轮换** API密钥和访问凭证
3. **使用最小权限原则** 配置API访问权限
4. **启用API密钥限制** - IP白名单、速率限制
5. **监控异常使用** - 设置用量告警

### 环境变量最佳实践
- 使用不同的API密钥用于测试和生产
- 在CI/CD系统中安全管理密钥
- 定期审计密钥使用情况
- 实施密钥轮换机制

### 密钥生成指南
```bash
# 生成NextAuth安全密钥
openssl rand -hex 32

# 或使用Node.js
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## 配置检查清单
- [ ] 所有API密钥已正确配置
- [ ] 环境变量未提交到Git
- [ ] 生产/测试环境分离配置
- [ ] NextAuth密钥符合安全标准
- [ ] Webhook签名验证已启用
- [ ] 部署前已进行安全审计
