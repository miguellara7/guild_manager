#!/bin/bash

# 📊 Server Status Monitor for Tibia Guild Manager
# Shows comprehensive status of all services

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_NC='\033[0m'

log_info() {
    echo -e "${COLOR_BLUE}$1${COLOR_NC}"
}

log_success() {
    echo -e "${COLOR_GREEN}$1${COLOR_NC}"
}

log_warning() {
    echo -e "${COLOR_YELLOW}$1${COLOR_NC}"
}

log_error() {
    echo -e "${COLOR_RED}$1${COLOR_NC}"
}

print_header() {
    echo "=================================="
    log_info "$1"
    echo "=================================="
}

check_service() {
    local service_name=$1
    if systemctl is-active --quiet $service_name; then
        log_success "✅ $service_name is running"
    else
        log_error "❌ $service_name is not running"
    fi
}

check_port() {
    local port=$1
    local service=$2
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        log_success "✅ Port $port ($service) is open"
    else
        log_error "❌ Port $port ($service) is not accessible"
    fi
}

print_header "🖥️  SYSTEM STATUS"
echo "📅 Current time: $(date)"
echo "⏱️  Uptime: $(uptime -p)"
echo "💾 Memory usage:"
free -h
echo ""
echo "💿 Disk usage:"
df -h / | tail -1
echo ""

print_header "🔧 SYSTEM SERVICES"
check_service nginx
check_service postgresql
echo ""

print_header "📡 NETWORK STATUS"
check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 3000 "Next.js"
check_port 8081 "Expo"
check_port 5432 "PostgreSQL"
echo ""

print_header "🚀 PM2 PROCESSES"
if command -v pm2 >/dev/null 2>&1; then
    pm2 list
else
    log_error "❌ PM2 not installed"
fi
echo ""

print_header "🗄️  DATABASE STATUS"
if sudo -u postgres psql -c "SELECT version();" >/dev/null 2>&1; then
    log_success "✅ PostgreSQL is accessible"
    
    # Check database connection
    if psql -h localhost -U guilduser -d guildmanager -c "SELECT COUNT(*) FROM \"User\";" >/dev/null 2>&1; then
        log_success "✅ Application database is accessible"
        
        # Show basic stats
        USER_COUNT=$(psql -h localhost -U guilduser -d guildmanager -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | xargs)
        GUILD_COUNT=$(psql -h localhost -U guilduser -d guildmanager -t -c "SELECT COUNT(*) FROM \"Guild\";" 2>/dev/null | xargs)
        PLAYER_COUNT=$(psql -h localhost -U guilduser -d guildmanager -t -c "SELECT COUNT(*) FROM \"Player\";" 2>/dev/null | xargs)
        
        echo "📊 Database Stats:"
        echo "   👥 Users: $USER_COUNT"
        echo "   🏰 Guilds: $GUILD_COUNT"
        echo "   ⚔️  Players: $PLAYER_COUNT"
    else
        log_warning "⚠️  Cannot connect to application database"
    fi
else
    log_error "❌ Cannot connect to PostgreSQL"
fi
echo ""

print_header "📝 RECENT LOGS"
echo "🌐 Web App Logs (last 5 lines):"
if [ -f "logs/web-combined.log" ]; then
    tail -5 logs/web-combined.log
else
    log_warning "⚠️  No web logs found"
fi
echo ""

echo "📱 Mobile App Logs (last 5 lines):"
if [ -f "logs/mobile-combined.log" ]; then
    tail -5 logs/mobile-combined.log
else
    log_warning "⚠️  No mobile logs found"
fi
echo ""

print_header "🔗 ACCESS URLS"
log_info "🌐 Web Application: http://74.208.149.168:3000"
log_info "📱 Mobile Dev Server: Check PM2 logs for Expo tunnel URL"
log_info "📊 PM2 Monitor: pm2 monit"
echo ""

print_header "🛠️  QUICK COMMANDS"
echo "🔄 Restart all services: pm2 restart all"
echo "📊 View logs: pm2 logs"
echo "🔄 Deploy updates: ./scripts/deploy.sh"
echo "💾 Backup database: ./scripts/backup-db.sh"
echo "📈 Monitor system: htop"
