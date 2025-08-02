#!/bin/bash

# 会议房间预订系统 - 无npm环境生产部署脚本
# 适用于没有npm、Node.js环境的服务器

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_requirements() {
    print_info "检查必要工具..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        print_info "安装命令："
        print_info "  Ubuntu/Debian: sudo apt-get install docker.io docker-compose"
        print_info "  CentOS/RHEL: sudo yum install docker docker-compose"
        print_info "  或使用官方安装脚本: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        print_error "Docker Compose未安装，请先安装Docker Compose"
        print_info "安装命令："
        print_info "  sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
        print_info "  sudo chmod +x /usr/local/bin/docker-compose"
        exit 1
    fi
    
    print_info "Docker环境检查通过 ✓"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查端口占用
check_ports() {
    local ports=("80" "3005" "3000" "3001")
    
    print_info "检查端口占用..."
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "端口 $port 已被占用"
            print_info "占用进程：$(lsof -t -i:$port 2>/dev/null || echo '未知')"
            read -p "是否继续部署？(y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    done
}

# 部署后端服务
deploy_backend() {
    print_info "部署后端服务..."
    cd "${SCRIPT_DIR}/meeting_room_booking_system_backend"
    
    # 检查环境文件
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning "未找到.env文件，将使用.env.example模板"
            cp .env.example .env
            print_warning "请编辑.env文件配置数据库连接信息"
            print_info "关键配置项："
            print_info "  DATABASE_HOST=数据库地址"
            print_info "  DATABASE_PORT=数据库端口"
            print_info "  DATABASE_USER=数据库用户名"
            print_info "  DATABASE_PASSWORD=数据库密码"
            print_info "  DATABASE_NAME=数据库名称"
            exit 1
        else
            print_error "未找到.env.example文件"
            exit 1
        fi
    fi
    
    # 清理旧容器
    print_info "清理旧的后端容器..."
    docker compose -f docker-compose-lite.yml down --remove-orphans 2>/dev/null || true
    
    # 构建并启动
    print_info "构建后端镜像..."
    docker compose -f docker-compose-lite.yml build --no-cache
    
    print_info "启动后端服务..."
    docker compose -f docker-compose-lite.yml up -d
    
    # 等待服务启动
    print_info "等待后端服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:3005/health >/dev/null 2>&1; then
            print_info "后端服务启动成功 ✓"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "后端服务启动超时"
            docker compose -f docker-compose-lite.yml logs
            exit 1
        fi
        sleep 2
    done
}

# 部署前端用户界面
deploy_frontend_user() {
    print_info "部署前端用户界面..."
    cd "${SCRIPT_DIR}/meeting_room_booking_system_frontend_user"
    
    # 清理旧容器
    print_info "清理旧的前端用户容器..."
    docker compose down --remove-orphans 2>/dev/null || true
    
    # 构建并启动
    print_info "构建前端用户镜像..."
    docker compose build --no-cache
    
    print_info "启动前端用户服务..."
    docker compose up -d
    
    # 等待服务启动
    print_info "等待前端用户服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_info "前端用户服务启动成功 ✓"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "前端用户服务启动超时"
            docker compose logs
            exit 1
        fi
        sleep 2
    done
}

# 部署前端管理界面
deploy_frontend_admin() {
    print_info "部署前端管理界面..."
    cd "${SCRIPT_DIR}/meeting_room_booking_system_frontend_admin"
    
    # 清理旧容器
    print_info "清理旧的前端管理容器..."
    docker compose down --remove-orphans 2>/dev/null || true
    
    # 构建并启动
    print_info "构建前端管理镜像..."
    docker compose build --no-cache
    
    print_info "启动前端管理服务..."
    docker compose up -d
    
    # 等待服务启动
    print_info "等待前端管理服务启动..."
    for i in {1..30}; do
        if curl -f http://localhost:3001 >/dev/null 2>&1; then
            print_info "前端管理服务启动成功 ✓"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "前端管理服务启动超时"
            docker compose logs
            exit 1
        fi
        sleep 2
    done
}

# 部署Nginx代理
deploy_nginx() {
    print_info "部署Nginx代理服务..."
    cd "${SCRIPT_DIR}/nginx"
    
    # 清理旧容器
    print_info "清理旧的Nginx容器..."
    docker compose down --remove-orphans 2>/dev/null || true
    
    # 构建并启动
    print_info "构建Nginx镜像..."
    docker compose build --no-cache
    
    print_info "启动Nginx代理..."
    docker compose up -d
    
    # 等待服务启动
    print_info "等待Nginx代理启动..."
    for i in {1..30}; do
        if curl -f http://localhost >/dev/null 2>&1; then
            print_info "Nginx代理启动成功 ✓"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Nginx代理启动超时"
            docker compose logs
            exit 1
        fi
        sleep 2
    done
}

# 显示部署结果
show_result() {
    print_info "🎉 所有服务部署完成！"
    echo
    print_info "访问地址："
    print_info "  用户界面: http://localhost"
    print_info "  管理界面: http://localhost/admin"
    print_info "  API文档: http://localhost/api-doc"
    print_info "  健康检查: http://localhost/api/health"
    echo
    print_info "管理命令："
    print_info "  查看所有容器: docker ps"
    print_info "  查看后端日志: docker compose -f meeting_room_booking_system_backend/docker-compose-lite.yml logs -f"
    print_info "  查看用户前端日志: docker compose -f meeting_room_booking_system_frontend_user/docker-compose.yml logs -f"
    print_info "  查看管理前端日志: docker compose -f meeting_room_booking_system_frontend_admin/docker-compose.yml logs -f"
    print_info "  查看Nginx日志: docker compose -f nginx/docker-compose.yml logs -f"
    print_info "  停止所有服务: docker compose -f nginx/docker-compose.yml down && docker compose -f meeting_room_booking_system_backend/docker-compose-lite.yml down && docker compose -f meeting_room_booking_system_frontend_user/docker-compose.yml down && docker compose -f meeting_room_booking_system_frontend_admin/docker-compose.yml down"
}

# 主函数
main() {
    print_info "🚀 开始部署会议房间预订系统..."
    print_info "部署模式：无npm环境Docker容器化部署"
    
    check_requirements
    check_ports
    
    deploy_backend
    deploy_frontend_user
    deploy_frontend_admin
    deploy_nginx
    
    show_result
}

# 执行主函数
main "$@"