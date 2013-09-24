/* global define */
define([], function(){
	/*
	Mixin: MGetSet
	Add getter, setter, and unsetter to class.
	TODO: Will eventually have the ability to publish changes, perform validation, and perform pre-defined functionality on set or unset when done through this interface.
	*/
	var __MGetSet = {
		properties: {
			/*
			Method: get
			Get a property of this object by string key name.
			Arguments:
				_key (String): name of key on this object to get value of.
			*/
			get: function(_key){
				return this[_key];
			}

			/*
			Method: set
			Set one or more properties on this object
			Arguments:
				_keyOrSet (String|Map): If String, will set the named key of this object to the _val value.  If a Map, will set each key from the Map on this object to the value from the Map.
				_val (Mixed): If first argument is a string, this will be the value that gets set on the key.
			Return: this
			*/
			,set: function(_keyOrSet, _val){
				switch(typeof _keyOrSet){
					case 'string':
						this[_keyOrSet] = _val;
					break;
					case 'object':
						for(var _key in _keyOrSet){
							if(_keyOrSet.hasOwnProperty(_key)){
								this.set(_key, _keyOrSet[_key]);
							}
						}
					break;
				}
				return this;
			}

			/*
			Method: unset
			Unset a key on this object
			return this
			Arguments:
				_key (String): String key on this object to delete/unset
			Return this
			*/
			,unset: function(_key){
				delete this[_key];
			}
		}
	};
	return __MGetSet;
});
