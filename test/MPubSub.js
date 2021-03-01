/* global QUnit, setTimeout */
import __BaseClass from '/_src/BaseClass.js';

//--name module
QUnit.module('MPubSub');

QUnit.test('pubsub', function(assert){
	assert.expect(16);
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
	var _async = assert.async();
	_instance.sub('doPubCall', function(_data1, _data2){
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
	});
	_instance.doPub();
	_instance.sub('doPubCall', function(){
		//-# 9
		assert.ok(true, 'second "doPubCall" subscription should be called');
	});
	_instance.doPub();

	//--ensure after all calls are made that QUnit is going
	setTimeout(function(){
		//-# 10
		assert.ok(_hasDoPubBeenCalled, '_hasDoPubBeenCalled should be true after second doPub() call');
		//-# 11
		assert.ok(_hasDoPubSubBeenCalled, '_hasDoPubSubBeenCalled should be true after second doPub() call');
		_async();
	}, 50); //-# must be greater than 0 for phantomjs, which runs the timeout faster than it takes for the sub callbacks to be called
});
QUnit.test('unsub', function(assert){
	var _instance = new __BaseClass();
	var _callback = function(){ 'asdf'; };
	_instance.sub('asdf', _callback);
	_instance.sub('asdf', function(){ 'bsdf'; });
	_instance.sub('asdf', function(){ 'csdf'; });
	_instance.sub('qwer', _callback);
	_instance.sub('qwer', function(){ 'qwer'; });

	assert.strictEqual(
		_instance.getSubscriptions('asdf').length
		,3
		,'Should have 3 "asdf" subscriptions to start'
	);
	assert.strictEqual(
		_instance.getSubscriptions('qwer').length
		,2
		,'Should have 2 "qwer" subscriptions to start'
	);

	//--unsub by callback
	_instance.unsub('asdf', _callback);
	assert.strictEqual(
		_instance.getSubscriptions('asdf').length
		,2
		,'Should have 2 "asdf" subscriptions after unsubscribing by callback'
	);
	assert.strictEqual(
		_instance.getSubscriptions('qwer').length
		,2
		,'Should still have 2 "qwer" subscriptions'
	);

	//--unsub by event name
	_instance.unsub('qwer');
	assert.strictEqual(
		_instance.getSubscriptions('asdf').length
		,2
		,'Should still have 2 "asdf" subscriptions'
	);
	assert.strictEqual(
		_instance.getSubscriptions('qwer').length
		,0
		,'Should have 0 "qwer" subscriptions after unsubscribing entire event name'
	);
});
