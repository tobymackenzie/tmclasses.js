/* global define */
define(['./core'], function(__core){
	/*---
	Class: BaseClass

	Class to be used as parent for most other classes.  Provides the default behavior of accepting a map as the first parameter of the constructor and merging each key into the resulting instance object.
	*/
	var __BaseClass = __core.create({
		/*---
		Method: init

		Parameters:
			options(map): receives a key value map of properties to add or apply to instance being created.
		*/
		init: function(_options){
			_options = _options || {};

			//--deInit if inited
			if(this.isInited){
				this.deInit();
			}

			//--set value of members from arguments
			for(var _key in _options){
				if(_options.hasOwnProperty(_key)){
					this.__directSet(_key, _options[_key]);
				}
			}

			//--make sure inited flags are set
			this.isInited = true;
			this.hasInited = true;
		}
		,properties: {
			/*---
			Method: __directSet

			Directly set a property, without invoking any sort of set helper functions.
			*/
			__directSet: function(_key, _value){
				this[_key] = _value;
			}
			/*---
			Method: deInit

			Stop intervals and event monitors and unset instance properties to allow an object to be inited again.  Meant to be overridden by children.
			*/
			,deInit: function(){
				this.isInited = false;
			}
			/*---
			Property: hasInited

			Whether the object has been inited ever.  Allows classes that will be inited multiple times to handle the first time differently
			*/
			,hasInited: false
			/*---
			Property: isInited

			Whether the object has been inited and not deInited.
			*/
			,isInited: false
		}
		,statics: {
			/*---
			Method: create

			Create a new instance of the class.
			*/
			create: function(){
				return this.apply(this, arguments);
			}
		}
	});

	//--export
	return __BaseClass;
});
