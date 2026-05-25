# Use AI Writer 技术架构文档

## 技术栈概览

### 前端框架
- **Next.js 16.2.6** - App Router架构，Turbopack构建
- **React 18** - 组件化开发，Hooks架构
- **TypeScript** - 严格类型检查，零any
- **Tailwind CSS** - 原子化CSS，自定义主题系统

### UI/设计系统
- **2026新奢简美学** - 液态玻璃、黑曜石深色模式
- **Playfair Display** - 标题字体（700, 800字重）
- **Inter** - 正文字体（400, 500, 600字重）
- **JetBrains Mono** - 等宽字体，极客风格点缀
- **Lucide Icons** - 现代矢量图标库

### AI模型集成
- **Anthropic Claude** - 主要生成引擎
- **DeepSeek** - 备选模型，多供应商策略
- **Prompt Engineering** - 精心设计的提示系统

### 支付系统
- **Creem.io** - 支付网关，订阅管理
- **Stripe (备用)** - 支付供应商冗余方案

### 部署与基础设施
- **Vercel** - 主部署平台
- **Git/GitHub** - 版本控制
- **NextAuth.js** - 认证系统
- **LocalStorage** - 用户数据持久化

## 核心模块架构

### 1. 品牌声音学习系统
```
lib/brand-voice.ts
├── analyzeTextStyle() - 文本风格分析
├── updateProfile() - 更新用户风格档案
└── applyBrandVoice() - 应用品牌声音到生成
```

### 2. 文档风格分析
```
lib/document-style-analyzer.ts
├── analyzeDocumentStyle() - 核心分析函数
├── extractKeyFeatures() - 特征提取
└── convertToBrandVoiceProfile() - 风格档案转换
```

### 3. AI编辑建议
```
lib/edit-suggestions.ts
├── getEditSuggestions() - 获取编辑建议
├── generateOptimizedVersion() - 生成优化版本
└── supportMultipleModes() - 支持多种编辑模式
```

### 4. API路由设计
```
app/api/
├── generate/route.ts - 内容生成
├── brand-voice/upload-document/route.ts - 文档上传分析
├── edit/route.ts - AI编辑
├── payment/checkout/route.ts - 支付流程
└── file/process/route.ts - 文件处理
```

## 安全架构
- **环境变量管理** - .env.local，敏感信息隔离
- **API密钥保护** - 服务器端处理，客户端无感知
- **输入验证** - 严格的用户输入校验
- **CORS配置** - 安全的跨域资源共享

## 性能优化
- **Turbopack** - 极速构建系统
- **React Server Components** - 服务端渲染优化
- **静态页面预渲染** - SEO友好
- **懒加载优化** - 关键资源优先加载

## 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 代码质量标准
- **TypeScript 严格模式** - 零any类型
- **ESLint** - 代码规范检查
- **无console.log** - 生产环境清理
- **组件单一职责** - 模块化最佳实践
