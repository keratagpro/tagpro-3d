import * as THREE from 'three';

import * as lights from './lights';
import * as objects from './objects';
import * as utils from './utils';
import * as walls from './walls';
import options from '../options';

export default Object.assign({
	TILE_SIZE: 40,
	dynamicObjects: {},
	updatableObjects: [],
	options
}, objects, utils, walls, lights);