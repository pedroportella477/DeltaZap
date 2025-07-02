
module.exports = {
  apps: [
    {
      name: 'deltazap',
      script: 'server.js', // Aponta diretamente para o seu arquivo de servidor
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
