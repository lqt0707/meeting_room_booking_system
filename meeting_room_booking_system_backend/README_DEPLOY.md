# 🚀 一键部署指南（只看这个就够了！）

## 📋 一句话总结
**复制模板 → 改配置 → 一键部署** 三步搞定！

## 🎯 第一步：准备配置（2分钟）

### 1. 复制配置文件
```bash
cd /Users/lqt/Desktop/nest/meeting_room_booking_system/meeting_room_booking_system_backend
cp .env.docker .env
```

### 2. 修改.env文件（只改这5个地方）
```bash
# 用实际值替换以下5个配置
MYSQL_HOST=你的MySQL服务器IP地址
MYSQL_PASSWORD=你的数据库密码
REDIS_HOST=你的Redis服务器IP地址
REDIS_PASSWORD=你的Redis密码
EMAIL_PASSWORD=你的QQ邮箱授权码
```

## 🚀 第二步：一键部署（1分钟）

### 本地测试部署
```bash
./deploy.sh dev
```

### 生产环境部署
```bash
./deploy.sh prod
```

## 🔍 第三步：验证部署

### 检查服务状态
```bash
# 健康检查
curl http://localhost:3005/health

# 查看日志
docker-compose logs -f
```

## ❓ 常见问题

| 问题 | 解决方法 |
|------|----------|
| 不知道改什么配置 | 只改.env文件里的5个your-* |
| MySQL连接失败 | 检查安全组是否开放3306端口 |
| 邮箱配置错误 | 使用QQ邮箱授权码，不是登录密码 |
| Redis连接失败 | 检查Redis是否配置bind 0.0.0.0 |

## 📞 紧急联系
部署遇到问题？按这个顺序排查：
1. 检查`.env`文件配置
2. 查看`docker-compose logs`
3. 确认网络连通性

## 🎯 一句话总结
**记住：复制.env.docker → 改.env → ./deploy.sh → 完成！**

---
**其他文档不用看，就按这个三步走！**