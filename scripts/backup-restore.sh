#!/bin/bash

# Backup and Restore Script for Production LMS
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 {backup|restore|list|cleanup}"
    echo ""
    echo "Commands:"
    echo "  backup   - Create a full backup of database and application data"
    echo "  restore  - Restore from a backup"
    echo "  list     - List available backups"
    echo "  cleanup  - Remove old backups (keep last 10)"
    echo ""
    echo "Environment variables:"
    echo "  DATABASE_URL     - Database connection string (required)"
    echo "  BACKUP_DIR       - Backup directory (default: ./backups)"
    echo "  S3_BUCKET        - S3 bucket for remote backup storage (optional)"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore 20240112_143022"
    echo "  DATABASE_URL=postgres://... $0 backup"
    exit 1
}

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        warning "Docker not found. Application state backup will be limited."
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set."
        exit 1
    fi
    
    success "Dependencies checked"
}

create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    BACKUP_PATH="$BACKUP_DIR/lms_backup_$TIMESTAMP"
    mkdir -p "$BACKUP_PATH"
    log "Created backup directory: $BACKUP_PATH"
}

backup_database() {
    log "Starting database backup..."
    
    local db_file="$BACKUP_PATH/database.sql"
    local db_schema_file="$BACKUP_PATH/schema.sql"
    
    # Backup full database
    if pg_dump "$DATABASE_URL" > "$db_file" 2>/dev/null; then
        success "Database backup completed: $db_file"
    else
        error "Database backup failed"
        return 1
    fi
    
    # Backup schema only
    if pg_dump "$DATABASE_URL" --schema-only > "$db_schema_file" 2>/dev/null; then
        success "Schema backup completed: $db_schema_file"
    else
        warning "Schema backup failed"
    fi
    
    # Backup metadata
    cat > "$BACKUP_PATH/backup_info.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "database_url": "${DATABASE_URL%%@*}@***",
  "backup_type": "full",
  "created_by": "$(whoami)",
  "hostname": "$(hostname)",
  "version": "1.0.0"
}
EOF

    success "Database metadata saved"
}

backup_application_state() {
    log "Starting application state backup..."
    
    # Backup environment configuration (without secrets)
    if [ -f ".env.production" ]; then
        # Remove sensitive data while preserving structure
        grep -v -E "(PASSWORD|SECRET|KEY|TOKEN)" .env.production > "$BACKUP_PATH/env.template" 2>/dev/null || true
        success "Environment template saved"
    fi
    
    # Backup Docker configuration
    cp Dockerfile.prod "$BACKUP_PATH/" 2>/dev/null || true
    cp docker-compose.prod.yml "$BACKUP_PATH/" 2>/dev/null || true
    cp -r nginx "$BACKUP_PATH/" 2>/dev/null || true
    
    # Backup deployment scripts
    cp -r scripts "$BACKUP_PATH/" 2>/dev/null || true
    
    success "Application state backup completed"
}

upload_to_s3() {
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log "Uploading backup to S3..."
        
        local archive_name="lms_backup_$TIMESTAMP.tar.gz"
        
        # Create compressed archive
        tar -czf "/tmp/$archive_name" -C "$BACKUP_DIR" "lms_backup_$TIMESTAMP"
        
        # Upload to S3
        if aws s3 cp "/tmp/$archive_name" "s3://$S3_BUCKET/backups/" --storage-class STANDARD_IA; then
            success "Backup uploaded to S3: s3://$S3_BUCKET/backups/$archive_name"
            rm "/tmp/$archive_name"
        else
            warning "S3 upload failed, backup remains local only"
        fi
    fi
}

perform_backup() {
    log "🔄 Starting full LMS backup..."
    
    check_dependencies
    create_backup_dir
    backup_database
    backup_application_state
    upload_to_s3
    
    # Create summary
    local size=$(du -sh "$BACKUP_PATH" | cut -f1)
    cat > "$BACKUP_PATH/README.md" << EOF
# LMS Backup - $TIMESTAMP

## Backup Contents
- Database full dump: \`database.sql\`
- Database schema: \`schema.sql\`
- Application configuration: \`env.template\`
- Docker configuration: \`Dockerfile.prod\`, \`docker-compose.prod.yml\`
- Nginx configuration: \`nginx/\`
- Deployment scripts: \`scripts/\`
- Backup metadata: \`backup_info.json\`

## Restore Instructions
\`\`\`bash
./scripts/backup-restore.sh restore $TIMESTAMP
\`\`\`

## Backup Details
- **Size**: $size
- **Created**: $(date)
- **Database**: ${DATABASE_URL%%@*}@***
- **Type**: Full backup
EOF
    
    success "🎉 Backup completed successfully!"
    success "📍 Location: $BACKUP_PATH"
    success "📊 Size: $size"
}

list_backups() {
    log "📋 Available backups:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        warning "No backups found in $BACKUP_DIR"
        return
    fi
    
    printf "%-20s %-15s %-20s %-s\n" "TIMESTAMP" "SIZE" "CREATED" "STATUS"
    printf "%-20s %-15s %-20s %-s\n" "----------" "----" "-------" "------"
    
    for backup_dir in "$BACKUP_DIR"/lms_backup_*; do
        if [ -d "$backup_dir" ]; then
            local timestamp=$(basename "$backup_dir" | sed 's/lms_backup_//')
            local size=$(du -sh "$backup_dir" 2>/dev/null | cut -f1 || echo "Unknown")
            local created=""
            local status="✅ Complete"
            
            if [ -f "$backup_dir/backup_info.json" ]; then
                created=$(date -d "@$(stat -c %Y "$backup_dir")" 2>/dev/null || stat -f %Sm -t %Y-%m-%d "$backup_dir" 2>/dev/null || echo "Unknown")
            fi
            
            # Check backup integrity
            if [ ! -f "$backup_dir/database.sql" ]; then
                status="❌ Incomplete"
            fi
            
            printf "%-20s %-15s %-20s %-s\n" "$timestamp" "$size" "$created" "$status"
        fi
    done
}

restore_backup() {
    local backup_timestamp="$1"
    
    if [ -z "$backup_timestamp" ]; then
        error "Please specify backup timestamp"
        echo "Available backups:"
        list_backups
        exit 1
    fi
    
    local restore_path="$BACKUP_DIR/lms_backup_$backup_timestamp"
    
    if [ ! -d "$restore_path" ]; then
        error "Backup not found: $restore_path"
        list_backups
        exit 1
    fi
    
    log "🔄 Starting restore from backup: $backup_timestamp"
    
    # Confirm destructive operation
    echo ""
    warning "⚠️  This will REPLACE all current data with backup data!"
    warning "⚠️  Current database will be overwritten!"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
    
    check_dependencies
    
    # Restore database
    if [ -f "$restore_path/database.sql" ]; then
        log "Restoring database..."
        
        # Drop and recreate database (be very careful!)
        if psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null; then
            if psql "$DATABASE_URL" < "$restore_path/database.sql" > /dev/null 2>&1; then
                success "Database restored successfully"
            else
                error "Database restore failed"
                exit 1
            fi
        else
            error "Failed to prepare database for restore"
            exit 1
        fi
    else
        error "Database backup file not found: $restore_path/database.sql"
        exit 1
    fi
    
    # Restore application configuration
    if [ -f "$restore_path/env.template" ]; then
        warning "Environment template available at: $restore_path/env.template"
        warning "Please manually review and update your production environment variables"
    fi
    
    success "🎉 Restore completed successfully!"
    warning "⚠️  Please restart your application to ensure all changes take effect"
}

cleanup_old_backups() {
    log "🧹 Cleaning up old backups..."
    
    local keep_count=${KEEP_BACKUPS:-10}
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log "No backup directory found"
        return
    fi
    
    # Find and sort backup directories by timestamp
    local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "lms_backup_*" | wc -l)
    
    if [ "$backup_count" -le "$keep_count" ]; then
        log "No cleanup needed. Found $backup_count backups, keeping $keep_count"
        return
    fi
    
    local to_remove=$((backup_count - keep_count))
    log "Removing $to_remove old backups (keeping newest $keep_count)"
    
    # Remove oldest backups
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "lms_backup_*" -printf '%T@ %p\n' | \
        sort -n | head -n "$to_remove" | cut -d' ' -f2- | \
        while read -r backup_path; do
            local backup_name=$(basename "$backup_path")
            log "Removing old backup: $backup_name"
            rm -rf "$backup_path"
            success "Removed: $backup_name"
        done
    
    success "Cleanup completed"
}

# Main script logic
case "${1:-}" in
    backup)
        perform_backup
        ;;
    restore)
        restore_backup "${2:-}"
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        usage
        ;;
esac