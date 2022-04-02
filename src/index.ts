import * as tagpro from 'tagpro';

import { createRenderer3D } from './createRenderer3D';
import * as utils from './utils';

/**
 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
 * between tagpro.ready and tagpro.ready.after.
 */
tagpro.ready.after = function (callback) {
	if (tagpro.resourcesLoaded) {
		setTimeout(callback, 0);
	} else {
		tagpro._afterReadyCallbacks.push(callback);
	}
};

tagpro.ready(function () {
	if (utils.isInGame()) {
		createRenderer3D();
	}
});
