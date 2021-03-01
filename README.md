tmclasses.js
============

A simple javascript class library.  More features will be added in the future.  This project is not documented yet, but I have simple usage examples to get started.

Usage
-----

This library has been built using ES Modules.  Install with `npm install --save 'github:tobymackenzie/tmclasses.js#semver:^v0.1'` or download the whole repo and put it somehwhere your scripts can access it.  Import `tmclasses/src/main.js`, and use its `create()` method to create classes.

``` js
import tmclasses from 'tmclasses.js/src/main.js');

var MyClass = tmclasses.create({
	init: function(_opts){
		console.log('MyClass instantiated with options ', _opts);
		this.__parent(arguments);
	}
	,properties: {
		foo: 'foo'
		,getFoo: function(){
			return this.foo;
		}
		,setFoo: function(_newFoo){
			this.foo = _newFoo;
			return this;
		}
	}
});

var myInstance = new MyClass({option1: 'value1', option2: 'value2'});
```
