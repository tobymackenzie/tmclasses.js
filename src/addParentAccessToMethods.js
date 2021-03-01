/* global RegExp */
import core from './core.js';
import mergeIn from './mergeIn.js';

/*---
Function: contains

In support browsers, determines if a function contains a given string / matches a given regex.  Useful to see if a certain variable is used or function is called, particularly for checking if a child class calls a parent class's method.  For unsupported browsers, always returns true to allow them to function (may change this behavior in the future).

Parameters:
	function(Function): the function to examine
	contains(RegExp|String): the string content to search the function for
*/
//--make sure functions can be tested
if(/define/.test(function(){'define';})){
	var __contains = function(_function, _contains){
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
	opts(map):
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
var __duckPunch = function duckPunch(_function, _wrapper, opts){
	opts = opts || {};
	opts.autoApply = opts.autoApply || false;
	var _originalFunction =
		(opts.autoApply)
		? function(argArguments){
			return _function.apply(this, argArguments);
		}
		: _function
	;
	switch(opts.type || null){
		case 'this':
			var argKey = opts.key || this.config.duckPunchKey;
			return function(){
				var _originalValue = this[argKey] || undefined;
				this[argKey] = _originalFunction;
				var _return = _wrapper.apply(this, arguments);
				if(_originalValue === undefined){
					delete this[argKey];
				}else{
					this[argKey] = _originalValue;
				}
				return _return;
			};
		//-* break;
		default:
			return function(){
				Array.prototype.unshift.call(arguments, _originalFunction);
				return _wrapper.apply(this, arguments);
			};
		//-* break;
	}
};

/*--
Function: addParentAccessToMethods

Adds ability to call 'this.base(arguments)' from child class methods to access parent class methods of same name
*/
var addParentAccessToMethods = function addParentAccessToMethods(opts){
	var _parent = opts.parent;
	var _prototype = opts.prototype;
	opts = opts.options;
	var _properties = {};
	if(typeof opts.properties === 'object'){
		mergeIn(_properties, opts.properties);
	}

	//--add init method to properties if it exists
	if(typeof opts.init != 'undefined'){
		_properties.init = opts.init;
	}

	//--duck punch overridden methods to have access to parent class.  This has a noticable performance penalty, so if you need increased performance, call/apply with the prototype of the parent class directly
	for(var _name in _properties){
		if(
			//--only override if function is in both parent and child classes
			typeof _prototype[_name] == 'function'
			&& typeof _parent.prototype[_name] == 'function'
			//--only override if function actually calls the parent
			&& __contains(_prototype[_name], '\\b__parent(\\(|\\.apply|\\.call)\\b')
		){
			_prototype[_name] = __duckPunch(
				_parent.prototype[_name]
				,_prototype[_name]
				,{
					autoApply: true
					,key: '__parent'
					,name: _name
					,type: 'this'
				}
			);
		}
	}
};
core.creationPlugins.addParentAccessToMethods = addParentAccessToMethods;
export default addParentAccessToMethods;
