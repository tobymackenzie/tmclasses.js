/* global define */
(function(__factory){
	if(typeof define === 'function' && define.amd){
		define('tmclasses', __factory);
	}else{
		// var __originalTmclasses = this.tmclasses;
		this.tmclasses = __factory();
		// this.tmclasses.__original = __originalTmclasses;
	}
}(function(){
