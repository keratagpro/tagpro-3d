import * as tagpro from 'tagpro';

export function isInGame() {
	return tagpro.state > 0;
}

// TODO: How to narrow T[K] to a callable function?

export function before<T, K extends keyof T>(obj: T, methodName: K, callback: T[K]) {
	const orig = obj[methodName] as any;
	(obj as any)[methodName] = function () {
		(callback as any).apply(this, arguments);
		return orig.apply(this, arguments);
	};
}

export function after<T, K extends keyof T>(obj: T, methodName: K, callback: T[K]) {
	const orig = obj[methodName] as any;
	(obj as any)[methodName] = function () {
		const result = orig.apply(this, arguments);
		(callback as any).apply(this, arguments);
		return result;
	};
}
