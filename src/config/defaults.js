import { TILE_SIZE } from 'tagpro';
import * as THREE from 'three';

import * as materials from './materials';
import * as objects from './objects';

const renderer = {
	antialias: true,
	alpha: true
};

const camera = {
	near: 10,
	far: 10000,
	distance: 1000,
};

const lights = [
	{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 },
	{ enabled: true, type: 'ambient', color: 0x666666 },
	{ enabled: true, type: 'directional', color: 0xffffff, intensity: 0.8, position: [-500, 500, 400] },
];

export default {
	tileSize: TILE_SIZE,
	renderer,
	camera,
	lights,
	materials,
	objects,
};