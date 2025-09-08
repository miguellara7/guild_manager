# 🚀 Deployment Guide - Tibia Guild Manager

## 📋 Quick Start for Production Server

### 1. Initial Server Setup (Run once)
```bash
# Follow the complete guide in PRODUCTION-SETUP.md
# This includes Node.js, PostgreSQL, Nginx, PM2, etc.
```

### 2. Clone and Setup Project
```bash
# Clone repository
git clone https://github.com/yourusername/guildmanager.git
cd guildmanager

# Make scripts executable
chmod +x scripts/*.sh

# Setup environment
cp .env.example .env
nano .env  # Configure your production variables
```

### 3. Database Setup
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed initial data (optional)
npm run seed
```

### 4. Deploy Applications
```bash
# Deploy everything
./scripts/deploy.sh all

# Or deploy individually
./scripts/deploy.sh web
./scripts/deploy.sh mobile
```

---

## 🔄 Daily Workflow

### From Local Development Machine (Windows)
```bash
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin main
```

### On Production Server (Ubuntu)
```bash
# Deploy updates
./scripts/deploy.sh all

# Check status
./scripts/server-status.sh
```

---

## 📊 Monitoring Commands

```bash
# Check all services status
./scripts/server-status.sh

# View PM2 processes
pm2 list

# View logs
pm2 logs
pm2 logs guildmanager-web
pm2 logs guildmanager-mobile

# Monitor system resources
htop
```

---

## 💾 Backup & Maintenance

```bash
# Manual database backup
./scripts/backup-db.sh

# Setup automatic daily backups
crontab -e
# Add: 0 2 * * * /home/$USER/guildmanager/scripts/backup-db.sh
```

---

## 🔧 Troubleshooting

### Web App Not Loading
```bash
# Check if Next.js is running
pm2 logs guildmanager-web

# Restart web app
pm2 restart guildmanager-web

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

### Mobile App Issues
```bash
# Check Expo server
pm2 logs guildmanager-mobile

# Restart mobile app
pm2 restart guildmanager-mobile

# Check if port 8081 is available
netstat -tlnp | grep :8081
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U guilduser -d guildmanager -c "SELECT version();"

# View database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🌐 Access URLs

- **Web App**: http://74.208.149.168:3000
- **Mobile Dev**: Check PM2 logs for Expo tunnel URL
- **Health Check**: http://74.208.149.168/health

---

## 📱 Mobile App Development

### Expo Tunnel Access
```bash
# The mobile app runs with --tunnel flag for external access
# Check PM2 logs to get the tunnel URL
pm2 logs guildmanager-mobile

# Look for lines like:
# › Metro waiting on exp://abc-123.anonymous.exp.direct:80
# › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Testing on Device
1. Install Expo Go app on your Android device
2. Connect to same network or use tunnel URL
3. Scan QR code from PM2 logs
4. App will load on your device

---

## 🔒 Security Considerations

### Environment Variables
```bash
# Never commit .env files
# Use strong passwords for database
# Keep NEXTAUTH_SECRET secure and random
```

### Firewall Rules
```bash
# Check current rules
sudo ufw status

# Only necessary ports should be open:
# 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### SSL Certificate (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (if you have a domain)
sudo certbot --nginx -d yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

---

## 📈 Performance Optimization

### PM2 Cluster Mode (for high traffic)
```javascript
// In ecosystem.config.js
{
  name: 'guildmanager-web',
  script: 'npm',
  args: 'start',
  instances: 'max', // Use all CPU cores
  exec_mode: 'cluster'
}
```

### Database Optimization
```bash
# Monitor database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Optimize queries with EXPLAIN ANALYZE
psql -h localhost -U guilduser -d guildmanager
# EXPLAIN ANALYZE SELECT * FROM "Player" WHERE "isOnline" = true;
```

---

## 🆘 Emergency Procedures

### Complete Service Restart
```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx

# Start all services
sudo systemctl start nginx
pm2 start ecosystem.config.js
```

### Rollback to Previous Version
```bash
# Check git history
git log --oneline -10

# Rollback to specific commit
git checkout <commit-hash>
./scripts/deploy.sh all

# Return to latest
git checkout main
./scripts/deploy.sh all
```

### Database Recovery
```bash
# List available backups
ls -la ~/backups/

# Restore from backup
gunzip ~/backups/guildmanager_YYYYMMDD_HHMMSS.sql.gz
psql -h localhost -U guilduser -d guildmanager < ~/backups/guildmanager_YYYYMMDD_HHMMSS.sql
```

---

## 📞 Support Commands

```bash
# Complete system status
./scripts/server-status.sh

# View all logs
tail -f logs/*.log

# Check disk space
df -h

# Check memory usage
free -h

# Check network connections
netstat -tlnp

# Process tree
pstree -p
```
