# 会议房间预订系统后端Docker部署指南

## 概述
本文档详细说明了如何使用Docker将会议房间预订系统后端部署到云服务器，并连接外部数据库。

## 前置要求

### 云服务器配置
- **操作系统**: Ubuntu 20.04+ 或 CentOS 7+
- **最低配置**: 2核4G内存
- **推荐配置**: 4核8G内存
- **端口开放**: 3005 (应用端口), 3306 (MySQL), 6379 (Redis)

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+

## 部署步骤

### 1. 云服务器准备

#### 安装Docker和Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# CentOS/RHEL
sudo yum install docker docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
```

#### 配置防火墙
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 3005/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=3005/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### 2. 外部数据库配置

#### MySQL数据库配置
在外部MySQL服务器上执行：
```sql
-- 创建数据库
CREATE DATABASE meeting_room_booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'meeting_user'@'%' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON meeting_room_booking_system.* TO 'meeting_user'@'%';
FLUSH PRIVILEGES;
```

#### Redis配置
在外部Redis服务器上修改配置文件：
```bash
# 编辑Redis配置文件
sudo nano /etc/redis/redis.conf

# 修改以下配置
bind 0.0.0.0
protected-mode no
requirepass your-redis-password

# 重启Redis
sudo systemctl restart redis
```

### 3. 应用部署

#### 上传代码到服务器
```bash
# 使用scp上传代码
scp -r meeting_room_booking_system_backend user@your-server-ip:/home/user/

# 或者使用git克隆
ssh user@your-server-ip
cd /home/user
git clone your-repository-url
```

#### 配置环境变量
```bash
# 进入项目目录
cd meeting_room_booking_system_backend

# 创建环境变量文件
cp .env.docker .env

# 编辑.env文件
nano .env
```

### 环境变量配置说明

应用支持两种环境变量配置方式：

#### 方式1：使用.env文件（开发环境）
- 复制`.env.example`为`.env`文件
- 修改其中的配置值为实际值
- 适用于本地开发环境

#### 方式2：使用Docker环境变量（推荐生产环境）
- 创建`.env`文件（基于`.env.docker`模板）
- 所有配置通过docker-compose.yml的environment注入
- 不依赖项目内的.env文件，更安全

**环境变量映射关系：**

| 原始.env变量 | Docker环境变量 | 说明 |
|-------------|----------------|------|
| mysql_host | MYSQL_HOST | 数据库服务器地址 |
| mysql_port | MYSQL_PORT | 数据库端口 |
| mysql_user | MYSQL_USER | 数据库用户名 |
| mysql_password | MYSQL_PASSWORD | 数据库密码 |
| redis_server_host | REDIS_HOST | Redis服务器地址 |
| redis_server_password | REDIS_PASSWORD | Redis密码 |
| jwt_secret | JWT_SECRET | JWT密钥 |
| email_user | EMAIL_USER | 邮箱用户名 |
| email_pass | EMAIL_PASSWORD | 邮箱密码 |

#### 修改.env文件内容
```bash
# MySQL配置
MYSQL_HOST=your-mysql-server-ip
MYSQL_PORT=3306
MYSQL_USER=meeting_user
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=meeting_room_booking_system

# Redis配置
REDIS_HOST=your-redis-server-ip
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT配置
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=30m
JWT_REFRESH_TOKEN_EXPIRES=7d

# 邮件配置
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_USER=your-email@qq.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=your-email@qq.com

# 服务端口
NEST_PORT=3005
```

#### 部署应用
```bash
# 赋予执行权限
chmod +x deploy.sh

# 执行部署脚本
./deploy.sh
```

### 4. 验证部署

#### 检查服务状态
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试健康检查
curl http://your-server-ip:3005/health
```

#### API测试
```bash
# 测试注册接口
curl -X POST http://your-server-ip:3005/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com"}'

# 测试登录接口
curl -X POST http://your-server-ip:3005/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 生产环境优化

### 1. 安全配置

#### 使用HTTPS
```bash
# 安装Nginx和Certbot
sudo apt install nginx certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. 性能优化

#### Docker资源限制
在docker-compose.yml中添加：
```yaml
services:
  meeting-room-backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

### 3. 监控和日志

#### 日志管理
```bash
# 查看实时日志
docker-compose logs -f meeting-room-backend

# 查看最近100行日志
docker-compose logs --tail=100 meeting-room-backend
```

#### 资源监控
```bash
# 查看容器资源使用
docker stats

# 查看系统资源
top
htop
```

## 故障排除

### 常见问题

#### 数据库连接失败
```bash
# 检查数据库连接
telnet your-mysql-server-ip 3306

# 检查MySQL配置
mysql -h your-mysql-server-ip -u meeting_user -p
```

#### Redis连接失败
```bash
# 检查Redis连接
telnet your-redis-server-ip 6379

# 测试Redis认证
redis-cli -h your-redis-server-ip -a your-redis-password ping
```

#### 容器启动失败
```bash
# 查看详细日志
docker-compose logs meeting-room-backend

# 进入容器调试
docker-compose exec meeting-room-backend sh
```

### 重启服务
```bash
# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

## 更新部署

### 代码更新
```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy.sh
```

### 数据库迁移
```bash
# 如果数据库结构有变化，同步数据库结构
docker-compose exec meeting-room-backend npm run typeorm:migrate
```

## 备份和恢复

### 数据备份
```bash
# 备份数据库
mysqldump -h your-mysql-server-ip -u meeting_user -p meeting_room_booking_system > backup.sql

# 备份Redis数据
docker-compose exec meeting-room-backend redis-cli SAVE
```

### 数据恢复
```bash
# 恢复数据库
mysql -h your-mysql-server-ip -u meeting_user -p meeting_room_booking_system < backup.sql
```