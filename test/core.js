/* global define, QUnit, test */
(function(__globals, _factory){
	if(typeof define === 'function' && define.amd){
		if(__globals.__usingBuild){
			define(['tmclasses'], function(__tmclasses){
				return _factory(__tmclasses);
			});
		}else{
			define(['tmclasses/core', 'tmclasses/BaseClass'], _factory);
		}
	}else{
		_factory(__globals.tmclasses);
	}
}(this, function(tmclasses){
	//--name module
	QUnit.module('tmclasses.core');

	//--define tests
	test('create', function(assert){
		//==initial setup
		//--create parent class
		var parentClass = tmclasses.create({
			parent: Object
			,init: function(){
				this.propertyFromParentClassInit = 'woo';
			}
			,properties: {
				parentClassProperty1: 'foo'
				,parentClassProperty2: 'bar'
			}
		});
		//--create instance of parent class
		var parentClassInstance = new parentClass();
		//--create child class
		var childClass = tmclasses.create({
			parent: parentClass
			,init: function(){
				this.__parent(arguments);
				this.propertyFromChildClassInit = 'woo';
			}
			,'properties': {
				childClassProperty1: 'boo'
				,childClassProperty2: 'far'
				,parentClassProperty2: 'overriddenBar'
			}
		});

		//--create instance of child class
		var childClassInstance = new childClass();

		//==test
		//--properties
		//---parent
		assert.ok(parentClassInstance.parentClassProperty1, 'parentClassInstance.parentClassProperty1 should be set');
		assert.equal(parentClassInstance.parentClassProperty1, 'foo', 'parentClassInstance.parentClassProperty1 should match prototype');
		assert.equal(parentClassInstance.parentClassProperty2, 'bar', 'parentClassInstance.parentClassProperty2 should match prototype');
		//---child
		assert.equal(childClassInstance.parentClassProperty1, 'foo', 'childClassInstance.parentClassProperty1 should match parent prototype');
		assert.equal(childClassInstance.parentClassProperty2, 'overriddenBar', 'childClassInstance.parentClassProperty2 should match subclass prototype');
		assert.equal(childClassInstance.childClassProperty1, 'boo', 'childClassInstance.childClassProperty1 should match subclass prototype');
		//---prototype change
		parentClass.prototype.parentClassProperty1 = 'newFoo';
		assert.equal(childClassInstance.parentClassProperty1, 'newFoo', 'childClassInstance.parentClassProperty1 should match modified parent prototype');

		//--instanceof
		//---parent
		assert.ok(parentClassInstance instanceof parentClass, 'parentClassInstance should be instance of parentClass');
		assert.ok(!(parentClassInstance instanceof childClass));
		//---child
		assert.ok(childClassInstance instanceof childClass, 'childClassInstance should be instance of parentClass');
		assert.ok(childClassInstance instanceof parentClass, 'childClassInstance should be instance of parentClass');

		//--init
		//---parent
		assert.ok(typeof parentClassInstance.propertyFromParentClassInit != 'undefined', 'parentClassInstance should have property propertyFromParentClassInit');
		assert.ok(typeof parentClassInstance.propertyFromChildClassInit == 'undefined', 'parentClassInstance should not have property propertyFromChildClassInit');
		assert.ok(typeof childClassInstance.propertyFromParentClassInit != 'undefined', 'childClassInstance should have property propertyFromParentClassInit via duck punching');
		assert.equal(childClassInstance.propertyFromParentClassInit, 'woo', 'childClassInstance should have proper property propertyFromParentClassInit value');
		assert.ok(typeof childClassInstance.propertyFromChildClassInit != 'undefined', 'childClassInstance should have property propertyFromChildClassInit');

		//--prototype
		//---child
		assert.equal(typeof childClass.prototype.propertyFromParentClassInit, 'undefined', 'childClassInstance should not have propertyFromParentClassInit from parent init function');


		//==mixins init
		var mixinMixinA = {
			properties: {
				propertyC: 'mmAvalueC'
			}
		};
		var mixinMixinB = {
			properties: {
				propertyD: 'mmBvalueD'
			}
		};
		var mixinMixinC = {
			properties: {
				propertyD: 'mmCvalueD'
			}
			,postMixins: [
				mixinMixinB
			]
		};
		var preMixinA = {
			properties: {
				propertyA: 'pAvalueA'
				,propertyB: 'pAvalueB'
			}
		};
		var preMixinB = {
			properties: {
				propertyB: 'pBvalueB'
				,propertyC: 'pBvalueC'
			}
		};
		var mixinA = {
			properties: {
				propertyA: 'mAvalueA'
				,propertyC: 'mAvalueC'
				,propertyD: 'mAvalueD'
				,methodA: function(){ return 'from mixinA'; }
			}
		};
		var mixinB = {
			mixins: mixinMixinA
			,properties: {
				propertyE: 'mBvalueE'
				,propertyF: 'mBvalueF'
				,methodA: function(){ return 'from mixinB'; }
			}
		};
		var postMixinA = {
			mixins: mixinMixinC
			,properties: {
				methodB: function(){ return 'from postMixinA'; }
			}
			,nonPropertyA: 'nonProperty'
		};
		var postMixinB = {
			properties: {
				propertyG: 'pBvalueG'
			}
		};
		var containerClass = tmclasses.create({
			preMixins: [
				preMixinA
				,preMixinB
			]
			,mixins: [
				mixinA
				,mixinB
			]
			,properties: {
				propertyC: 'valueC'
				,propertyE: 'valueE'
				,propertyG: 'valueG'
				,methodB: function(){ return 'from containerClass'; }
			}
			,postMixins: [
				postMixinA
				,postMixinB
			]
		});

		var myInstance = new containerClass();
		var otherInstance = new containerClass();

		//--tests
		//---prototype
		assert.strictEqual(myInstance.methodA, otherInstance.methodA, 'Mixed in properties should be part of classes prototype');

		//---overriding order
		assert.equal(myInstance.methodA(), 'from mixinB', 'Properties in later mixins in same array should override previous mixin properties');
		assert.equal(myInstance.propertyA, 'mAvalueA', 'Properties in mixins should override pre mixin properties');
		assert.equal(myInstance.propertyE, 'valueE', 'Properties in class should override mixin properties');
		assert.equal(myInstance.methodB(), 'from postMixinA', 'Properties in post mixins should override class properties');

		//---multilevel mixing in
		assert.equal(myInstance.propertyC, 'valueC', 'Nested mixins should still be included in proper order to the base mixin');
		assert.equal(myInstance.propertyD, 'mmBvalueD', 'mixinMixinB overrides mixinMixinC overrides mixinA overrides preMixinB');

		//---non properties
		assert.equal(typeof myInstance.nonPropertyA, 'undefined', 'Non properties should not be added to class.');
	});

	test('mixIn', function(assert){
		//==initial setup
		var targetClass = function(){};
		targetClass.originalStatic = 'originalValue';
		targetClass.staticToBeOverridden = 'originalValue';
		var targetObject = {
			originalProperty: 'originalValue'
			,propertyToBeOverridden: 'originalValue'
			,originalMethod: function(){ return this.originalProperty; }
			,methodToBeOverridden: function(){ return 2; }
		};
		var mixinDefinition = {
			properties: {
				mixinProperty: 'mixinValue'
				,propertyToBeOverridden: 'mixinValue'
				,mixinMethod: function(){ return this.mixinProperty; }
				,methodToBeOverridden: function(){ return 'two'; }
			}
			,statics: {
				mixinStatic: 'mixinValue'
				,staticToBeOverridden: 'mixinValue'
			}
		};

		tmclasses.mixIn(mixinDefinition, targetObject, targetClass);
		//==tests
		//--properties
		assert.equal(
			targetObject.originalProperty
			,'originalValue'
			,'Non-overridden property should remain unchanged'
		);
		assert.equal(
			targetObject.originalMethod()
			,'originalValue'
			,'Non-overridden method should remain unchanged'
		);
		assert.equal(
			targetObject.mixinProperty
			,'mixinValue'
			,'Mixin property should be added'
		);
		assert.equal(
			targetObject.propertyToBeOverridden
			,'mixinValue'
			,'Overridden property should have mixin value'
		);
		assert.equal(
			targetObject.mixinMethod()
			,'mixinValue'
			,'Mixin method should be added'
		);
		assert.equal(
			targetObject.methodToBeOverridden()
			,'two'
			,'Overridden method should return mixin method result'
		);
		//--statics
		assert.equal(
			targetClass.originalStatic
			,'originalValue'
			,'Non-overridden static should remain unchanged'
		);
		assert.equal(
			targetClass.mixinStatic
			,'mixinValue'
			,'Mixin static should be added to parent class'
		);
		assert.equal(
			targetClass.staticToBeOverridden
			,'mixinValue'
			,'Overridden static should have overriding value'
		);
	});
}));
