type Callable<T> = T extends Function ? T : never;

export function before<T extends object, K extends keyof T, C extends Callable<T[K]>>(
	obj: T,
	methodName: K,
	callback: C,
) {
	const original = obj[methodName] as C;

	Object.assign(obj, {
		[methodName]() {
			callback.apply(this, arguments);
			return original.apply(this, arguments);
		},
	});
}

export function after<T extends object, K extends keyof T, C extends Callable<T[K]>>(
	obj: T,
	methodName: K,
	callback: C,
) {
	const original = obj[methodName] as C;

	Object.assign(obj, {
		[methodName]() {
			const result = original.apply(this, arguments);
			callback.apply(this, arguments);
			return result;
		},
	});
}
