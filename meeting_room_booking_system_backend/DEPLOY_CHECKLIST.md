# 📝 部署配置检查清单

## ✅ 必须修改的配置项

### 第1步：复制配置文件
```bash
cd /Users/lqt/Desktop/nest/meeting_room_booking_system/meeting_room_booking_system_backend
cp .env.example .env
```

### 第2步：编辑.env文件
使用你喜欢的编辑器打开.env文件，修改以下占位符为实际值：

```bash
# 用实际值替换以下配置

# MySQL数据库配置
MYSQL_HOST=替换为你的MySQL服务器IP地址
MYSQL_USER=替换为你的数据库用户名
MYSQL_PASSWORD=替换为你的数据库密码

# Redis配置
REDIS_HOST=替换为你的Redis服务器IP地址
REDIS_PASSWORD=替换为你的Redis密码

# JWT安全配置（生成一个强密码）
JWT_SECRET=替换为至少32位的随机字符串

# 邮件配置
EMAIL_USER=替换为你的QQ邮箱地址
EMAIL_PASSWORD=替换为你的QQ邮箱授权码（不是登录密码！）
EMAIL_FROM=替换为你的QQ邮箱地址
```

### 第3步：快速验证配置

#### 🔍 检查MySQL连接
```bash
# 在服务器上测试
telnet $MYSQL_HOST 3306
```

#### 🔍 检查Redis连接
```bash
# 在服务器上测试
telnet $REDIS_HOST 6379
```

#### 🔍 检查邮件配置
```bash
# 确保使用的是QQ邮箱授权码
# 获取方式：QQ邮箱设置 -> 账户 -> 开启SMTP服务 -> 获取授权码
```

## 🚨 常见错误提醒

| 错误场景 | 正确做法 |
|---------|----------|
| 使用MySQL登录密码 | 使用数据库专用用户密码 |
| 使用QQ邮箱登录密码 | 使用16位授权码 |
| JWT_SECRET太短 | 使用32位以上随机字符串 |
| 服务器IP写成localhost | 使用实际服务器IP地址 |
| Redis无密码 | 设置Redis密码并配置 |

## 🎯 一键配置脚本

```bash
#!/bin/bash
# 保存为setup_env.sh

echo "🔧 开始配置部署环境..."

# 获取用户输入
read -p "请输入MySQL服务器IP: " MYSQL_HOST
read -p "请输入MySQL用户名: " MYSQL_USER
read -p "请输入MySQL密码: " MYSQL_PASSWORD
read -p "请输入Redis服务器IP: " REDIS_HOST
read -p "请输入Redis密码: " REDIS_PASSWORD
read -p "请输入QQ邮箱地址: " EMAIL_USER
read -p "请输入QQ邮箱授权码: " EMAIL_PASSWORD

# 生成JWT密钥
JWT_SECRET=$(openssl rand -base64 32)

# 创建.env文件
cat > .env << EOF
# MySQL配置
MYSQL_HOST=$MYSQL_HOST
MYSQL_PORT=3306
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_DATABASE=meeting_room_booking_system

# Redis配置
REDIS_HOST=$REDIS_HOST
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT配置
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_TOKEN_EXPIRES=30m
JWT_REFRESH_TOKEN_EXPIRES=7d

# 邮件配置
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_USER
EMAIL_FROM_NAME=会议房间预订系统

# 服务端口
NEST_PORT=3005
EOF

echo "✅ 配置文件已创建！"
echo "📍 文件位置: $(pwd)/.env"
echo "🔑 JWT密钥已自动生成: $JWT_SECRET"
```

## 🚀 使用方法

1. **保存上述脚本为setup_env.sh**
2. **执行脚本**
   ```bash
   chmod +x setup_env.sh
   ./setup_env.sh
   ```
3. **检查生成的.env文件**
   ```bash
   cat .env
   ```
4. **开始部署**
   ```bash
   ./deploy.sh
   ```

## 📞 遇到问题？

- **MySQL连接失败**：检查服务器防火墙和安全组
- **Redis连接失败**：确认Redis已配置bind 0.0.0.0
- **邮件发送失败**：确认QQ邮箱已开启SMTP服务
- **JWT报错**：检查JWT_SECRET长度是否足够