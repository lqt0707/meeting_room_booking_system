# 🔒 代码仓库安全提交检查清单

## ✅ 提交前必做检查

### 1. 敏感文件检查
```bash
# 检查是否有.env文件被意外提交
git status

# 检查.gitignore是否生效
git check-ignore .env src/.env

# 检查历史提交记录
git log --oneline --grep="env\|password\|secret\|key"
```

### 2. 自动清理敏感信息
```bash
# 清理本地敏感文件（保留模板）
rm -f src/.env
rm -f .env.local
rm -f .env.production
```

### 3. 验证提交内容
```bash
# 查看即将提交的文件列表
git diff --cached --name-only

# 检查文件内容是否包含敏感信息
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" --include="*.json" src/ || echo "未发现敏感信息"
```

## 🚨 已保护文件
当前.gitignore已正确配置，以下文件不会被提交：
- ✅ `.env` 及其所有变体
- ✅ `src/.env`
- ✅ `*.log` 日志文件
- ✅ `node_modules/` 依赖目录
- ✅ `dist/` 构建目录

## 📋 安全提交步骤

### 方式1：使用脚本自动检查
```bash
# 创建安全检查脚本
cat > security_check.sh << 'EOF'
#!/bin/bash
echo "🔍 开始安全检查..."

# 检查敏感文件
if [ -f "src/.env" ]; then
    echo "⚠️  发现 src/.env 文件，建议删除"
    echo "执行: rm src/.env"
fi

# 检查git状态
echo "📊 Git状态检查:"
git status --porcelain

echo "✅ 安全检查完成"
EOF

chmod +x security_check.sh
./security_check.sh
```

### 方式2：手动检查
1. `git status` - 确认无敏感文件
2. `git add .` - 添加所有非忽略文件
3. `git commit -m "feat: 添加新功能"` - 提交
4. `git push` - 推送

## 🎯 记住
- **永远不要在代码中包含真实密码**
- **永远不要在代码中包含服务器IP**
- **永远不要在代码中包含邮箱授权码**
- **使用模板文件(.env.example)代替真实配置**