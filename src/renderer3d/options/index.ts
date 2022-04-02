import * as THREE from 'three';
import * as objects from './objects';

interface CameraLightOptions {
	type: 'camera';
	color: number;
	intensity?: number;
}

interface AmbientLightOptions {
	type: 'ambient';
	color: number;
}

interface DirectionalLightOptions {
	type: 'directional';
	color: number;
	intensity: number;
	position: [number, number, number];
}

type LightOptions = { enabled: boolean } & (CameraLightOptions | AmbientLightOptions | DirectionalLightOptions);

interface Options {
	renderer: THREE.WebGLRendererParameters;
	camera: {
		near: number;
		far: number;
		distance: number;
	};
	lights: LightOptions[];
	objects: typeof objects;
	ballsArePucks: boolean;
	ballsAre3D: boolean;
	wallsAre3D: boolean;
}

export const defaultOptions: Options = {
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
	ballsAre3D: true,
	wallsAre3D: true,
};
