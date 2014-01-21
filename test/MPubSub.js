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
		QUnit.expect(16);
		//==initial setup
		var _hasDoPubBeenCalled = false;
		var _hasDoPubSubBeenCalled = false;
		var _instance = new __BaseClass({
			doPub: function(){
				_hasDoPubBeenCalled = true;
				this.pub('doPubCall', 'doPubData1', 'doPubData2');
			}
		});

		//==tests
		_instance.doPub();
		//-# 1
		assert.ok(_hasDoPubBeenCalled, '_hasDoPubBeenCalled should be true after first doPub() call');
		//-# 2
		assert.ok(!_hasDoPubSubBeenCalled, '_hasDoPubSubBeenCalled should still be false after first doPub() call');
		QUnit.stop();
		_instance.sub('doPubCall', function(_data1, _data2){
			QUnit.start();
			_hasDoPubSubBeenCalled = true;
			//-# 3, 6
			assert.ok(true, '"doPubCall" subscription should be called');
			//-# 4, 7
			assert.strictEqual(
				_data1
				,'doPubData1'
				,'doPubCall data should be the string"doPubData1"'
			);
			//-# 5, 8
			assert.strictEqual(
				_data2
				,'doPubData2'
				,'doPubCall data should be the string"doPubData2"'
			);
			QUnit.stop();
		});
		_instance.doPub();
		_instance.sub('doPubCall', function(){
			QUnit.start();
			//-# 9
			assert.ok(true, 'second "doPubCall" subscription should be called');
			QUnit.stop();
		});
		_instance.doPub();

		//--ensure after all calls are made that QUnit is going
		setTimeout(function(){
			QUnit.start();
			//-# 10
			assert.ok(_hasDoPubBeenCalled, '_hasDoPubBeenCalled should be true after second doPub() call');
			//-# 11
			assert.ok(_hasDoPubSubBeenCalled, '_hasDoPubSubBeenCalled should be true after second doPub() call');
		}, 50); //-# must be greater than 0 for phantomjs, which runs the timeout faster than it takes for the sub callbacks to be called
	});
}));
