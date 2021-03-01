/*---
Function: mergeIn

Merge all keys from all other objects into first object, preferring keys of objects to the farthest right.

Parameters:
	_object(Object): object to merge other paramaters into
	any number of objects to merge into first, preferring keys of objects to the right over keys to the left

Returns:
	Modified object
*/
export default function mergeIn(){
	var _target = arguments[0];
	for(var _i = 1; _i < arguments.length; ++_i){
		if(typeof arguments[_i] === 'object'){
			for(var _objKey in arguments[_i]){
				if(arguments[_i].hasOwnProperty(_objKey)){
					_target[_objKey] = arguments[_i][_objKey];
				}
			}
		}
	}
	return _target;
}
