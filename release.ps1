# 快速版本发布脚本
# 用途：构建并准备GitHub发布

cd "d:\vs\clawchat"

Write-Host "🚀 ClawChat v0.1.0 Release Process" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# 构建shared
Write-Host "📚 Building shared types..." -ForegroundColor Cyan
npm run build -w shared

# 构建frontend
Write-Host ""
Write-Host "🎨 Building frontend..." -ForegroundColor Cyan
npm run build -w frontend

# 构建backend
Write-Host ""
Write-Host "⚙️ Building backend..." -ForegroundColor Cyan
npm run build -w backend 2>&1 | Where-Object { $_ -notmatch "deprecated|warning" }

# 初始化git
Write-Host ""
Write-Host "🔧 Initializing git repository..." -ForegroundColor Cyan
git init
git config user.name "ClawChat Release"
git config user.email "dev@clawchat.local"
git add .
git commit -m "chore: v0.1.0 initial release

- Authentication system with JWT
- Real-time messaging with Socket.IO
- MongoDB message persistence
- React frontend with Tailwind CSS
- Docker deployment ready
- Complete documentation

RELEASE_NOTES.md"

# 创建标签
Write-Host ""
Write-Host "🏷️ Creating release tag v0.1.0..." -ForegroundColor Cyan
git tag -a v0.1.0 -m "ClawChat v0.1.0 MVP Release"

Write-Host ""
Write-Host "✅ Release v0.1.0 prepared!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 To push to GitHub:" -ForegroundColor Yellow
Write-Host "   1. git remote add origin https://github.com/YOUR_USERNAME/clawchat.git" -ForegroundColor White
Write-Host "   2. git branch -M main" -ForegroundColor White
Write-Host "   3. git push -u origin main --tags" -ForegroundColor White
