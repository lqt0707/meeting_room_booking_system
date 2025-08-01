#!/bin/bash

# 🔒 安全检查脚本 - 提交前运行此脚本确保敏感信息安全

echo "🔍 开始代码仓库安全检查..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查敏感文件
SENSITIVE_FILES=(
    "src/.env"
    ".env"
    ".env.local"
    ".env.production"
    ".env.development"
)

echo "📁 检查敏感文件..."
found_sensitive=false
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${RED}❌ 发现敏感文件: $file${NC}"
        found_sensitive=true
    fi
done

if [ "$found_sensitive" = false ]; then
    echo -e "${GREEN}✅ 未发现敏感配置文件${NC}"
fi

# 2. 检查gitignore配置
echo ""
echo "🔍 检查.gitignore配置..."
if grep -q "src/.env" .gitignore; then
    echo -e "${GREEN}✅ .gitignore已配置忽略src/.env${NC}"
else
    echo -e "${RED}❌ .gitignore未配置忽略src/.env${NC}"
fi

# 3. 检查git状态
echo ""
echo "📊 Git状态检查..."
git status --porcelain | while read line; do
    if [[ $line == *".env"* ]]; then
        echo -e "${YELLOW}⚠️  注意: $line 将被提交${NC}"
    else
        echo "✅ $line"
    fi
done

# 4. 检查文件内容
echo ""
echo "🔍 检查文件内容..."
SENSITIVE_PATTERNS=(
    "password.*="
    "secret.*="
    "key.*="
    "token.*="
    "host.*[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+"
)

found_content=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r "$pattern" --include="*.ts" --include="*.js" --include="*.json" src/ 2>/dev/null; then
        echo -e "${YELLOW}⚠️  发现可能的敏感信息: $pattern${NC}"
        found_content=true
    fi
done

if [ "$found_content" = false ]; then
    echo -e "${GREEN}✅ 代码内容检查通过${NC}"
fi

# 5. 提供建议
echo ""
echo "🎯 安全建议:"
echo "1. 确保所有.env文件都在.gitignore中"
echo "2. 使用模板文件(.env.example)代替真实配置"
echo "3. 提交前运行: git status 检查文件列表"
echo "4. 如有敏感文件，执行: rm src/.env 删除"
echo ""

# 6. 最终状态
echo "================================"
if [ "$found_sensitive" = true ]; then
    echo -e "${RED}❌ 发现敏感文件，请先清理后再提交${NC}"
    echo "建议执行: rm src/.env"
    exit 1
else
    echo -e "${GREEN}✅ 安全检查通过，可以安全提交代码${NC}"
fi