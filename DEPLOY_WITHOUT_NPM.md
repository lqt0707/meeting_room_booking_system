# 无 npm 环境服务器部署指南

## 概述

本指南适用于在没有 npm 环境的服务器上部署会议房间预订系统。所有服务都使用 Docker 容器化部署，无需在服务器上安装 npm、Node.js 或其他开发工具。

## 前提条件

- 服务器已安装 Docker
- 服务器已安装 Docker Compose
- 服务器有足够的磁盘空间（建议至少 2GB）

## 部署步骤

### 1. 获取部署文件

将项目文件上传到服务器：

```bash
# 方法1：使用git克隆（推荐）
git clone <your-repo-url>
cd meeting_room_booking_system

# 方法2：使用scp上传
cp -r meeting_room_booking_system user@server:/path/to/deployment/
```

### 2. 配置环境变量

#### 后端配置

```bash
cd meeting_room_booking_system/meeting_room_booking_system_backend

# 复制环境文件模板
cp .env.example .env

# 编辑配置文件
vim .env
```

**必要配置项：**

- `DATABASE_HOST`: 数据库地址
- `DATABASE_PORT`: 数据库端口
- `DATABASE_USER`: 数据库用户名
- `DATABASE_PASSWORD`: 数据库密码
- `DATABASE_NAME`: 数据库名称
- `REDIS_HOST`: Redis 地址
- `JWT_SECRET`: JWT 密钥
- `EMAIL_USER`: 邮箱用户名
- `EMAIL_PASS`: 邮箱密码

### 3. 一键部署

```bash
# 在项目根目录执行
chmod +x deploy-all.sh
./deploy-all.sh
```

### 4. 验证部署

部署完成后，访问以下地址验证：

- 用户界面：http://your-server-ip
- 管理界面：http://your-server-ip/admin
- API 文档：http://your-server-ip/api-doc

## 无 npm 部署原理

### 容器化构建

1. **前端构建**：使用 Docker 多阶段构建

   - 阶段 1：使用 Node 容器构建生产包
   - 阶段 2：使用 Nginx 容器提供静态服务

2. **后端构建**：使用预构建镜像
   - 基于官方 Node.js 镜像
   - 包含所有依赖和运行时环境

### 部署脚本说明

#### 后端部署脚本 (`deploy.sh`)

```bash
#!/bin/bash
# 不依赖本地npm，使用Docker构建和运行
docker compose -f docker-compose-lite.yml up -d
```

#### 前端部署脚本 (`deploy.sh`)

```bash
#!/bin/bash
# 使用Docker构建，不依赖本地npm
docker compose up -d
```

#### 整体部署脚本 (`deploy-all.sh`)

```bash
#!/bin/bash
# 协调所有服务的部署
cd backend && ./deploy.sh
cd frontend-admin && ./deploy.sh
cd frontend-user && ./deploy.sh
cd nginx && ./deploy.sh
```

## 生产环境配置

### 1. 使用预构建镜像

为了进一步优化，可以预先构建镜像：

```bash
# 在开发环境构建镜像
docker build -t meeting-room-backend:latest ./meeting_room_booking_system_backend
docker build -t meeting-room-frontend-user:latest ./meeting_room_booking_system_frontend_user
docker build -t meeting-room-frontend-admin:latest ./meeting_room_booking_system_frontend_admin

# 推送到镜像仓库
docker push meeting-room-backend:latest
docker push meeting-room-frontend-user:latest
docker push meeting-room-frontend-admin:latest
```

### 2. 生产环境 docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    image: meeting-room-backend:latest
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  frontend-user:
    image: meeting-room-frontend-user:latest
    ports:
      - "3000:80"
    restart: unless-stopped

  frontend-admin:
    image: meeting-room-frontend-admin:latest
    ports:
      - "3001:80"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
```

### 3. 一键启动脚本

创建 `deploy-production.sh`：

```bash
#!/bin/bash
# 生产环境一键部署脚本

# 拉取最新镜像
docker pull meeting-room-backend:latest
docker pull meeting-room-frontend-user:latest
docker pull meeting-room-frontend-admin:latest

# 启动服务
docker compose -f docker-compose-production.yml up -d

# 健康检查
sleep 10
curl -f http://localhost/health || exit 1
```

## 常见问题

### 1. 端口冲突

如果 80 端口被占用，修改 nginx 配置：

```bash
# 编辑 nginx/docker-compose.yml
ports:
  - "8080:80"  # 改为其他端口
```

### 2. 内存不足

对于小内存服务器，调整 Docker 资源限制：

```yaml
# 在docker-compose.yml中添加
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 3. 网络问题

如果无法访问外部镜像仓库，使用国内镜像：

```bash
# 在Dockerfile中添加
RUN npm config set registry https://registry.npmmirror.com/
```

## 监控和维护

### 1. 查看日志

```bash
# 查看所有服务状态
docker compose ps

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend-user
docker compose logs -f frontend-admin
```

### 2. 更新服务

```bash
# 拉取最新镜像并重启
docker compose pull
docker compose up -d
```

### 3. 备份数据

```bash
# 备份数据库（如果使用Docker卷）
docker run --rm -v meeting-room-db:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## 总结

通过 Docker 容器化技术，我们实现了完全无 npm 依赖的部署方案：

- 所有构建过程在容器内完成
- 无需在服务器安装任何开发工具
- 一键部署，简单易用
- 支持生产环境扩展
- 易于维护和更新
