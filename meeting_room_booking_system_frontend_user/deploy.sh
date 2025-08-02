#!/bin/bash

# 会议房间预订系统前端用户界面独立部署脚本
# 用于本地独立部署并通过Nginx代理

set -e

# 颜色输出
color_red='\033[0;31m'
color_green='\033[0;32m'
color_yellow='\033[1;33m'
color_reset='\033[0m'

# 检查必要工具
echo -e "${color_green}🔍 检查必要工具...${color_reset}"
if ! command -v docker &> /dev/null; then
    echo -e "${color_red}❌ Docker未安装，请先安装Docker${color_reset}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${color_red}❌ Docker Compose未安装，请先安装Docker Compose${color_reset}"
    exit 1
fi

# 检查端口是否被占用
check_port_occupied() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${color_red}❌ 端口 $port 已被占用，请先释放端口${color_reset}"
        exit 1
    fi
}

# 检查3000端口是否被占用
check_port_occupied 3000

# 清理旧容器
echo -e "${color_green}🧹 清理旧容器...${color_reset}"
docker compose down 2>/dev/null || true

# 构建并启动服务
echo -e "${color_green}🔨 构建Docker镜像...${color_reset}"
docker compose build --no-cache

echo -e "${color_green}🚀 启动服务...${color_reset}"
docker compose up -d

# 等待服务启动
echo -e "${color_green}⏳ 等待服务启动...${color_reset}"
sleep 10

# 检查服务状态
if docker compose ps | grep -q "Up"; then
    echo -e "${color_green}✅ 前端用户界面服务启动成功！${color_reset}"
    echo -e "${color_green}🌐 访问地址: http://localhost:3000${color_reset}"
else
    echo -e "${color_red}❌ 前端用户界面服务启动失败，请检查日志${color_reset}"
    docker compose logs
    exit 1
fi

echo -e "${color_green}📋 容器状态:${color_reset}"
docker compose ps

echo -e "${color_green}🎯 前端用户界面部署完成！${color_reset}"
echo -e "${color_yellow}💡 管理命令:${color_reset}"
echo "  查看日志: docker compose logs -f"
echo "  停止服务: docker compose down"