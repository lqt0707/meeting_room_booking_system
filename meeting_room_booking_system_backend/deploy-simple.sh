#!/bin/bash

# 会议房间预订系统后端Docker部署脚本（简化版）
# 解决段错误问题，使用直接Docker命令

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}开始简化部署会议房间预订系统后端...${NC}"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    exit 1
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}创建.env文件...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}请编辑.env文件后重新运行${NC}"
    exit 1
fi

# 手动停止容器（避免docker-compose段错误）
echo -e "${GREEN}停止旧容器...${NC}"
docker stop meeting-room-backend 2>/dev/null || true
docker stop wait-for-db 2>/dev/null || true
docker rm meeting-room-backend 2>/dev/null || true
docker rm wait-for-db 2>/dev/null || true

# 直接构建镜像
echo -e "${GREEN}构建镜像...${NC}"
docker build -t meeting-room-backend:latest .

# 创建网络
echo -e "${GREEN}创建网络...${NC}"
docker network create meeting-room-network 2>/dev/null || true

# 启动服务
echo -e "${GREEN}启动服务...${NC}"
docker run -d \
    --name wait-for-db \
    --network meeting-room-network \
    alpine:latest \
    sh -c "until nc -z mysql 3306 && nc -z redis 6379; do sleep 1; done"

docker run -d \
    --name meeting-room-backend \
    --network meeting-room-network \
    -p 3005:3005 \
    --env-file .env \
    meeting-room-backend:latest

# 等待启动
sleep 10

# 检查状态
if docker ps | grep -q "meeting-room-backend"; then
    echo -e "${GREEN}部署成功！访问: http://localhost:3005${NC}"
else
    echo -e "${RED}部署失败，查看日志: docker logs meeting-room-backend${NC}"
fi

docker ps