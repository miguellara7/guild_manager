# 🚀 Tibia Guild Manager - Production Server Setup

## 📋 Server Information
- **IP**: 74.208.149.168
- **OS**: Ubuntu 22.04 LTS
- **Environment**: Production

---

## 🛠️ Initial Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Essential Tools
```bash
# Basic development tools
sudo apt install -y curl wget git vim nano htop unzip build-essential

# Screen for multiple sessions
sudo apt install -y screen

# SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🟢 Node.js 20+ Installation

### Method 1: Using NodeSource Repository (Recommended)
```bash
# Download and import NodeSource GPG key
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Create deb repository
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Update and install Node.js 20
sudo apt update
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Method 2: Using NVM (Alternative)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 🐘 PostgreSQL Database Setup

### 1. Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configure Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run inside psql)
CREATE DATABASE guildmanager;
CREATE USER guilduser WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE guildmanager TO guilduser;
ALTER USER guilduser CREATEDB;
\q
```

### 3. Configure PostgreSQL for External Connections (if needed)
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and uncomment/modify:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add line for your app:
host    guildmanager    guilduser    127.0.0.1/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🌐 Nginx Web Server Setup

### 1. Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

### 3. Nginx Configuration for Next.js
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/guildmanager

# Add the following configuration:
```

```nginx
server {
    listen 80;
    server_name 74.208.149.168 your-domain.com;

    # Next.js Web App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Expo Dev Server (for development)
    location /expo/ {
        proxy_pass http://localhost:8081/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/guildmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📦 PM2 Process Manager

### 1. Install PM2 Globally
```bash
npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 2. Create PM2 Ecosystem File
```bash
# This will be created in your project directory later
nano ecosystem.config.js
```

---

## 🔧 Git Configuration

### 1. Configure Git
```bash
git config --global user.name "miguellara7"
git config --global user.email "miguel.laramx7@gmail.com"

# Generate SSH key for GitHub (optional)
ssh-keygen -t rsa -b 4096 -C "miguel.laramx7@gmail.com"
cat ~/.ssh/id_rsa.pub  # Copy this to GitHub SSH keys
```

---

## 📱 Expo CLI Setup

### 1. Install Expo CLI
```bash
npm install -g @expo/cli expo-dev-client
```

---

## 🖥️ Screen Sessions Management

### Basic Screen Commands
```bash
# Create new screen session
screen -S web-app
screen -S mobile-app
screen -S database

# List active sessions
screen -ls

# Attach to session
screen -r web-app

# Detach from session (inside screen)
Ctrl+A, then D

# Kill session
screen -X -S web-app quit
```

---

## 🚀 Project Deployment Steps

### 1. Clone Repository
```bash
cd /home/$USER
git clone https://github.com/yourusername/guildmanager.git
cd guildmanager
```

### 2. Setup Web Application
```bash
# Install dependencies
npm install

# Create production environment file
cp .env.example .env
nano .env
```

```env
# Production Environment Variables
DATABASE_URL="postgresql://guilduser:your_secure_password_here@localhost:5432/guildmanager"
NEXTAUTH_URL="http://74.208.149.168"
NEXTAUTH_SECRET="your-super-secure-secret-here-32-chars-min"
NODE_ENV="production"
```

```bash
# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 3. Setup Mobile Application
```bash
cd mobile

# Install dependencies
npm install

# Start Expo dev server in production mode
screen -S mobile-app
expo start --tunnel  # For external access
```

---

## 📋 PM2 Ecosystem Configuration

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'guildmanager-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/guildmanager',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'guildmanager-mobile',
      script: 'expo',
      args: 'start --tunnel --non-interactive',
      cwd: '/home/ubuntu/guildmanager/mobile',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
      }
    }
  ]
};
```

---

## 🔄 Development Workflow

### Local Development → Production Sync

#### 1. Local Machine (Windows)
```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push origin main
```

#### 2. Production Server (Linux)
```bash
# Pull latest changes
cd /home/$USER/guildmanager
git pull origin main

# Update web app
npm install  # If package.json changed
npm run build
pm2 restart guildmanager-web

# Update mobile app
cd mobile
npm install  # If package.json changed
pm2 restart guildmanager-mobile
```

---

## 🔍 Monitoring & Maintenance

### PM2 Commands
```bash
# View running processes
pm2 list

# View logs
pm2 logs guildmanager-web
pm2 logs guildmanager-mobile

# Restart applications
pm2 restart all
pm2 restart guildmanager-web

# Stop applications
pm2 stop all
pm2 delete all
```

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check application ports
netstat -tlnp | grep :3000
netstat -tlnp | grep :8081
```

### Database Backup
```bash
# Create backup script
nano /home/$USER/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U guilduser -d guildmanager > /home/$USER/backups/guildmanager_$DATE.sql
```

```bash
chmod +x /home/$USER/backup-db.sh
mkdir -p /home/$USER/backups

# Setup daily backup cron
crontab -e
# Add line: 0 2 * * * /home/$USER/backup-db.sh
```

---

## 🔒 Security Hardening

### 1. Firewall Configuration
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL Certificate (Optional)
```bash
# If you have a domain name
sudo certbot --nginx -d yourdomain.com
```

### 3. SSH Security
```bash
sudo nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Change default port (optional)
Port 2222

sudo systemctl restart ssh
```

---

## 📞 Quick Commands Reference

```bash
# Start all services
pm2 start ecosystem.config.js

# View all logs
pm2 logs

# Restart web app after code changes
git pull && npm run build && pm2 restart guildmanager-web

# Check system status
pm2 list && systemctl status nginx postgresql

# Emergency stop all
pm2 stop all && sudo systemctl stop nginx
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "SELECT version();"
   ```

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Node.js version issues**
   ```bash
   node --version
   which node
   ```

---

## 📝 Notes

- Always backup your database before major updates
- Monitor disk space regularly (`df -h`)
- Keep your system updated (`sudo apt update && sudo apt upgrade`)
- Use screen sessions for long-running processes during development
- PM2 handles process management in production

---

**Server Ready Checklist:**
- [ ] Node.js 20+ installed
- [ ] PostgreSQL configured
- [ ] Nginx configured
- [ ] PM2 installed
- [ ] Git configured
- [ ] Expo CLI installed
- [ ] Screen installed
- [ ] Firewall configured
- [ ] Project cloned and running
