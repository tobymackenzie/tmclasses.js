/* global define */
define(['./core', './config', './BaseClass'], function(__core, __config, __BaseClass){
	__core.BaseClass = __config.BaseClass = __BaseClass;
	return __core;
});
