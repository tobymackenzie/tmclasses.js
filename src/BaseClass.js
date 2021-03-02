import './addParentAccessToMethods.js';
import core from './core.js';
import MGetSet from './MGetSet.js';
import MPubSub from './MPubSub.js';

/*---
Class: BaseClass

Class to be used as parent for most other classes.  Provides the default behavior of accepting a map as the first parameter of the constructor and merging each key into the resulting instance object.  Also tmlib.core.BaseClass.
*/
export default core.create({
	/*---
	Method: init

	Parameters:
		options(map): receives a key value map of properties to add or apply to instance being created.
	*/
	init: function(opts){
		//--deInit if inited
		if(this.isInited){
			this.deInit();
		}

		//--set value of members from arguments
		if(typeof opts === 'object'){
			this.set(opts);
		}

		//--make sure inited flags are set
		this.isInited = true;
		this.hasInited = true;
	},
	properties: {
		/*---
		Method: deInit

		Stop intervals and event monitors and unset instance properties to allow an object to be inited again.  Meant to be overridden by children.
		*/
		deInit: function(){
			this.isInited = false;
		},

		/*---
		Property: hasInited

		Whether the object has been inited ever.  Allows classes that will be inited multiple times to handle the first time differently
		*/
		hasInited: false,

		/*---
		Property: isInited

		Whether the object has been inited and not deInited.
		*/
		isInited: false,
	},
	statics: {
		/*---
		Method: create

		Create a new instance of the class.
		*/
		create: function(){
			return this.apply(this, arguments);
		},
	},
	mixins: [
		MGetSet,
		MPubSub,
	],
});
