# 使用官方Node.js运行时镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies用于构建）
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 移除devDependencies减少镜像大小
RUN npm prune --production

# 创建非root用户运行应用
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 更改文件权限
RUN chown -R nestjs:nodejs /app
USER nestjs

# 暴露端口
EXPOSE 3005

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

# 启动应用
CMD ["npm", "run", "start:prod"]