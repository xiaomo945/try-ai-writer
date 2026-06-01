# Google Indexing API 配置指南

本文档详细介绍如何配置 Google Indexing API，实现新博客文章发布后自动提交给 Google 搜索引擎收录。

## 前提条件
- Google Cloud Platform (GCP) 账号
- Google Search Console 账号（已验证您的网站）

---

## 第一步：在 Google Cloud Console 创建项目

1. 访问 [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. 点击左上角的项目下拉菜单，然后点击"新建项目"
3. 输入项目名称（例如："Try AI Writer Indexing"）
4. 点击"创建"

---

## 第二步：启用 Indexing API

1. 在新项目中，导航到"APIs & Services" → "Library"
2. 在搜索框中输入"Indexing API"
3. 选择"Indexing API"并点击"启用"

---

## 第三步：创建服务账号并下载 JSON 密钥

1. 导航到"APIs & Services" → "Credentials"
2. 点击"创建凭据" → "服务账号"
3. 填写服务账号信息：
   - 服务账号名称：`search-console-indexer`
   - 服务账号 ID：自动生成（格式：`search-console-indexer@PROJECT_ID.iam.gserviceaccount.com`）
   - 描述："Google Indexing API 服务账号"
4. 点击"创建并继续"
5. 点击"完成"（无需分配角色）
6. 在服务账号列表中选择刚创建的服务账号
7. 切换到"密钥"标签页
8. 点击"添加密钥" → "创建新密钥"
9. 选择"JSON"格式并点击"创建"
10. 保存下载的 JSON 文件（后面会用到）

---

## 第四步：在 Google Search Console 授权服务账号

1. 访问 [Google Search Console](https://search.google.com/search-console/)
2. 选择您的网站属性
3. 点击侧边栏的"设置"（齿轮图标）
4. 点击"用户和权限"
5. 点击"添加用户"按钮
6. 在"电子邮件地址"字段中粘贴第三步中服务账号的邮箱地址
7. 将权限设置为"所有者"或"完全权限"
8. 点击"添加"

---

## 第五步：配置环境变量

### 方法一：配置到 Vercel（推荐）

1. 登录 Vercel 控制台，打开您的项目
2. 导航到"Settings" → "Environment Variables"
3. 添加新的环境变量：
   - **名称**：`GOOGLE_INDEXING_CREDENTIALS_JSON`
   - **值**：将下载的 JSON 密钥文件内容粘贴进去

### 方法二：本地开发环境

将下载的 JSON 密钥文件保存到项目根目录，命名为 `credentials.json`

---

## 第六步：使用脚本

### 手动提交新文章

```bash
# 提交今日新增的文章
npm run index-now

# 模拟运行（仅列出待提交的URL，不实际提交）
npm run index-dry-run
```

### 文章生成后自动提交

```bash
npm run generate-and-index
```

---

## FAQ

### Q: API 配额限制是多少？

A: Google Indexing API 默认配额为每天 200 次请求，对于大多数网站足够使用。

### Q: 支持提交哪些类型的内容？

A: 支持提交 `URL_UPDATED`（新增或更新的内容）和 `URL_DELETED`（已删除的内容）。

### Q: Google 需要多长时间才能索引我的页面？

A: 时间不一，通常在几小时到几天内完成索引。

### Q: 如何验证提交是否成功？

A: 提交成功后，脚本会输出确认信息。您也可以在 Google Search Console 的"URL 检查"工具中验证。

---

## 错误排查

### 403 Forbidden 错误
- 确保服务账号邮箱已正确添加到 Google Search Console
- 确保权限级别设置为"所有者"或"完全权限"

### 无效凭证错误
- 检查 JSON 密钥内容是否完整且格式正确
- 确认环境变量名称正确（`GOOGLE_INDEXING_CREDENTIALS_JSON`）

### 速率限制错误
- 默认脚本已内置每秒 1 次的速率限制
- 如果仍遇到限制，请减少提交频率

### 常见错误代码
- `400 Bad Request`：请求格式错误，检查 URL 是否正确
- `401 Unauthorized`：认证失败，检查凭证是否有效
- `429 Too Many Requests`：超过配额限制，稍后重试

---

## 文件说明

| 文件路径 | 说明 |
|---------|------|
| `scripts/auto-index.js` | 自动提交脚本，检测当日新增文章并提交 |
| `scripts/generate-and-index.js` | 文章生成后自动提交的包装脚本 |
| `reports/indexed-urls.json` | 已提交 URL 的记录文件 |
| `docs/GOOGLE_INDEXING_SETUP.md` | 配置指南文档 |