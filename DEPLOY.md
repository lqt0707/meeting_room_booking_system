# 部署指南

本项目包含三个独立的服务：后端服务、前端管理界面和前端用户界面。它们可以通过 Docker 独立部署，并通过 Nginx 进行代理。

## 项目结构

```
meeting_room_booking_system/
├── meeting_room_booking_system_backend/
├── meeting_room_booking_system_frontend_admin/
├── meeting_room_booking_system_frontend_user/
├── docker-compose-all.yml
├── nginx/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── nginx.Dockerfile
└── DEPLOY.md
```

## 部署方式

### 1. 独立部署每个服务

每个服务都可以独立部署，使用各自目录下的 docker-compose.yml 文件：

```bash
# 部署后端服务
cd meeting_room_booking_system_backend
docker-compose up -d

# 部署前端管理界面
cd meeting_room_booking_system_frontend_admin
docker-compose up -d

# 部署前端用户界面
cd meeting_room_booking_system_frontend_user
docker-compose up -d
```

### 2. 一体化部署（所有服务在同一台服务器）

使用 docker-compose-all.yml 一键部署所有服务：

```bash
docker-compose -f docker-compose-all.yml up -d
```

### 3. Nginx 独立部署

如果需要独立部署 Nginx 服务，可以进入 nginx 目录并使用其 docker-compose.yml 文件：

```bash
cd nginx
docker-compose up -d
```

### 3. 分布式部署（服务部署在不同服务器）

在分布式部署中，每个服务都在独立的服务器上运行。您需要分别构建和运行每个服务，并配置 Nginx 代理。

1. 分别在每台服务器上构建和部署对应的服务：

   ```bash
   # 在后端服务器上
   cd meeting_room_booking_system_backend
   docker build -t backend-service .
   docker run -d -p 127.0.0.1:3005:3005 --name backend-service backend-service

   # 在前端管理界面服务器上
   cd meeting_room_booking_system_frontend_admin
   docker build -t frontend-admin-service .
   docker run -d -p 127.0.0.1:3001:80 --name frontend-admin-service frontend-admin-service

   # 在前端用户界面服务器上
   cd meeting_room_booking_system_frontend_user
   docker build -t frontend-user-service .
   docker run -d -p 127.0.0.1:3000:80 --name frontend-user-service frontend-user-service
   ```

2. 修改 `nginx/nginx.conf` 中的服务器地址为实际的服务器 IP 地址。

3. 部署 Nginx 代理服务器，使用更新后的 `nginx/nginx.conf` 配置文件：

   ```bash
   cd nginx
   docker build -t nginx-proxy .
   docker run -d -p 127.0.0.1:80:80 --name nginx-proxy nginx-proxy
   ```

## 配置说明

### Nginx 配置

- `/api` 路径的请求会被代理到后端服务
- `/admin` 路径的请求会被代理到前端管理界面
- 其他所有请求会被代理到前端用户界面

### 多项目部署

如果在同一台服务器上部署多个独立的前端或后端项目，可以通过以下方式配置 Nginx 进行代理：

1. 为每个项目分配不同的端口
2. 在 nginx.conf 中添加新的 upstream 和 location 配置
3. 重启 Nginx 服务使配置生效

示例配置：

```nginx
# 新增的项目upstream
upstream another-backend {
    server host.docker.internal:3006;  # 假设新后端项目监听3006端口
}

upstream another-frontend {
    server host.docker.internal:3002;  # 假设新前端项目监听3002端口
}

server {
    # ... 其他配置 ...

    # 为新项目添加location代理规则
    location ^~ /another-api {
        rewrite ^/another-api/(.*)$ /$1 break;
        proxy_pass http://another-backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /another-frontend {
        proxy_pass http://another-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

注意：确保新项目监听的端口没有被其他服务占用，并且在防火墙中开放了相应端口。

### 网络隔离

为了防止与其他 Docker 服务冲突，所有服务都绑定到 127.0.0.1 IP 地址，只在本地网络接口上监听。如果需要从外部访问服务，可以修改端口映射配置。

### 环境变量

后端服务支持通过环境变量配置，具体可参考后端项目的文档。
