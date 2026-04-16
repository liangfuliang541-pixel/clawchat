#!/bin/bash

# ClawChat GitHub初始化脚本
# 用途：快速初始化本地Git仓库并准备推送到GitHub

set -e

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ClawChat v0.1.0 GitHub Publish Script    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# 检查是否已有.git
if [ -d ".git" ]; then
    echo "ℹ️  Git仓库已存在，跳过初始化"
else
    echo "🔧 初始化Git仓库..."
    git init
    echo "✅ Git仓库已初始化"
fi

# 配置Git
echo ""
echo "⚙️  配置Git用户信息..."
read -p "请输入Git用户名 (例: Your Name): " git_user
read -p "请输入Git邮箱 (例: you@example.com): " git_email

git config user.name "$git_user"
git config user.email "$git_email"
echo "✅ Git用户信息已配置"

# 添加文件
echo ""
echo "📦 添加项目文件到Git..."
git add .
echo "✅ 所有文件已暂存"

# 创建初始提交
echo ""
echo "💾 创建初始提交..."
git commit -m "chore: v0.1.0 initial release

✨ ClawChat MVP Release

核心功能:
- 身份验证系统 (JWT + bcryptjs)
- 实时消息传输 (Socket.IO)
- MongoDB消息持久化
- React前端 (Tailwind CSS)
- Express后端API
- Docker部署配置
- 单元测试套件

文档:
- API_AND_MODELS.md - API规范
- ARCHITECTURE.md - 系统架构
- DEPLOYMENT_GUIDE.md - 部署指南
- DEVELOPMENT_STANDARDS.md - 代码规范

See RELEASE_NOTES.md for details"

echo "✅ 初始提交已创建"

# 创建版本标签
echo ""
echo "🏷️  创建v0.1.0版本标签..."
git tag -a v0.1.0 -m "ClawChat v0.1.0 MVP Release

Initial MVP release with:
- Core authentication and messaging
- Real-time Socket.IO integration
- MongoDB persistence
- React frontend with Tailwind CSS
- Express backend with REST API
- Docker Compose deployment
- Complete documentation
- Unit test suite (80%+ coverage)"

echo "✅ 版本标签已创建"

# 显示下一步
echo ""
echo "════════════════════════════════════════════"
echo "✅ 本地Git仓库已准备就绪！"
echo ""
echo "📝 下一步操作:"
echo "════════════════════════════════════════════"
echo ""
echo "1️⃣  在GitHub上创建新仓库:"
echo "   访问: https://github.com/new"
echo "   仓库名: clawchat"
echo "   描述: 🦞 A modern real-time chat application"
echo ""
echo "2️⃣  复制仓库URL（HTTPS或SSH）"
echo ""
echo "3️⃣  运行以下命令:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/clawchat.git"
echo "   git branch -M main"
echo "   git push -u origin main --tags"
echo ""
echo "4️⃣  验证: 访问 https://github.com/YOUR_USERNAME/clawchat"
echo ""
echo "════════════════════════════════════════════"
echo ""
echo "💡 快速复制粘贴:"
echo "git remote add origin https://github.com/YOUR_USERNAME/clawchat.git && git branch -M main && git push -u origin main --tags"
echo ""
