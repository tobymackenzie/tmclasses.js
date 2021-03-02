/* global Array, Object, window */
import mergeIn from './mergeIn.js';

/*---
Library: tmclasses

Library for creating classes
*/
var __core = {
	BaseClass: Object,
	/*---
	Attribute: creationPlugins

	Additional functionality to be performed on class creation.
	*/
	creationPlugins: {},

	/*=====
	==Class functions
	=====*/
	/*---
	Method: create

	Create a class.  Provides an abstraction to creating classes directly by creating functions and manipulating their prototypes.  Will become much more capable, though ideally this'll be designed to be minimal but extensible to support other functionality.  Eventually all non-library classes will be migrated to be created by this function.  Meant to replace __.class.define, though it may take some bits from it before it gets removed.

	Parameters:
		opts(map):
			init(Function|null): Function to run as constructor.  null prevents parent constructor from being run
			mixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in before class properties, so that class properties will override mixin properties.
			parent(Object|String): Object to extend.  If none is passed, will extend a base object or the built in object.
			preMixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in before classes properties and before regular mixins.  Here primarily to match postMixins naming convention.
			postMixins(Array): Collection of class definitions to mix in properties of to class.  Mixed in after all other property definitions, and thus will override them.
			properties(map): Properties to add to object's prototype.  Currently added directly, but will eventually support per property configuration by passing a map.
			statics(map): Properties to add directly to class, to be called statically.

	Return:
		Function object, the constructor of the class, but representing the class itself.
	*/
	create: function(opts){
		if(typeof opts == 'undefined'){
			opts = {};
		}

		//--create base prototype inheriting from parent
		var _parent;
		switch(typeof opts.parent){
			case 'string':
				_parent = window[opts.parent];
			break;
			case 'function':
			case 'object':
				_parent = opts.parent;
			break;
			default:
				_parent = __core.BaseClass;
			break;
		}

		//--create class/constructor
		var _class = this.createConstructor(_parent);

		//--create prototype from parent
		var _prototype = this.createPrototype(_parent);

		//--merge statics into class
		//---must explicitely merge in parent statics, since this is a new 'class'
		mergeIn(_class, _parent);
		//---now merge with overwrite the passed in statics
		if(typeof opts.statics == 'object'){
			_class = mergeIn(_class, opts.statics);
		}

		//--add properties to object
		this.mixIn(opts, _prototype, _class);
		if(typeof opts.init == 'function'){
			this.addProperty(_prototype, 'init', opts.init);
		}

		//--perform plugin functionality
		for(var _key in this.creationPlugins){
			if(this.creationPlugins.hasOwnProperty(_key)){
				this.creationPlugins[_key].call(this, {
					Class: _class
					,parent: _parent
					,prototype: _prototype
					,options: opts
				});
			}
		}

		//--set class prototype
		_class.prototype = _prototype;

		//--replace constructor so it is as it should be
		_class.prototype.constructor = _class;

		return _class;
	},

	/*---
	Method: createConstructor

	Creates default constructor function for class.  Done as separate function so that it can be overridable.

	Parameters:
		_parent(Class): 'class' (constructor) of parent class

	Return:
		Function to act as constructor of class
	*/
	createConstructor: function(_parent){
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
					//--call parent's constructor
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
	},

	/*---
	Method: createPrototype

	Create prototype of class.

	Parameters:
		Class(Function): class to create prototype for

	Return:
		Object to serve as a prototype for another object that will properly inherit from the given class object.
	*/
	createPrototype: function(_Class){
		//--create noop function and attach prototype so that we won't run constructor of class
		var _TempClass = function(){};
		_TempClass.prototype = _Class.prototype;
		//--return instance of noop class
		var _prototype = new _TempClass();
		return _prototype;
	},

	/*---
	Method: mixIn

	Parameters:
		mixin(Array|Map): If an array of class definitions, run mixIn on each definition.  If a definition, mix this definition in to object/parent.
		object(Object): object to mix properties into
		parent(Function): function to mix statics into
	*/
	mixIn: function(_mixin, _object, _parent){
		var _i;
		var _key;
		var _mixinsLength;
		if(typeof _mixin == 'object'){
			//--if _mixin is an array, mix in all objects in array
			if(_mixin instanceof Array){
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
	},

	/*=====
	==Utility functions
	=====*/
	/*---
	Method: addProperty

	Add a property to an object.

	Parameters:
		object(Object): Object to add properties to
		name(String): Name of property, key in object
		property(mixed): Property definition/value.  Keep in mind that, when setting properties on an object prototype, setting an initial value to an object will cause it to be shared among all instances (eg adding an element to an array object property will affect that property for all instances.  If an object that has an 'init' property, will be added as a complex type with special functionality or options (not yet implemented).  Complex objects can have the follow properties:
			init(mixed): initial value for property
	*/
	addProperty: function(_object, _name, _property){
		if(typeof _property == 'object' && typeof _property.init != 'undefined'){
			_object[_name] = _property.init;
		}else{
			_object[_name] = _property;
		}
	},
};

export default __core;
