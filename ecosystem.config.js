module.exports = {
  apps : [
	  {
		  name: 'docker',
		  cwd: './docker',
		  script: 'docker-compose -f docker-compose-pi.yaml up'
	  },
	  {
		  name: 'server',
		  script: 'npm start'
	  },
	  {
		  name: 'pi-monitor',
		  cwd: './bin',
		  script: './rp-temp.sh'
	  }
  ]
};
