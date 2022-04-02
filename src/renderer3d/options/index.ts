import * as objects from './objects';

export const defaultOptions = {
	renderer: {
		antialias: true,
		alpha: true,
	},
	camera: {
		near: 10,
		far: 10000,
		distance: 1000,
	},
	lights: [
		{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 },
		{ enabled: true, type: 'ambient', color: 0x666666 },
		{ enabled: true, type: 'directional', color: 0xffffff, intensity: 1.0, position: [-500, 500, -500] },
	],
	objects,
	ballsArePucks: false,
};
