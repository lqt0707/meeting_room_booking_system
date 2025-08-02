#!/bin/bash

# 会议房间预订系统 - 前端更新脚本
# 修复前端服务中的后端服务名称配置问题

echo "🚀 开始更新前端服务配置..."

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

# 停止现有服务
echo "⏹️ 停止现有服务..."
docker-compose -f docker-compose-production.yml stop frontend-user frontend-admin

# 重新构建前端服务
echo "🏗️ 重新构建前端服务..."
docker-compose -f docker-compose-production.yml build --no-cache frontend-user frontend-admin

# 启动前端服务
echo "🚀 启动前端服务..."
docker-compose -f docker-compose-production.yml start frontend-user frontend-admin

# 重启Nginx服务以应用更改
echo "🔄 重启Nginx服务..."
docker-compose -f docker-compose-production.yml restart nginx

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose -f docker-compose-production.yml ps

# 查看前端服务日志
echo "📋 前端服务日志预览:"
echo "
=== 用户前端日志 ==="
docker-compose -f docker-compose-production.yml logs frontend-user --tail=10
echo "
=== 管理前端日志 ==="
docker-compose -f docker-compose-production.yml logs frontend-admin --tail=10

echo ""
echo "✅ 前端服务更新完成！"
echo ""
echo "🌐 请访问以下地址验证:"
echo "- 用户界面: http://localhost"
echo "- 管理界面: http://localhost/admin"
echo "- API文档: http://localhost/api-doc"
echo ""
echo "🔍 如需查看完整日志:"
echo "  docker-compose -f docker-compose-production.yml logs -f frontend-user"
echo "  docker-compose -f docker-compose-production.yml logs -f frontend-admin"