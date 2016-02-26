import * as THREE from 'three';

import * as clipper from './clipper';
import * as objects from './objects';
import * as utils from './utils';
import options from '../options';

export default Object.assign({
	TILE_SIZE: 40,
	dynamicObjects: {},
	options
}, objects, utils);