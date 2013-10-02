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
			,pub: function(_eventName, _data){
				var _this = this;
				//-#publish in separate thread
				setTimeout(function(){
					var _i = 0;
					var _subscription;
					var _subscriptions = _this.getSubscriptions(_eventName);
					var _subscriptionsLength = _subscriptions.length;
					for(; _i < _subscriptionsLength; ++_i){
						_subscription = _subscriptions[_i];
						_subscription.call(_this, _data || null);
					}
				}, 0);
			}
			,sub: function(_eventName, _callback){
				var _subscriptions = this.getSubscriptions(_eventName);
				_subscriptions.push(_callback);
			}
			,__subscriptions: null
			,unsub: function(){

			}
		}
	};
	return __MPubSub;
});
