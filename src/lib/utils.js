export function after(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function() {
		var result = orig.apply(this, arguments);
		callback.apply(this, arguments);
		return result;
	};
}

export function addStyles(styles) {
	GM_addStyle(styles);
}