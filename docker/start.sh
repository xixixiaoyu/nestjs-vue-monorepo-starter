#!/bin/bash

# Docker Compose 启动脚本
# 使用方法: ./docker/start.sh [environment] [options]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
Docker Compose 启动脚本

使用方法:
    $0 [environment] [options]

环境:
    dev         开发环境 (默认)
    prod        生产环境
    ci          CI/CD 环境

选项:
    --build     强制重新构建镜像
    --logs      启动后显示日志
    --tools     启用开发工具 (仅 dev 环境)
    --nginx     启用 Nginx 反向代理 (仅 prod 环境)
    --testing   运行测试 (仅 ci 环境)
    --quality   运行代码质量检查 (仅 ci 环境)
    --down      停止并删除容器
    --ps        显示服务状态
    --help      显示此帮助信息

示例:
    $0 dev --build --logs --tools
    $0 prod --nginx
    $0 ci --testing --quality
    $0 dev --down

EOF
}

# 检查 Docker 和 Docker Compose
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装或不在 PATH 中"
        exit 1
    fi
}

# 检查环境变量文件
check_env_file() {
    local env_file="docker/.env"
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        env_file="docker/.env.prod"
    fi

    if [[ ! -f "$env_file" ]]; then
        print_warning "环境变量文件 $env_file 不存在"
        if [[ -f "docker/.env.example" ]]; then
            print_info "从 docker/.env.example 创建 $env_file"
            cp docker/.env.example "$env_file"
            print_warning "请编辑 $env_file 文件，设置正确的环境变量"
        else
            print_error "找不到 docker/.env.example 文件"
            exit 1
        fi
    fi
}

# 构建 Docker Compose 命令
build_compose_command() {
    local base_cmd="docker-compose -f docker/compose/docker-compose.base.yml"
    
    case "$ENVIRONMENT" in
        "dev")
            base_cmd="$base_cmd -f docker/compose/docker-compose.dev.yml"
            ;;
        "prod")
            base_cmd="$base_cmd -f docker/compose/docker-compose.prod.yml"
            ;;
        "ci")
            base_cmd="$base_cmd -f docker/compose/docker-compose.ci.yml"
            ;;
        *)
            print_error "未知环境: $ENVIRONMENT"
            show_help
            exit 1
            ;;
    esac

    # 添加环境变量文件
    if [[ -f "docker/.env" ]]; then
        base_cmd="$base_cmd --env-file docker/.env"
    elif [[ -f "docker/.env.prod" && "$ENVIRONMENT" == "prod" ]]; then
        base_cmd="$base_cmd --env-file docker/.env.prod"
    fi

    echo "$base_cmd"
}

# 执行 Docker Compose 命令
run_compose() {
    local compose_cmd=$(build_compose_command)
    local action="$1"
    shift

    # 添加 profiles
    local profiles=()
    if [[ "$ENABLE_TOOLS" == "true" ]]; then
        profiles+=("--profile" "tools")
    fi
    if [[ "$ENABLE_NGINX" == "true" ]]; then
        profiles+=("--profile" "nginx")
    fi
    if [[ "$ENABLE_TESTING" == "true" ]]; then
        profiles+=("--profile" "testing")
    fi
    if [[ "$ENABLE_QUALITY" == "true" ]]; then
        profiles+=("--profile" "quality")
    fi

    # 添加其他选项
    local options=()
    if [[ "$FORCE_BUILD" == "true" ]]; then
        options+=("--build")
    fi

    case "$action" in
        "up")
            print_info "启动 $ENVIRONMENT 环境..."
            $compose_cmd "${profiles[@]}" up -d "${options[@]}"
            ;;
        "logs")
            $compose_cmd logs -f
            ;;
        "down")
            print_info "停止 $ENVIRONMENT 环境..."
            $compose_cmd "${profiles[@]}" down
            ;;
        "ps")
            $compose_cmd "${profiles[@]}" ps
            ;;
        *)
            print_error "未知操作: $action"
            exit 1
            ;;
    esac
}

# 默认值
ENVIRONMENT="dev"
FORCE_BUILD="false"
SHOW_LOGS="false"
ENABLE_TOOLS="false"
ENABLE_NGINX="false"
ENABLE_TESTING="false"
ENABLE_QUALITY="false"
ACTION="up"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|prod|ci)
            ENVIRONMENT="$1"
            shift
            ;;
        --build)
            FORCE_BUILD="true"
            shift
            ;;
        --logs)
            SHOW_LOGS="true"
            shift
            ;;
        --tools)
            ENABLE_TOOLS="true"
            shift
            ;;
        --nginx)
            ENABLE_NGINX="true"
            shift
            ;;
        --testing)
            ENABLE_TESTING="true"
            shift
            ;;
        --quality)
            ENABLE_QUALITY="true"
            shift
            ;;
        --down)
            ACTION="down"
            shift
            ;;
        --ps)
            ACTION="ps"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主函数
main() {
    print_info "Docker Compose 启动脚本"
    print_info "环境: $ENVIRONMENT"
    
    check_dependencies
    check_env_file
    
    if [[ "$ACTION" == "ps" ]]; then
        run_compose "ps"
        exit 0
    fi
    
    if [[ "$ACTION" == "down" ]]; then
        run_compose "down"
        print_success "服务已停止"
        exit 0
    fi
    
    run_compose "up"
    
    if [[ "$SHOW_LOGS" == "true" ]]; then
        print_info "显示日志..."
        run_compose "logs"
    else
        print_success "服务启动完成"
        print_info "使用 '$0 $ENVIRONMENT --logs' 查看日志"
        print_info "使用 '$0 $ENVIRONMENT --ps' 查看服务状态"
        print_info "使用 '$0 $ENVIRONMENT --down' 停止服务"
    fi
}

# 执行主函数
main "$@"