@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════╗
echo ║   ClawChat v0.1.0 GitHub Publish Script    ║
echo ╚════════════════════════════════════════════╝
echo.

REM 检查是否已有.git
if exist .git (
    echo ℹ️  Git仓库已存在，跳过初始化
) else (
    echo 🔧 初始化Git仓库...
    git init
    if errorlevel 1 goto git_error
    echo ✅ Git仓库已初始化
)

REM 配置Git
echo.
echo ⚙️  配置Git用户信息...
set /p git_user="请输入Git用户名 (例: Your Name): "
set /p git_email="请输入Git邮箱 (例: you@example.com): "

git config user.name "%git_user%"
git config user.email "%git_email%"
echo ✅ Git用户信息已配置

REM 添加文件
echo.
echo 📦 添加项目文件到Git...
git add .
if errorlevel 1 goto git_error
echo ✅ 所有文件已暂存

REM 创建初始提交
echo.
echo 💾 创建初始提交...
git commit -m "chore: v0.1.0 initial release - ClawChat MVP with auth, messaging, Socket.IO, MongoDB, React frontend, Docker deployment, tests"
if errorlevel 1 goto git_error
echo ✅ 初始提交已创建

REM 创建版本标签
echo.
echo 🏷️  创建v0.1.0版本标签...
git tag -a v0.1.0 -m "ClawChat v0.1.0 MVP Release - Initial release with core authentication and messaging"
if errorlevel 1 goto git_error
echo ✅ 版本标签已创建

REM 显示成功信息
echo.
echo ════════════════════════════════════════════
echo ✅ 本地Git仓库已准备就绪！
echo.
echo 📝 下一步操作:
echo ════════════════════════════════════════════
echo.
echo 1️⃣  在GitHub上创建新仓库:
echo    访问: https://github.com/new
echo    仓库名: clawchat
echo    描述: 🦞 A modern real-time chat application
echo.
echo 2️⃣  复制仓库URL^(HTTPS或SSH^)
echo.
echo 3️⃣  运行以下命令:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/clawchat.git
echo    git branch -M main
echo    git push -u origin main --tags
echo.
echo 4️⃣  验证: 访问 https://github.com/YOUR_USERNAME/clawchat
echo.
echo ════════════════════════════════════════════
echo.
pause
goto end

:git_error
echo.
echo ❌ Git命令执行失败！
echo.
pause
exit /b 1

:end
exit /b 0
