/* global setTimeout */
/*
Mixin: MPubSub
Add publish/subscribe functionality to a class.

TODO: .unsub() not implemented
*/
export default {
	properties: {
		getSubscriptions: function(_key){
			if(!this.__subscriptions){
				this.__subscriptions = {};
			}
			if(typeof _key === 'undefined'){
				return this.__subscriptions;
			}else{
				if(!this.__subscriptions[_key]){
					this.__subscriptions[_key] = [];
				}
				return this.__subscriptions[_key];
			}
		},
		pub: function(){
			var _args = arguments;
			var _eventName = _args[0];
			var _this = this;
			Array.prototype.shift.call(_args);

			//-#publish in separate thread
			setTimeout(function(){
				var _subscriptions = _this.getSubscriptions(_eventName);
				for(var _i = 0; _i < _subscriptions.length; ++_i){
					_subscriptions[_i].apply(_this, _args);
				}
			}, 0);
		},
		sub: function(_eventName, _callback){
			this.getSubscriptions(_eventName).push(_callback);
		},
		__subscriptions: null,
		unsub: function(_eventName, _callback){
			if(_eventName){
				var _subscriptions = this.getSubscriptions(_eventName);
				for(var _i = _subscriptions.length - 1; _i >= 0 ; --_i){
					if(!_callback || _callback === _subscriptions[_i]){
						_subscriptions.splice(_i, 1);
					}
				}
			}
		},
	},
};
