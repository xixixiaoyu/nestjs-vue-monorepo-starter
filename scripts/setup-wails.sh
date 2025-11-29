#!/bin/bash

echo "🚀 设置 Wails 开发环境..."

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ Go 未安装，请先安装 Go 1.21 或更高版本"
    echo "   访问 https://golang.org/dl/ 下载安装"
    exit 1
fi

echo "✅ Go 已安装: $(go version)"

# 检查 Wails CLI 是否安装
if ! command -v wails &> /dev/null; then
    echo "📦 安装 Wails CLI..."
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    
    # 检查安装是否成功
    if ! command -v wails &> /dev/null; then
        echo "❌ Wails CLI 安装失败，请检查 GOPATH 环境变量"
        echo "   确保 \$GOPATH/bin 在您的 PATH 中"
        exit 1
    fi
fi

echo "✅ Wails CLI 已安装: $(wails version)"

# 进入 desktop 目录并初始化 Go 模块
echo "🔧 初始化 Wails 项目..."
cd apps/desktop

# 下载 Go 依赖
echo "📥 下载 Go 依赖..."
go mod tidy

# 检查 Wails 配置
if [ ! -f "wails.json" ]; then
    echo "❌ wails.json 配置文件不存在"
    exit 1
fi

echo "✅ Wails 配置文件存在"

# 检查前端构建目录
if [ ! -d "../web/dist" ]; then
    echo "📁 创建前端构建目录..."
    mkdir -p ../web/dist
fi

# 创建临时 index.html（如果不存在）
if [ ! -f "../web/dist/index.html" ]; then
    echo "📄 创建临时 index.html..."
    cat > ../web/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desktop App</title>
</head>
<body>
    <div id="app">
        <h1>Desktop App Loading...</h1>
        <p>If you see this, the Wails desktop app is working correctly.</p>
        <p>The Vue.js frontend will be loaded here during development.</p>
    </div>
</body>
</html>
EOF
fi

echo "✅ 前端构建目录已准备"

# 返回根目录
cd ../..

echo "🎉 Wails 环境设置完成！"
echo ""
echo "📋 下一步："
echo "   1. 启动开发服务器: pnpm dev:all"
echo "   2. 或单独启动桌面端: pnpm dev:desktop"
echo "   3. 构建桌面应用: pnpm build:desktop"
echo ""
echo "📖 详细文档请参考: DESKTOP_INTEGRATION.md"