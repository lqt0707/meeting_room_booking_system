# 🚀 立即部署到云服务器指南

## 快速部署清单（10分钟内完成）

### 📋 前提检查
确保你有：
- ✅ 云服务器IP地址
- ✅ SSH访问权限
- ✅ 外部MySQL和Redis服务器已就绪

### 🔧 第1步：服务器连接（本地执行）
```bash
# 替换为你的实际信息
SERVER_IP="your-server-ip"
SSH_USER="your-username"

# 测试连接
ssh ${SSH_USER}@${SERVER_IP}
```

### 📦 第2步：一键部署脚本（本地执行）
```bash
# 创建一键部署脚本
cat > deploy_to_cloud.sh << 'EOF'
#!/bin/bash

# 配置变量
SERVER_IP="${1:-your-server-ip}"
SSH_USER="${2:-root}"
PROJECT_DIR="/opt/meeting-room-backend"

if [ "$SERVER_IP" = "your-server-ip" ]; then
    echo "❌ 请提供服务器IP地址"
    echo "用法: ./deploy_to_cloud.sh <server-ip> [ssh-user]"
    exit 1
fi

echo "🚀 开始部署到云服务器 ${SERVER_IP}..."

# 1. 安装Docker（服务器端）
echo "📦 安装Docker..."
ssh ${SSH_USER}@${SERVER_IP} 'bash -s' << 'ENDSSH'
    # 安装Docker
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    
    # 安装Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # 启动Docker
    sudo systemctl start docker
    sudo systemctl enable docker
ENDSSH

# 2. 上传代码
echo "📤 上传代码..."
ssh ${SSH_USER}@${SERVER_IP} "mkdir -p ${PROJECT_DIR}"
scp -r ./* ${SSH_USER}@${SERVER_IP}:${PROJECT_DIR}/

# 3. 配置环境变量（交互式）
echo "⚙️ 配置环境变量..."
cat > .env.temp << 'ENVEOF'
# MySQL配置
MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=meeting_room_booking_system

# Redis配置
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=

# 邮件配置
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# 服务端口
NEST_PORT=3005
ENVEOF

echo "请编辑.env.temp文件填入实际配置，然后按回车继续..."
read -p "编辑完成后按回车继续..."

# 上传配置文件
scp .env.temp ${SSH_USER}@${SERVER_IP}:${PROJECT_DIR}/.env

# 4. 启动服务
echo "🐳 启动Docker服务..."
ssh ${SSH_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && chmod +x deploy.sh && ./deploy.sh"

echo "✅ 部署完成！"
echo "📍 访问地址: http://${SERVER_IP}:3005"
echo "📊 健康检查: curl http://${SERVER_IP}:3005/health"
echo "📝 查看日志: ssh ${SSH_USER}@${SERVER_IP} 'cd ${PROJECT_DIR} && docker-compose logs -f'"
EOF

# 赋予执行权限
chmod +x deploy_to_cloud.sh
```

### 🎯 第3步：执行部署
```bash
# 执行部署（替换为你的实际信息）
./deploy_to_cloud.sh 123.456.789.10 root
```

### 🔍 第4步：验证部署
部署完成后，执行以下命令验证：

```bash
# 测试健康检查
curl http://your-server-ip:3005/health

# 测试用户注册
curl -X POST http://your-server-ip:3005/user/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com"}'

# 测试登录
curl -X POST http://your-server-ip:3005/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 🔐 第5步：安全组配置
确保云服务器安全组开放以下端口：
- `3005/tcp` - 应用端口
- `22/tcp` - SSH端口

### 🚨 常见问题解决

#### 1. 连接被拒绝
```bash
# 检查服务器防火墙
ssh root@your-server-ip "sudo ufw status"
# 或
ssh root@your-server-ip "sudo firewall-cmd --list-all"
```

#### 2. 数据库连接失败
```bash
# 检查数据库连接
ssh root@your-server-ip "telnet your-mysql-server 3306"
ssh root@your-server-ip "telnet your-redis-server 6379"
```

#### 3. 容器启动失败
```bash
# 查看详细日志
ssh root@your-server-ip "cd /opt/meeting-room-backend && docker-compose logs --tail=50"
```

### 📞 技术支持
如果部署遇到问题：
1. 检查DEPLOY.md完整文档
2. 查看容器日志
3. 验证网络连通性
4. 确认环境变量配置

---

**💡 提示：首次部署建议先在测试环境验证所有配置，再部署到生产环境。**