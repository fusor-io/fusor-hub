module.exports = {
  apps: [
    {
      name: 'docker',
      cwd: './docker',
      script: 'docker-compose -f docker-compose.yaml up',
    },
    {
      name: 'server',
      script: 'npm start',
    },
  ],
};
