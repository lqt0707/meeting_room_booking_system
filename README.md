# 会议房间预订系统

## 项目简介
这是一个基于Nest.js + React的会议房间预订系统，包含用户端和管理端两个前端应用。

## 项目结构
```
meeting_room_booking_system/
├── meeting_room_booking_system_backend/     # 后端API服务
├── meeting_room_booking_system_frontend_user/   # 用户前端应用
├── meeting_room_booking_system_frontend_admin/    # 管理前端应用
└── README.md
```

## 技术栈
- **后端**: Nest.js, TypeScript, MySQL, Redis
- **前端**: React, TypeScript, Ant Design
- **数据库**: MySQL
- **缓存**: Redis

## 安全注意事项

### 敏感信息保护
本项目已配置以下安全措施：

1. **环境变量文件保护**
   - `.env` 文件已被添加到 `.gitignore`
   - `.env.example` 提供了配置模板，不包含真实敏感信息
   - 上传前请确保删除所有 `.env` 文件

2. **敏感文件忽略**
   - 上传文件目录 `uploads/` 已被忽略
   - 日志文件 `*.log` 已被忽略
   - 依赖目录 `node_modules/` 已被忽略
   - IDE配置文件已被忽略

3. **上传前检查清单**
   - [ ] 删除所有 `.env` 文件
   - [ ] 清空 `uploads/` 目录中的测试文件
   - [ ] 确认没有包含数据库密码、API密钥等敏感信息
   - [ ] 检查代码中是否硬编码了敏感信息

### 配置说明
1. 复制 `.env.example` 为 `.env` 并填入实际配置
2. 确保所有敏感信息都通过环境变量配置
3. 不要在代码中硬编码任何敏感信息

## 快速开始

### 后端启动
```bash
cd meeting_room_booking_system_backend
npm install
# 配置.env文件后
npm run start:dev
```

### 用户前端启动
```bash
cd meeting_room_booking_system_frontend_user
npm install
npm start
```

### 管理前端启动
```bash
cd meeting_room_booking_system_frontend_admin
npm install
npm start
```

## 开发规范
- 所有敏感信息必须通过环境变量配置
- 提交代码前检查是否包含敏感信息
- 使用 `.env.example` 作为配置模板

## 许可证
MIT License