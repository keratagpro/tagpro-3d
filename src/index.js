import tagpro from 'tagpro';

import * as checks from './lib/checks';
import createRenderer3D from './renderer';
import { readyAfter } from './lib/hacks';

// Extend tagpro.ready.after
tagpro.ready.after = readyAfter.bind(null, tagpro);

tagpro.ready(function() {
	if (checks.isInGame()) {
		createRenderer3D();
	}
});
