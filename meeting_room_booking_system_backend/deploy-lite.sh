#!/bin/bash

# 轻量级会议房间预订系统后端部署脚本
# 专为轻量级服务器设计，避免与原有服务冲突

set -e

echo "🚀 开始轻量级部署会议房间预订系统后端..."
echo "📋 使用配置：端口3006，独立网络，资源优化"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose未安装，请先安装Docker Compose${NC}"
    exit 1
fi

# 检查端口是否被占用
if lsof -ti:3006 &> /dev/null; then
    echo -e "${YELLOW}⚠️  端口3006已被占用，将使用现有服务${NC}"
else
    echo -e "${GREEN}✅ 端口3006可用${NC}"
fi

# 清理旧的轻量级容器
echo "🧹 清理旧的轻量级容器..."
docker-compose -f docker-compose-lite.yml down --remove-orphans 2>/dev/null || true

# 检查环境文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  未找到.env文件，将使用.env.example${NC}"
    cp .env.example .env
fi

# 构建并启动轻量级服务
echo "🔨 构建轻量级Docker镜像..."
docker-compose -f docker-compose-lite.yml build --no-cache

echo "🚀 启动轻量级服务..."
docker-compose -f docker-compose-lite.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
if docker-compose -f docker-compose-lite.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ 轻量级服务启动成功！${NC}"
    echo -e "${GREEN}🌐 应用地址: http://localhost:3006${NC}"
    echo -e "${GREEN}📖 Swagger文档: http://localhost:3006/api-doc${NC}"
    echo -e "${GREEN}🏥 健康检查: http://localhost:3006/health${NC}"
else
    echo -e "${RED}❌ 服务启动失败，请检查日志${NC}"
    docker-compose -f docker-compose-lite.yml logs
    exit 1
fi

# 显示容器信息
echo ""
echo "📋 容器信息："
docker-compose -f docker-compose-lite.yml ps

echo ""
echo "🎯 轻量级部署完成！"
echo "💡 使用以下命令管理轻量级服务："
echo "  查看状态: docker-compose -f docker-compose-lite.yml ps"
echo "  查看日志: docker-compose -f docker-compose-lite.yml logs -f"
echo "  停止服务: docker-compose -f docker-compose-lite.yml down"
echo "  重启服务: docker-compose -f docker-compose-lite.yml restart"