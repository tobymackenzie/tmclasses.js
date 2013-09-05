js-tmclasses
============

A simple javascript class library.  More features will be added in the future.  This project is not documented yet, but I have simple usage examples to get started.

Usage
-----
This library has been built using [require.js](), so it can be loaded as an AMD module with that.  I've also used [almond.js]() to make a standalone build that can be loaded as a regular script and used as a global variable.

### Require/AMD
Download the whole repo or just the `src` directory and put it somewhere require has access to.  Configure the path to the `src` directory in require.js:

```javascript
requirejs.config({
	paths: {
		tmclasses: 'vendor/js-tmclasses/src'
	}
});
```

Require `tmclasses/tmclasses` and then use the create method to create a class.  An example:

```javascript
var tmclasses = require('tmclasses/tmclasses');

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

### Standalone build
Download `build/build.almond.js` and put it somewhere in your web root.  Feel free to rename it.  Load it like usual.

```html
<script src="tmclasses.js"></script>
```

In your own script, you can access and use it much like the AMD example, without the need to require anything.

```javascript
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
```

