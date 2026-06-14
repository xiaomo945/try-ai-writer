# Use AI Writer Chrome Extension

AI写作助手Chrome扩展，在任何网页上使用AI生成高质量内容。

## 功能特性

- 🎯 **多场景支持**：博客、邮件、社交媒体、自定义格式
- ⚡ **快速生成**：选中文本后一键生成改进、总结或扩展内容
- 🎨 **优雅界面**：浮动按钮和侧边面板，不干扰浏览体验
- 📋 **历史记录**：保存最近50条生成记录，随时查看
- 🔒 **安全认证**：与主应用共享登录状态

## 安装方法

### 开发者模式安装

1. 下载或克隆此仓库
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension` 文件夹
6. 扩展安装完成

### 使用方法

1. **登录**：点击扩展图标，使用Use AI Writer账号登录
2. **生成内容**：
   - 方式一：点击浮动按钮，在面板中输入主题生成
   - 方式二：选中文本后，右键菜单选择操作
   - 方式三：选中文本后，自动弹出操作菜单
3. **插入内容**：生成的内容可以复制或插入到当前页面的输入框

## 文件结构

```
chrome-extension/
├── manifest.json          # 扩展配置
├── scripts/
│   ├── background.js      # 后台服务
│   └── content.js         # 内容脚本
├── popup/
│   ├── popup.html         # 弹窗界面
│   ├── popup.css          # 弹窗样式
│   └── popup.js           # 弹窗逻辑
├── styles/
│   └── content.css        # 内容脚本样式
├── icons/                 # 扩展图标（需要添加）
└── README.md              # 说明文档
```

## 发布到Chrome Web Store

### 准备工作

1. **准备图标**：
   - 16x16, 32x32, 48x48, 128x128 PNG格式
   - 放置在 `icons/` 目录

2. **打包扩展**：
   ```bash
   # 在chrome-extension目录下执行
   zip -r use-ai-writer-extension.zip . -x "*.git*" -x "README.md"
   ```

3. **准备发布材料**：
   - 扩展截图（1280x800 或 640x400）
   - 扩展描述（简短描述 + 详细描述）
   - 隐私政策URL

### 发布步骤

1. 访问 [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 支付一次性开发者费用（$5）
3. 点击"新项目"
4. 上传 `use-ai-writer-extension.zip`
5. 填写商店列表信息
6. 填写隐私权声明
7. 提交审核

### 审核注意事项

- 确保所有功能正常工作
- 提供清晰的隐私政策
- 说明数据使用方式
- 审核通常需要1-3个工作日

## 开发说明

### 本地调试

1. 修改代码后，在 `chrome://extensions/` 点击刷新按钮
2. 查看控制台日志：
   - 右键点击扩展图标 → "检查弹出内容"
   - 在任意网页按F12查看内容脚本日志

### API配置

修改 `scripts/background.js` 中的 `API_BASE_URL`：

```javascript
const API_BASE_URL = "https://useaiwriter.com/api"; // 生产环境
// const API_BASE_URL = "http://localhost:3000/api"; // 本地开发
```

## 技术栈

- Manifest V3
- Vanilla JavaScript
- Chrome Extension API
- CSS3 (Flexbox, Grid, Animations)

## 浏览器兼容性

- Chrome 88+
- Edge 88+（基于Chromium）
- Brave（支持Chrome扩展）

## 许可证

MIT License

## 支持

如有问题，请联系：support@useaiwriter.com
