/* global module, require */
module.exports = function(__grunt){
	//--show time grunt takes to run
	require('time-grunt')(__grunt);
	//--auto loading of grunt tasks from package.json
	require('load-grunt-tasks')(__grunt);

	//==config
	__grunt.initConfig({
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			}
			,all: [
				'Gruntfile.js'
				,'src/**/*.js'
				,'test/**/*.js'
			]
		}
	});

	//==tasks
	__grunt.registerTask('default', [
		'jshint'
	]);
};
