/* global define */
define(['module'], function(__module, __undefined){
	/*====
	==configuration and dependencies
	=====*/
	var __config = __module.config();
	var __globals = __config.globals || this;
	var __Array = __config.Array || __globals.Array;
	var __Object = __config.Object || __globals.Object;

	//--using autoapply makes for a nicer interface, but also has a performance penalty
	var __doAutoApply = __config.doAutoApply || true;
	var __parentName = __config.parentName || '__parent';

	/*---
	Library: tmclasses

	Library for creating classes
	*/

	/*=====
	==methods and properties
	=====*/
	/*---
	Function: addProperty

	Add a property to an object.

	Parameters:
		object(Object): Object to add properties to
		name(String): Name of property, key in object
		property(mixed): Property definition/value.  Keep in mind that, when setting properties on an object prototype, setting an initial value to an object will cause it to be shared among all instances (eg adding an element to an array object property will affect that property for all instances.  If an object that has an 'init' property, will be added as a complex type with special functionality or options (not yet implemented).  Complex objects can have the follow properties:
			init(mixed): initial value for property
	*/
	var __addProperty =
		(__config.addProperty)
		? __config.addProperty
		: function(_object, _name, _property){
			if(typeof _property == 'object' && typeof _property.init != 'undefined'){
				_object[_name] = _property.init;
			}else{
				_object[_name] = _property;
			}
		}
	;

	/*---
	Function: contains
	In support browsers, determines if a function contains a given string / matches a given regex.  Useful to see if a certain variable is used or function is called, particularly for checking if a child class calls a parent class's method.  For unsupported browsers, always returns true to allow them to function (may change this behavior in the future.)

	Parameters:
		function(Function): the function to examine
		contains(RegExp|String): the string content to search the function for
	*/
	var __contains;
	if(__config.contains){
		__contains = __config.contains;
	//--make sure functions can be tested
	}else if(/define/.test(function(){'define';})){
		__contains = function(_function, _contains){
			if(!(_contains instanceof RegExp)){
				_contains = new RegExp(_contains, 'i');
			}
			return _contains.test(_function);
		};
	//--otherwise, always return true so things will always happen
	}else{
		__contains = function(){ return true; };
	}

	/*---
	Function: duckPunch
	Duck punch a function with a wrapper, ie create a function that runs the wrapper with the original function available inside.  Two types are available, since we cannot close into an already existing function.  One unshifts the original function into the first parameter for the wrapper.  Wrapper must shift off first argument as original function to be able to apply to said function.  The other attaches the original function as a key on the 'this' context, then restores whatever was at that key before.

	Parameters:
		function(Function): Function to wrap
		_wrapper(Function): Function to wrap with.  Must call wrapped function by appropriate means from within.
		_options(map):
			autoApply(Boolean): Will wrap _function in a wrapper that applies first argument so _wrapper can just call this.__base or arguments[0] directly rather than applying.  The scope of 'this' only works on 'this' type.  For 'arguments', 'this' will be '__deps.globals'.
			key(String): key for attaching to 'this' when using the 'this' type
			type(String):
				this: attach _function to the 'this' context used on invocation, using the key specified by the 'key' option.  Will be restored to its original value after invocation
				argument(default): pass _function in as first argument, followed by all other arguments.  Can then shift _function into variable to have access to it, and arguments will then be shifted into position

	Example:
		'argument' type:
			(start code)
			original = function(argOne, argTwo){
				console.log('original: ' + argOne + ', ' + argTwo);
			}
			wrapper = function(argOne, argTwo){
				//--take advantage of a nifty aspect of shifting arguments: names arguments adjust to the new 'arguments' object.  Noted @ http://blog.boyet.com/blog/javascriptlessons/javascript-using-the-shift-method-on-the-arguments-array/
				var _originalFunction = Array.prototype.shift.call(arguments);
				console.log('wrapper pre: ' + argOne + ', ' + argTwo);
				_originalFunction.apply(this, arguments);
				console.log('wrapper post: ' + argOne + ', ' + argTwo);
			}
			newFunction = __.core.Functions.duckPunch(original, wrapper);
			newFunction('one', 'two');
			(end code)
		'this' type
			(start code)
			original = function(argOne, argTwo){
				console.log('original: ' + argOne + ', ' + argTwo);
			}
			wrapper = function(argOne, argTwo){
				console.log('wrapper pre: ' + argOne + ', ' + argTwo);
				this.__original.apply(this, arguments);
				console.log('wrapper post: ' + argOne + ', ' + argTwo);
			}
			newFunction = __.core.Functions.duckPunch(original, wrapper, {type: 'this'});
			newFunction('one', 'two');
			(end code)
	Performance:
		The 'this' type is a bit slower than the 'arguments' type. So is the 'autoApply' option.  See http://jsperf.com/duck-punching-variants
	*/
	var __duckPunch =
		(__config.duckPunch)
		? __config.duckPunch
		: function duckPunch(_function, _wrapper, _options){
			_options = _options || {};
			_options.autoApply = _options.autoApply || false;
			var _originalFunction =
				(_options.autoApply)
				? function(argArguments){
					return _function.apply(this, argArguments);
				}
				: _function
			;
			switch(_options.type || null){
				case 'this':
					var argKey = _options.key || this.config.duckPunchKey;
					return function(){
						var _originalValue = this[argKey] || __undefined;
						this[argKey] = _originalFunction;
						var _return = _wrapper.apply(this, arguments);
						if(_originalValue === __undefined){
							delete this[argKey];
						}else{
							this[argKey] = _originalValue;
						}
						return _return;
					};
				//-* break;
				default:
					return function(){
						__Array.prototype.unshift.call(arguments, _originalFunction);
						return _wrapper.apply(this, arguments);
					};
				//-* break;
			}
		}
	;

	/*---
	Function: mergeInto

	Merge all keys from all other objects into first object, preferring keys of objects to the farthest right.

	Paramaters:
		_object(Object): object to merge other paramaters into
		any number of objects to merge into first, preferring keys of objects to the right over keys to the left

	Returns:
		Modified object
	*/
	var __mergeInto =
		(__config.mergeInto)
		? __config.mergeInto
		: function mergeInto(){
			var _args = arguments;
			var _object = _args[0];
			for(var _keyArg = 1; _keyArg < _args.length; ++_keyArg){
				for(var _argKey in _args[_keyArg]){
					if(_args[_keyArg].hasOwnProperty(_argKey)){
						_object[_argKey] = _args[_keyArg][_argKey];
					}
				}
			}
			return _object;
		}
	;

	/*---
	Attribute: creationPlugins

	Additional functionality to be performed on class creation
	*/
	var __creationPlugins = {
		/*--
		Function: addParentAccessToMethods

		Adds ability to call 'this.base(arguments)' from child class methods to access parent class methods of same name
		*/
		addParentAccessToMethods: function(_options){
			var _parent = _options.parent;
			var _prototype = _options.prototype;
			_options = _options.options;
			var _properties = {};
			if(typeof _options.properties === 'object'){
				__mergeInto(_properties, _options.properties);
			}

			//--add init method to properties if it exists
			if(typeof _options.init != 'undefined'){
				_properties.init = _options.init;
			}

			//--duck punch overridden methods to have access to parent class.  This has a noticable performance penalty, so if you need increased performance, call/apply with the prototype of the parent class directly
			for(var _name in _properties){
				if(
					//--only override if function is in both parent and child classes
					typeof _prototype[_name] == 'function'
					&& typeof _parent.prototype[_name] == 'function'
					//--only override if function actually calls the parent
					&& __contains(_prototype[_name], '\\b' + __parentName + '(\\(|\\.apply|\\.call)\\b')
				){
					_prototype[_name] = __duckPunch(
						_parent.prototype[_name]
						,_prototype[_name]
						,{
							autoApply: __doAutoApply
							,key: __parentName
							,name: _name
							,type: 'this'
						}
					);
				}
			}
		}
	};

	//-- add any configured creation plugins
	if(__config.creationPlugins){
		__mergeInto(__creationPlugins, __config.creationPlugins);
	}

	var __core = {
		config: __config
		,creationPlugins: __creationPlugins

		/*=====
		==Class functions
		=====*/
		/*---
		Method: create

		Create a class.  Provides an abstraction to creating classes directly by creating functions and manipulating their prototypes.  Will become much more capable, though ideally this'll be designed to be minimal but extensible to support other functionality.  Eventually all non-library classes will be migrated to be created by this function.  Meant to replace __.class.define, though it may take some bits from it before it gets removed.

		Parameters:
			_options(map):
				init(Function|null): Function to run as constructor.  null prevents parent constructor from being run
				mixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in before class properties, so that class properties will override mixin properties.
				name(String): A string name for the class.  Currently used only to assign to the window namespace, though will support any namespace and will use this for class meta data later.
				parent(Object|String): Object to extend.  If none is passed, will extend a base object or the built in object.
				preMixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in before classes properties and before regular mixins.  Here primarily to match postMixins naming convention.
				postMixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in after all other property definitions, and thus will override them.
				properties(map): Properties to add to object's prototype.  Currently added directly, but will eventually support per property configuration by passing a map.
				statics(map): Properties to add directly to class, to be called statically.

		Return:
			Function object, the constructor of the class, but representing the class itself.
		*/
		,create: function(_options){
			if(typeof _options == 'undefined'){
				_options = {};
			}

			//--create base prototype inheriting from parent
			var _parent;
			switch(typeof _options.parent){
				case 'string':
					//-! should accomodate namespaces
					_parent = __globals[_options.parent];
				break;
				case 'function':
				case 'object':
					_parent = _options.parent;
				break;
				default:
					if(__core.BaseClass){
						_parent = __core.BaseClass;
					}else{
						_parent = __Object;
					}
				break;
			}

			//--create class/constructor
			var _class = this.createConstructor(_parent);

			//--create prototype from parent
			var _prototype = this.createPrototype(_parent);

			//--merge statics into class
			//---must explicitely merge in parent statics, since this is a new 'class'
			__mergeInto(_class, _parent);
			//---now merge with overwrite the passed in statics
			if(typeof _options.statics == 'object'){
				_class = __mergeInto(_class, _options.statics);
			}

			//--add properties to object
			this.mixIn(_options, _prototype, _class);
			if(typeof _options.init == 'function'){
				__addProperty(_prototype, 'init', _options.init);
			}

			//--perform plugin functionality
			for(var _key in __creationPlugins){
				if(__creationPlugins.hasOwnProperty(_key)){
					__creationPlugins[_key].call(this, {
						Class: _class
						,parent: _parent
						,prototype: _prototype
						,options: _options
					});
				}
			}

			//--set class prototype
			_class.prototype = _prototype;

			//--replace constructor so it is as it should be
			_class.prototype.constructor = _class;

			//--set appropriate object name if provided
			if(_options.name){
				//-! should support namespaces
				__globals[_options.name] = _class;
			}
			return _class;
		}

		/*---
		Method: createConstructor

		Creates default constructor function for class.  Done as separate function so that it can be overridable.

		Parameters:
			_parent(Class): 'class' (constructor) of parent class

		Return:
			Function to act as constructor of class
		*/
		,createConstructor: function(_parent){
			var _this = this;
			var _constructor = function _tmConstructor(){
				//--using new keyword, handle normally
				if(this instanceof _constructor){
					//--call defined constructor or parent constructor
					switch(typeof this.init){
						//--call class's init method, if it exists
						case 'function':
							this.init.apply(this, arguments);
						break;
						//--call parent's constructor (useful for non-tmlib classes)
						case 'undefined':
							_parent.apply(this, arguments);
						break;
						//--all other possibilities cause nothing to happen
					}
				//--calling constructor directly, create new instance of class using new
				}else{
					//--use createPrototype() to create instance without running the init() method
					var _instance = _this.createPrototype(_constructor);

					//--if we have init, run with arguments applied
					if(_instance.init && _instance.init.apply){
						_instance.init.apply(_instance, arguments);
					}
					return _instance;
				}
			};
			return _constructor;
		}

		/*---
		Method: createPrototype

		Create prototype of class.

		Parameters:
			Class(Function): class to create prototype for

		Return:
			Object to serve as a prototype for another object that will properly inherit from the given class object.
		*/
		,createPrototype: function(_Class){
			//--create noop function and attach prototype so that we won't run constructor of class
			var _TempClass = function(){};
			_TempClass.prototype = _Class.prototype;
			//--return instance of noop class
			var _prototype = new _TempClass();
			return _prototype;
		}

		/*---
		Method: mixIn

		Parameters:
			mixin(Array|Map): If an array of class definitions, run mixIn on each definition.  If a definition, mix this definition in to object/parent.
			object(Object): object to mix properties into
			parent(Function): function to mix statics into
		*/
		,mixIn: function(_mixin, _object, _parent){
			var _i;
			var _key;
			var _mixinsLength;
			if(typeof _mixin == 'object'){
				//--if _mixin is an array, mix in all objects in array
				if(_mixin instanceof __Array){
					for(
						_i = 0, _mixinsLength = _mixin.length ; _i < _mixinsLength ; ++_i
					){
						this.mixIn(_mixin[_i], _object, _parent);
					}
				}else{
					//--mix in pre mixins
					if(typeof _mixin.preMixins == 'object'){
						this.mixIn(_mixin.preMixins, _object, _parent);
					}
					//--mix in mixins
					if(typeof _mixin.mixins == 'object'){
						this.mixIn(_mixin.mixins, _object, _parent);
					}
					//--mix in statics
					if(typeof _mixin.statics == 'object' && typeof _parent == 'function'){
						for(_key in _mixin.statics){
							if(_mixin.statics.hasOwnProperty(_key)){
								_parent[_key] = _mixin.statics[_key];
							}
						}
					}
					//--mix in properties
					if(typeof _mixin.properties == 'object'){
						for(_key in _mixin.properties){
							if(_mixin.properties.hasOwnProperty(_key)){
								_object[_key] = _mixin.properties[_key];
							}
						}
					}
					//--mix in postmixins
					if(typeof _mixin.postMixins == 'object'){
						this.mixIn(_mixin.postMixins, _object, _parent);
					}
				}
			}
		}

		/*=====
		==Utility functions
		=====*/
		,addProperty: __addProperty
		,duckPunch: __duckPunch
		,mergeInto: __mergeInto
	};
	return __core;
});
