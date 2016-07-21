/* global define, setTimeout */
define([], function(){
	/*
	Mixin: MPubSub
	Add publish/subscribe functionality to a class.

	TODO: .unsub() not implemented
	*/
	var __MPubSub = {
		properties: {
			getSubscriptions: function(_key){
				if(!(this.__subscriptions instanceof Array)){
					this.__subscriptions = [];
				}
				if(typeof _key === 'undefined'){
					return this.__subscriptions;
				}else{
					if(typeof this.__subscriptions[_key] == 'undefined'){
						this.__subscriptions[_key] = [];
					}
					return this.__subscriptions[_key];
				}
			}
			,pub: function(){
				var _args = arguments;
				var _eventName = _args[0];
				var _this = this;
				Array.prototype.shift.call(_args);

				//-#publish in separate thread
				setTimeout(function(){
					var _i = 0;
					var _subscription;
					var _subscriptions = _this.getSubscriptions(_eventName);
					var _subscriptionsLength = _subscriptions.length;
					for(; _i < _subscriptionsLength; ++_i){
						_subscription = _subscriptions[_i];
						_subscription.apply(_this, _args);
					}
				}, 0);
			}
			,sub: function(_eventName, _callback){
				var _subscriptions = this.getSubscriptions(_eventName);
				_subscriptions.push(_callback);
			}
			,__subscriptions: null
			,unsub: function(_eventName, _callback){
				if(_eventName){
					var _subscriptions = this.getSubscriptions(_eventName);
					for(var _i = _subscriptions.length - 1; _i >= 0 ; --_i){
						if(!_callback || _callback === _subscriptions[_i]){
							_subscriptions.splice(_i, 1);
						}
					}
				}
			}
		}
	};
	return __MPubSub;
});
