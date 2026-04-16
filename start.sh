#!/bin/bash

# ClawChat 启动脚本

echo "🦞 ClawChat MVP 启动脚本"
echo "=========================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 20.0.0"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker 未检测到，手动启动 MongoDB:"
    echo "   mongod --dbpath ./data"
    echo ""
else
    echo "✅ Docker 已安装"
    echo "🚀 启动完整技术栈..."
    docker-compose up -d
    echo "⏳ 等待服务启动..."
    sleep 3
    docker-compose ps
    echo ""
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装根依赖..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install -w backend
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install -w frontend
fi

echo ""
echo "✅ 依赖安装完成"
echo ""

# 启动开发服务
echo "🚀 启动开发服务..."
echo "   后端: http://localhost:3001"
echo "   前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev

# 清理
echo ""
echo "🛑 服务已停止"
echo "清理 Docker 容器? (y/n)"
read -r response
if [ "$response" = "y" ]; then
    docker-compose down
    echo "✅ 容器已清理"
fi
