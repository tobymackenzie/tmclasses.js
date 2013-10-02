/* global define, QUnit, setTimeout, test */
(function(__globals, _factory){
	if(typeof define === 'function' && define.amd){
		if(__globals.__usingAlmondBuild){
			define(['tmclasses'], function(__tmclasses){
				return _factory(__tmclasses, __tmclasses.BaseClass);
			});
		}else{
			define(['tmclasses/core', 'tmclasses/BaseClass'], _factory);
		}
	}else{
		var __tmclasses = __globals.tmclasses;
		_factory(__tmclasses, __tmclasses.BaseClass);
	}
}(this, function(__core, __BaseClass){
	//--name module
	QUnit.module('MPubSub');

	test('pubsub', function(assert){
		QUnit.expect(13);
		//==initial setup
		var _hasDoPubBeenCalled = false;
		var _hasDoPubSubBeenCalled = false;
		var _instance = new __BaseClass({
			doPub: function(){
				_hasDoPubBeenCalled = true;
				this.pub('doPubCall', 'doPubData');
			}
		});

		//==tests
		_instance.doPub();
		assert.ok(_hasDoPubBeenCalled, '_hasDoPubBeenCalled should be true after first doPub() call');
		assert.ok(!_hasDoPubSubBeenCalled, '_hasDoPubSubBeenCalled should still be false after first doPub() call');
		QUnit.stop();
		_instance.sub('doPubCall', function(_data){
			QUnit.start();
			_hasDoPubSubBeenCalled = true;
			assert.ok(true, '"doPubCall" subscription should be called');
			assert.strictEqual(
				_data
				,'doPubData'
				,'doPubCall data should be the string"doPubData"'
			);
			QUnit.stop();
		});
		_instance.doPub();
		_instance.sub('doPubCall', function(){
			QUnit.start();
			assert.ok(true, 'second "doPubCall" subscription should be called');
			QUnit.stop();
		});
		_instance.doPub();

		//--ensure after all calls are made that QUnit is going
		setTimeout(function(){
			QUnit.start();
			assert.ok(_hasDoPubBeenCalled, '_hasDoPubBeenCalled should be true after second doPub() call');
			assert.ok(_hasDoPubSubBeenCalled, '_hasDoPubSubBeenCalled should be true after second doPub() call');
		}, 0);
	});
}));
