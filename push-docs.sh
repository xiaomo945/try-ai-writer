#!/bin/bash
# Use AI Writer 核心文档推送脚本
# 请确保已配置GitHub身份认证

set -e

echo "🚀 开始推送 Use AI Writer 核心文档..."

# 步骤1: 克隆私有仓库
echo "📥 克隆私有仓库..."
rm -rf /tmp/devlog-private
git clone https://github.com/xiaomo945/devlog-private.git /tmp/devlog-private

# 步骤2: 创建目录并复制文档
echo "📁 复制文档文件..."
mkdir -p /tmp/devlog-private/use-ai-writer
cp /workspace/devlog-private/use-ai-writer/*.md /tmp/devlog-private/use-ai-writer/

# 步骤3: 提交并推送
echo "📤 提交并推送..."
cd /tmp/devlog-private
git add -A
git commit -m "Add Use AI Writer confidential docs"
git push origin main

# 步骤4: 清理
echo "🧹 清理临时文件..."
cd ..
rm -rf /tmp/devlog-private

echo ""
echo "✅ 四个文档已推送至 devlog-private/use-ai-writer/"
echo ""
echo "📋 文档列表:"
echo "   - STRATEGY.md (核心商业战略)"
echo "   - TECH_STACK.md (技术架构)"
echo "   - ENV_VARIABLES.md (环境变量清单)"
echo "   - ROADMAP.md (产品路线图)"
