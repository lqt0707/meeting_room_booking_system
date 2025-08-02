#!/bin/bash

# 会议房间预订系统 - 修复部署脚本
# 解决Nginx上游服务器连接问题

echo "🚀 开始修复会议房间预订系统部署..."

# 检查Docker环境
echo "📋 检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 停止并清理现有容器
echo "🧹 清理现有容器..."
docker-compose -f docker-compose-production.yml down

# 清理Nginx相关镜像和缓存
echo "🗑️ 清理Nginx镜像..."
docker rmi meeting-room-nginx:latest 2>/dev/null || true

# 重新构建并启动服务
echo "🏗️ 重新构建服务..."
docker-compose -f docker-compose-production.yml build --no-cache nginx
echo "🚀 启动服务..."
docker-compose -f docker-compose-production.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose -f docker-compose-production.yml ps

# 检查Nginx日志
echo "📋 Nginx日志预览:"
docker-compose -f docker-compose-production.yml logs nginx --tail=20

echo ""
echo "✅ 修复部署完成！"
echo ""
echo "🌐 访问地址:"
echo "- 用户界面: http://localhost"
echo "- 管理界面: http://localhost/admin"
echo "- API文档: http://localhost/api-doc"
echo ""
echo "🔍 如需查看完整日志:"
echo "  docker-compose -f docker-compose-production.yml logs -f nginx"