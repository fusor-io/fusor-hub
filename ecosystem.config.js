module.exports = {
  apps : [
	  {
		  name: 'docker',
		  cwd: './docker',
		  script: 'docker-compose -f docker-compose-pi.yaml up'
	  },
  ]
};
