#!/bin/bash

# 🗄️ Database Backup Script for Tibia Guild Manager
# Creates timestamped backups of the PostgreSQL database

set -e

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_NC='\033[0m'

log_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_NC} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_NC} $1"
}

log_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_NC} $1"
}

# Configuration
DB_NAME="guildmanager"
DB_USER="guilduser"
DB_HOST="localhost"
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/guildmanager_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_info "🗄️ Starting database backup..."
log_info "📅 Timestamp: $DATE"
log_info "📁 Backup location: $BACKUP_FILE"

# Create database backup
if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"; then
    log_success "✅ Database backup created successfully!"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    log_success "🗜️ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Get file size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    log_info "📊 Backup size: $BACKUP_SIZE"
    
    # Clean up old backups (keep last 7 days)
    log_info "🧹 Cleaning up old backups..."
    find "$BACKUP_DIR" -name "guildmanager_*.sql.gz" -mtime +7 -delete
    
    # Show remaining backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "guildmanager_*.sql.gz" | wc -l)
    log_info "📦 Total backups retained: $BACKUP_COUNT"
    
else
    log_error "❌ Database backup failed!"
    exit 1
fi

log_success "🎉 Backup process completed successfully!"
