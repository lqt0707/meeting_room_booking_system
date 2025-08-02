#!/bin/bash

# 会议房间预订系统 - 极简无npm部署脚本
# 只需Docker环境，无需任何其他依赖

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 开始部署会议房间预订系统...${NC}"
echo -e "${GREEN}📦 使用Docker容器化部署，无需npm环境${NC}"

# 检查Docker
echo -e "${GREEN}🔍 检查Docker环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装${NC}"
    echo "安装命令："
    echo "  Ubuntu: sudo apt-get install docker.io docker-compose"
    echo "  CentOS: sudo yum install docker docker-compose"
    exit 1
fi

# 检查环境文件
echo -e "${GREEN}📋 检查配置文件...${NC}"
if [ ! -f "meeting_room_booking_system_backend/.env" ]; then
    if [ -f "meeting_room_booking_system_backend/.env.example" ]; then
        echo -e "${YELLOW}⚠️  创建环境配置文件...${NC}"
        cp meeting_room_booking_system_backend/.env.example meeting_room_booking_system_backend/.env
        echo -e "${YELLOW}⚠️  请编辑 meeting_room_booking_system_backend/.env 文件配置数据库连接${NC}"
        exit 1
    else
        echo -e "${RED}❌ 未找到环境配置文件模板${NC}"
        exit 1
    fi
fi

# 一键部署
echo -e "${GREEN}🔨 构建并启动所有服务...${NC}"
docker compose -f docker-compose-production.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose-production.yml build --no-cache
docker compose -f docker-compose-production.yml up -d

# 等待服务启动
echo -e "${GREEN}⏳ 等待服务启动...${NC}"
sleep 10

# 健康检查
echo -e "${GREEN}🔍 检查服务状态...${NC}"
services=("backend" "frontend-user" "frontend-admin" "nginx")
for service in "${services[@]}"; do
    if docker compose -f docker-compose-production.yml ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✅ $service 服务运行正常${NC}"
    else
        echo -e "${RED}❌ $service 服务启动失败${NC}"
    fi
done

# 显示结果
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}🌐 访问地址：${NC}"
echo -e "  用户界面: http://localhost"
echo -e "  管理界面: http://localhost/admin"
echo -e "  API文档: http://localhost/api-doc"
echo -e "  健康检查: http://localhost/api/health"
echo
echo -e "${GREEN}📋 管理命令：${NC}"
echo "  查看日志: docker compose -f docker-compose-production.yml logs -f"
echo "  停止服务: docker compose -f docker-compose-production.yml down"
echo "  重启服务: docker compose -f docker-compose-production.yml restart"
echo "  更新镜像: docker compose -f docker-compose-production.yml pull && docker compose -f docker-compose-production.yml up -d"

# 添加执行权限
chmod +x "$0"