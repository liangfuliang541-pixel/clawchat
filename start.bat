@echo off
REM ClawChat 启动脚本 (Windows)

echo.
echo 🦞 ClawChat MVP 启动脚本
echo ==========================
echo.

REM 检查 Node.js
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i

if "%NODE_VERSION%"=="" (
    echo ❌ Node.js 未安装，请先安装 Node.js ^>= 20.0.0
    pause
    exit /b 1
)

echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 安装依赖
if not exist "node_modules" (
    echo 📦 安装根依赖...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 安装后端依赖...
    call npm install -w backend
)

if not exist "frontend\node_modules" (
    echo 📦 安装前端依赖...
    call npm install -w frontend
)

echo.
echo ✅ 依赖安装完成
echo.

REM 启动开发服务
echo 🚀 启动开发服务...
echo    后端: http://localhost:3001
echo    前端: http://localhost:5173
echo.
echo 按 Ctrl+C 停止服务
echo.

call npm run dev

REM 结束
echo.
echo 🛑 服务已停止
pause
