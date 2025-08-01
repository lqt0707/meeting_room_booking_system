#!/bin/bash

# 会议房间预订系统后端Docker部署脚本（修复版）
# 解决服务器上段错误问题，使用新的docker compose命令

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认环境
ENV=${1:-prod}

echo -e "${GREEN}开始部署会议房间预订系统后端（修复版）...${NC}"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装，请先安装Docker${NC}"
    exit 1
fi

# 检查Docker Compose是否安装（使用新的docker compose命令）
if ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装，请先安装Docker Compose${NC}"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: 未找到.env文件，将使用.env.example模板${NC}"
    if [ ! -f .env.example ]; then
        echo -e "${RED}错误: 未找到.env.example模板文件${NC}"
        exit 1
    fi
    cp .env.example .env
    echo -e "${YELLOW}请编辑.env文件填入实际配置后再运行此脚本${NC}"
    exit 1
fi

# 清理旧容器（使用docker compose命令）
echo -e "${GREEN}清理当前项目的旧容器...${NC}"
docker compose down 2>/dev/null || true

# 构建镜像（使用docker compose命令）
echo -e "${GREEN}构建Docker镜像...${NC}"
docker compose build --no-cache

# 启动服务
echo -e "${GREEN}启动服务...${NC}"
docker compose up -d

# 等待服务启动
echo -e "${GREEN}等待服务启动...${NC}"
sleep 15

# 检查服务状态
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}服务启动成功！${NC}"
    echo -e "${GREEN}服务运行在: http://localhost:3005${NC}"
    echo -e "${GREEN}健康检查: http://localhost:3005/health${NC}"
else
    echo -e "${RED}服务启动失败，请检查日志${NC}"
    docker compose logs
    exit 1
fi

# 显示容器状态
echo -e "${GREEN}容器状态:${NC}"
docker compose ps

echo -e "${GREEN}部署完成！${NC}"
echo -e "${YELLOW}使用以下命令查看日志: docker compose logs -f${NC}"
echo -e "${YELLOW}使用以下命令停止服务: docker compose down${NC}"