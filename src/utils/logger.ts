import log from 'loglevel';

const originalFactory = log.methodFactory;

log.methodFactory = function (methodName, logLevel, loggerName) {
	const rawMethod = originalFactory(methodName, logLevel, loggerName);

	return function (message) {
		rawMethod('[TagPro3D] ' + message);
	};
};

log.setLevel(log.getLevel());

export { log };
