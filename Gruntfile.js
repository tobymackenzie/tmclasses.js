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
		,qunit: {
			all: ['test/**/*.html']
		}
		,requirejs: {
			almond: {
				options: {
					baseUrl: 'build'
					,include: ['../vendor/almond/almond.js', 'requirements']
					,out: 'dist/tmclasses.almond.js'
					,paths: {
						tmclasses: '../src'
					}
					,wrap: {
						startFile: 'build/wrap.start.js'
						,endFile: 'build/wrap.end.js'
					}
				}
			}
			,require: {
				options: {
					baseUrl: 'build'
					,optimize: 'none'
					// ,include: ['tmclasses/BaseClass']
					,name: 'tmclasses/BaseClass'
					,out: 'dist/tmclasses.require.js'
					,paths: {
						tmclasses: '../src'
					}
				}
			}
		}
	});

	//==tasks
	__grunt.registerTask('build', [
		'requirejs:require'
	]);
	__grunt.registerTask('build:all', [
		'requirejs:almond'
		,'requirejs:require'
	]);
	__grunt.registerTask('default', [
		'jshint'
		,'test'
	]);
	__grunt.registerTask('test', [
		'build:all'
		,'qunit'
	]);
};
