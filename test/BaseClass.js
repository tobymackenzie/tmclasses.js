/* global QUnit */
import core from '/_src/core.js';
import BaseClass from '/_src/BaseClass.js';

//--name module
QUnit.module('BaseClass');

QUnit.test('BaseClass', function(assert){
	//==initial setup
	var myInstance = new BaseClass({
		instanceProperty1: 'value1'
		,instanceProperty2: 'value2'
		,instanceMethod1: function(){
			return 'foo';
		}
	});
	//==tests
	//--test property initialization
	assert.ok(typeof myInstance == 'object', 'myInstance should be an object');
	assert.equal(myInstance.instanceProperty1, 'value1', 'myInstance should have a property "instanceProperty1" with value "value1');
	assert.equal(myInstance.instanceProperty2, 'value2', 'myInstance should have a property "instanceProperty2" with value "value2');
	assert.ok(typeof myInstance.instanceMethod1 == 'function', 'myInstance should have a property "instanceMethod1" that is a function');
	assert.equal(myInstance.instanceMethod1(), 'foo', 'myInstance.instanceMethod1() should return the string "foo"');
});
QUnit.test('direct call init', function(assert){
	//==initial setup
	var _instance = BaseClass({foo: 'foo', bar: 'bar'});
	//==tests
	assert.ok(
		_instance instanceof BaseClass
		,'created object should be instance of BaseClass'
	);
	assert.equal(_instance.foo, 'foo','arguments should be passed to init method');
	assert.equal(_instance.bar, 'bar','arguments should be passed to init method');
});
QUnit.test('::create() init', function(assert){
	//==initial setup
	var _instance = BaseClass.create({foo: 'foo', bar: 'bar'});
	//==tests
	assert.ok(
		_instance instanceof BaseClass
		,'created object should be instance of BaseClass'
	);
	assert.equal(_instance.foo, 'foo','arguments should be passed to init method');
	assert.equal(_instance.bar, 'bar','arguments should be passed to init method');
});
QUnit.test('inited flags', function(assert){
	//==initial setup
	var _instance = new BaseClass();

	//==tests
	assert.ok(
		_instance.isInited
		,'instance should be flagged as isInited'
	);
	assert.ok(
		_instance.hasInited
		,'instance should be flagged as hasInited'
	);
	_instance.deInit();
	assert.ok(
		!_instance.isInited
		,'instance should no longer be flagged as isInited after a deInit()'
	);
	assert.ok(
		_instance.hasInited
		,'instance should still be flagged as hasInited after a deInit()'
	);
});
QUnit.test('__parent()', function(assert){
	//--create parent class
	var parentClass = core.create({
		init: function(){
			this.propertyFromParentClassInit = 'woo';
		}
		,props: {
			parentClassProperty1: 'foo'
			,parentClassProperty2: 'bar'
		}
	});
	//--create instance of parent class
	var parentClassInstance = new parentClass();
	//--create child class
	var childClass = core.create({
		parent: parentClass
		,init: function(){
			this.__parent(arguments);
			this.propertyFromChildClassInit = 'woo';
		}
		,props: {
			childClassProperty1: 'boo'
			,childClassProperty2: 'far'
			,parentClassProperty2: 'overriddenBar'
		}
	});

	//--create instance of child class
	var childClassInstance = new childClass();

	//==test
	//--props
	//---parent
	assert.ok(parentClassInstance.parentClassProperty1, 'parentClassInstance.parentClassProperty1 should be set');
	assert.equal(parentClassInstance.parentClassProperty1, 'foo', 'parentClassInstance.parentClassProperty1 should match prototype');
	assert.equal(parentClassInstance.parentClassProperty2, 'bar', 'parentClassInstance.parentClassProperty2 should match prototype');
	//---child
	assert.equal(childClassInstance.parentClassProperty1, 'foo', 'childClassInstance.parentClassProperty1 should match parent prototype');
	assert.equal(childClassInstance.parentClassProperty2, 'overriddenBar', 'childClassInstance.parentClassProperty2 should match subclass prototype');
	assert.equal(childClassInstance.childClassProperty1, 'boo', 'childClassInstance.childClassProperty1 should match subclass prototype');
});
