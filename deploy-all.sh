#!/bin/bash

# 会议房间预订系统一键部署脚本
# 用于本地独立部署并通过Nginx代理所有服务

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

# 获取当前脚本所在目录
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# 启动后端服务
echo -e "${color_green}🚀 启动后端服务...${color_reset}"
cd "${SCRIPT_DIR}/meeting_room_booking_system_backend"
chmod +x deploy.sh
./deploy.sh || echo -e "${color_red}⚠️  后端服务部署失败${color_reset}"

# 启动前端管理界面服务
echo -e "${color_green}🚀 启动前端管理界面服务...${color_reset}"
cd "${SCRIPT_DIR}/meeting_room_booking_system_frontend_admin"
chmod +x deploy.sh
./deploy.sh || echo -e "${color_red}⚠️  前端管理界面服务部署失败${color_reset}"

# 启动前端用户界面服务
echo -e "${color_green}🚀 启动前端用户界面服务...${color_reset}"
cd "${SCRIPT_DIR}/meeting_room_booking_system_frontend_user"
chmod +x deploy.sh
./deploy.sh || echo -e "${color_red}⚠️  前端用户界面服务部署失败${color_reset}"

# 启动Nginx代理服务
echo -e "${color_green}🚀 启动Nginx代理服务...${color_reset}"
cd "${SCRIPT_DIR}/nginx"
chmod +x deploy.sh
./deploy.sh || echo -e "${color_red}⚠️  Nginx代理服务部署失败${color_reset}"

echo -e "${color_green}🎉 所有服务部署完成！${color_reset}"
echo -e "${color_green}🌐 前端用户界面访问地址: http://localhost${color_reset}"
echo -e "${color_green}🌐 前端管理界面访问地址: http://localhost/admin${color_reset}"
echo -e "${color_green}🌐 后端API访问地址: http://localhost/api${color_reset}"