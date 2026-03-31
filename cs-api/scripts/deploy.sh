#!/bin/bash
# ============================================
# 阿里云服务器部署脚本
# 执行方式: bash deploy.sh
# ============================================

echo "🚀 开始部署后端服务..."

cd /root/cs-api 2>/dev/null || cd /opt/cs-api 2>/dev/null || cd ~/cs-api

echo "📦 安装依赖..."
npm install

echo "🔨 构建项目..."
npm run build

echo "🛑 停止旧服务..."
pkill -f "next start" 2>/dev/null || true
sleep 2

echo "🚀 启动服务..."
nohup npm start > app.log 2>&1 &

echo "⏳ 等待服务启动..."
sleep 5

echo "🔍 检查服务状态..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "📋 服务信息："
    echo "  健康检查: http://47.108.51.236:3001/api/health"
    echo "  API 地址: http://47.108.51.236:3001/api"
    echo "  日志文件: $(pwd)/app.log"
else
    echo "⚠️  服务可能未启动，请检查日志："
    echo "  tail -f $(pwd)/app.log"
fi

echo ""
echo "📖 常用命令："
echo "  查看日志: tail -f app.log"
echo "  停止服务: pkill -f 'next start'"
echo "  重启服务: bash deploy.sh"
