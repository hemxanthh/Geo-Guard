module.exports = {
  apps: [{
    name: 'geoguard-backend',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./database.db',
      JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://yourdomain.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
