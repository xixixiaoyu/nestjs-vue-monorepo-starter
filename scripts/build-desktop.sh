#!/bin/bash

echo "🔧 构建 Wails 桌面应用..."

# 检查是否在 CI 环境中
if [ "$CI" = "true" ]; then
    echo "🚀 检测到 CI 环境，设置环境变量..."
    
    # 确保 Go 已安装
    if ! command -v go &> /dev/null; then
        echo "❌ Go 未安装，请先安装 Go"
        exit 1
    fi
    
    # 确保 GOPATH/bin 在 PATH 中
    export PATH=$PATH:$(go env GOPATH)/bin
    
    echo "✅ Go 环境已准备: $(go version)"
fi

# 检查 Wails CLI 是否可用
if ! command -v wails &> /dev/null; then
    echo "❌ Wails CLI 不可用，尝试安装..."
    go install github.com/wailsapp/wails/v2/cmd/wails@latest
    export PATH=$PATH:$(go env GOPATH)/bin
    
    # 再次检查
    if ! command -v wails &> /dev/null; then
        echo "❌ Wails CLI 安装失败"
        exit 1
    fi
fi

echo "✅ Wails CLI 已准备就绪: $(wails version)"

# 下载 Go 依赖
echo "📥 下载 Go 依赖..."
if [ -d "apps/desktop" ]; then
    (cd apps/desktop && go mod tidy)
else
    (cd ../../apps/desktop && go mod tidy)
fi

# 构建应用
echo "🏗️ 构建 Wails 应用..."
if [ -d "apps/desktop" ]; then
    (cd apps/desktop && wails build)
else
    (cd ../../apps/desktop && wails build)
fi

echo "✅ 桌面应用构建完成！"