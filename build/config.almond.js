/*
Configuration for require js
*/
({
	baseUrl: '.'
	,include: ['../vendor/almond/almond.js', 'requirements']
	,out: 'build.almond.js'
	,paths: {
		tmclasses: '../src'
	}
	,wrap: {
		startFile: 'wrap.start.js'
		,endFile: 'wrap.end.js'
	}
})
