/* global define */
define(['module'], function(__module){
	var __config = __module.config();

	/*====
	==configuration and dependencies
	=====*/
	if(!__config.globals){
		__config.globals = (function(){
			'use strict';
			var _return = this || eval;
			return (typeof _return === 'object') ? _return : _return('this');
		})();
	}
	var __globals = __config.globals;

	if(!__config.Array){
		__config.Array = __globals.Array;
	}
	if(!__config.BaseClass){
		__config.BaseClass = __globals.Object;
	}

	//--using autoapply makes for a nicer interface, but also has a performance penalty
	if(typeof __config.doAutoApply === 'undefined'){
		__config.doAutoApply = true;
	}
	if(!__config.parentName){
		__config.parentName = '__parent';
	}
	return __config;
});
