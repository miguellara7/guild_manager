#!/bin/bash

# 🚀 Tibia Guild Manager - Deployment Script
# Usage: ./scripts/deploy.sh [web|mobile|all]

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_NC='\033[0m' # No Color

log_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_NC} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} $1"
}

log_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_NC} $1"
}

log_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_NC} $1"
}

# Default to deploying all if no argument provided
DEPLOY_TARGET=${1:-all}

log_info "🚀 Starting deployment process for: $DEPLOY_TARGET"

# Create logs directory if it doesn't exist
mkdir -p logs

# Pull latest changes from git
log_info "📥 Pulling latest changes from git..."
git pull origin main

deploy_web() {
    log_info "🌐 Deploying web application..."
    
    # Install dependencies if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        log_info "📦 Installing web dependencies..."
        npm install
    fi
    
    # Run database migrations if schema changed
    if git diff HEAD~1 HEAD --name-only | grep -q "prisma/schema.prisma"; then
        log_info "🗄️ Running database migrations..."
        npx prisma generate
        npx prisma db push
    fi
    
    # Build the application
    log_info "🔨 Building web application..."
    npm run build
    
    # Restart PM2 process
    log_info "🔄 Restarting web application..."
    pm2 restart guildmanager-web || pm2 start ecosystem.config.js --only guildmanager-web
    
    log_success "✅ Web application deployed successfully!"
}

deploy_mobile() {
    log_info "📱 Deploying mobile application..."
    
    cd mobile
    
    # Install dependencies if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "mobile/package.json"; then
        log_info "📦 Installing mobile dependencies..."
        npm install
    fi
    
    # Restart PM2 process
    log_info "🔄 Restarting mobile application..."
    pm2 restart guildmanager-mobile || pm2 start ../ecosystem.config.js --only guildmanager-mobile
    
    cd ..
    
    log_success "✅ Mobile application deployed successfully!"
}

# Deploy based on target
case $DEPLOY_TARGET in
    web)
        deploy_web
        ;;
    mobile)
        deploy_mobile
        ;;
    all)
        deploy_web
        deploy_mobile
        ;;
    *)
        log_error "Invalid deployment target. Use: web, mobile, or all"
        exit 1
        ;;
esac

# Save PM2 configuration
pm2 save

# Show final status
log_info "📊 Current application status:"
pm2 list

log_success "🎉 Deployment completed successfully!"
log_info "🔗 Web App: http://74.208.149.168:3000"
log_info "📱 Mobile Dev: Check PM2 logs for Expo tunnel URL"
