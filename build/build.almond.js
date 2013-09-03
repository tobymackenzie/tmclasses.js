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

/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond.js", function(){});

/* global define */
define('tmclasses/core',['module'], function(__module, __undefined){
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

/* global define */
define('tmclasses/BaseClass',['./core'], function(__core){
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

/* global define */
define('tmclasses/tmclasses',['./core', './BaseClass'], function(__core, __BaseClass){
	__core.BaseClass = __BaseClass;
	return __core;
});

/*
Require files we want in the build
*/
/* global define, require */
define('requirements',['tmclasses/tmclasses'], function(){});
require('requirements');
/* global require */
	return require('tmclasses/tmclasses');
}));
