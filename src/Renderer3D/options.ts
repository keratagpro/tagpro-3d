import * as THREE from 'three';

import { BallOptions, ballOptions } from './options/ballOptions';
import { BombOptions, bombOptions } from './options/bombOptions';
import { CameraOptions, cameraOptions } from './options/cameraOptions';
import { LightOptions, lightOptions } from './options/lightOptions';
import { PuckOptions, puckOptions } from './options/puckOptions';
import { WallOptions, wallOptions } from './options/wallOptions';

interface ObjectsOptions {
	ball: BallOptions;
	puck: PuckOptions;
	wall: WallOptions;
	bomb: BombOptions;
}

export interface Options {
	renderer: THREE.WebGLRendererParameters;
	camera: CameraOptions;
	lights: LightOptions[];
	objects: ObjectsOptions;
	ballsArePucks: boolean;
	ballsAre3D: boolean;
	wallsAre3D: boolean;
}

export const defaultOptions: Options = {
	renderer: {
		antialias: true,
		alpha: true,
	},
	camera: cameraOptions,
	lights: lightOptions,
	objects: {
		ball: ballOptions,
		puck: puckOptions,
		wall: wallOptions,
		bomb: bombOptions,
	},
	ballsArePucks: false,
	ballsAre3D: true,
	wallsAre3D: true,
};
