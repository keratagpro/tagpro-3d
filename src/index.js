import tagpro from 'tagpro';

import * as utils from './utils';
import createRenderer3D from './create_renderer3d';
import styles from './styles.css';

/**
 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
 * between tagpro.ready and tagpro.ready.after.
 */
tagpro.ready.after = function(callback) {
	if (tagpro.resourcesLoaded) {
		setTimeout(callback, 0);
	}
	else {
		tagpro._afterReadyCallbacks.push(callback);
	}
};

tagpro.ready(function() {
	if (utils.isInGame()) {
		utils.addStyles(styles);
		createRenderer3D();
	}
});
