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
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true
    },
    {
      name: 'guildmanager-mobile',
      script: 'expo',
      args: 'start --tunnel --non-interactive --port 8081',
      cwd: '/home/ubuntu/guildmanager/mobile',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
        PORT: 8081
      },
      error_file: './logs/mobile-error.log',
      out_file: './logs/mobile-out.log',
      log_file: './logs/mobile-combined.log',
      time: true
    }
  ]
};
