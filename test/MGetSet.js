/* global QUnit */
import __core from '/_src/core.js';
import __BaseClass from '/_src/BaseClass.js';

var __undef;

//--name module
QUnit.module('MGetSet');

QUnit.test('get', function(assert){
	//==initial setup
	var _objValue = {
		foo: 'foo'
		,bar: 'bar'
	};
	var _instance = new __BaseClass({
		prop1: 'val1'
		,prop2: 42
		,prop3: _objValue
	});

	//==tests
	assert.strictEqual(
		_instance.get('prop1')
		,'val1'
		,'prop1 should equal "val1"'
	);
	assert.strictEqual(
		_instance.get('prop2')
		,42
		,'prop2 should equal 42'
	);
	assert.strictEqual(
		_instance.get('prop3')
		,_objValue
		,'prop3 should equal _objValue'
	);
	assert.strictEqual(
		_instance.get('nonExistantKey')
		,__undef
		,'nonExistantKey should be undefined'
	);
});
QUnit.test('set', function(assert){
	//==initial setup
	var _instance = new __BaseClass({
		prop1: 'initialValue'
		,prop2: 42
		,prop3: 'initialValue'
	});


	//==tests
	//--single keys
	_instance.set('prop1', 'newValue');
	_instance.set('prop4', 'setValue');
	assert.strictEqual(
		_instance.get('prop1')
		,'newValue'
		,'prop1 should now have new value'
	);
	assert.strictEqual(
		_instance.get('prop2')
		,42
		,'prop2 should be unchanged at this point'
	);
	assert.strictEqual(
		_instance.get('prop3')
		,'initialValue'
		,'prop3 should be unchanged at this point'
	);
	assert.strictEqual(
		_instance.get('prop4')
		,'setValue'
		,'prop4 should now be set'
	);
	assert.strictEqual(
		_instance.get('prop5')
		,__undef
		,'prop5 should not be set'
	);

	_instance.set('prop5');
	assert.strictEqual(
		_instance.get('prop5')
		,__undef
		,'prop5 should be set to undefined'
	);

	//--value map
	_instance.set({
		prop1: 'newNewValue'
		,prop3: 'newValue'
	});
	assert.strictEqual(
		_instance.get('prop1')
		,'newNewValue'
		,'prop1 should now have another new value'
	);
	assert.strictEqual(
		_instance.get('prop2')
		,42
		,'prop2 should still be unchanged at this point'
	);
	assert.strictEqual(
		_instance.get('prop3')
		,'newValue'
		,'prop3 should have new value'
	);
	assert.strictEqual(
		_instance.get('prop5')
		,__undef
		,'prop5 should be set to undefined'
	);

	//--return
	assert.strictEqual(
		_instance.set('prop1')
		,_instance
		,'set should return "this"'
	);
});
QUnit.test('unset', function(assert){
	//==initial setup
	var _NewClass = __core.create({
		parent: __BaseClass
		,properties: {
			initialProp1: 'initialValue1'
			,initialProp2: 'initialValue2'
		}
	});
	var _instance = new _NewClass({
		prop1: 'initialValue1'
		,prop2: 42
		,prop3: 'initialValue3'
		,initialProp1: 'newValue'
	});

	//==tests
	_instance.unset('prop1');
	assert.strictEqual(
		_instance.get('prop1')
		,__undef
		,'prop1 should now be undefined after unset'
	);
	assert.strictEqual(
		_instance.get('prop3')
		,'initialValue3'
		,'prop3 should still be set'
	);

	_instance.unset('prop3');
	assert.strictEqual(
		_instance.get('prop3')
		,__undef
		,'prop3 should now be undefined after unset'
	);

	//--check that default values remain intact after unset
	assert.strictEqual(
		_instance.get('initialProp1')
		,'newValue'
		,'initialProp1 should have new value'
	);
	_instance.unset('initialProp1');
	assert.strictEqual(
		_instance.get('initialProp1')
		,'initialValue1'
		,'initialProp1 should now have default value after unset'
	);

	assert.strictEqual(
		_instance.get('initialProp2')
		,'initialValue2'
		,'initialProp2 should have default value'
	);
	_instance.unset('initialProp2');
	assert.strictEqual(
		_instance.get('initialProp2')
		,'initialValue2'
		,'initialProp2 should still have default value after unset'
	);
});
