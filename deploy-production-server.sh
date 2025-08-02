#!/bin/bash

# 会议房间预订系统 - 生产服务器部署脚本
# 针对特定服务器IP地址的部署配置

echo "🚀 开始部署会议房间预订系统到生产服务器..."

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

# 重新构建并启动所有服务
echo "🏗️ 构建并启动所有服务..."
docker-compose -f docker-compose-production.yml up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose -f docker-compose-production.yml ps

# 检查Nginx配置
echo "📋 Nginx配置检查:"
docker-compose -f docker-compose-production.yml exec nginx nginx -t

# 查看服务日志
echo "📋 服务日志预览:"
echo "
=== Nginx日志 ==="
docker-compose -f docker-compose-production.yml logs nginx --tail=20
echo "
=== 后端日志 ==="
docker-compose -f docker-compose-production.yml logs backend --tail=10
echo "
=== 用户前端日志 ==="
docker-compose -f docker-compose-production.yml logs frontend-user --tail=10
echo "
=== 管理前端日志 ==="
docker-compose -f docker-compose-production.yml logs frontend-admin --tail=10

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 请访问以下地址:"
echo "- 用户界面: http://124.221.247.87"
echo "- 管理界面: http://124.221.247.87/admin"
echo "- API文档: http://124.221.247.87/api-doc"
echo ""
echo "🔍 如需查看实时日志:"
echo "  docker-compose -f docker-compose-production.yml logs -f"