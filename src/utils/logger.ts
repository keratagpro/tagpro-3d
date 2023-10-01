import log from 'loglevel';

const originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
	const rawMethod = originalFactory(methodName, logLevel, loggerName);

	return function (...args: unknown[]) {
		rawMethod('%c[TagPro3D]', 'color: green', ...args);
	};
};

log.setLevel(log.getLevel());

export { log };
