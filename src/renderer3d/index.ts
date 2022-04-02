import * as camera from './camera';
import * as lights from './lights';
import * as objects from './objects';
import { defaultOptions } from './options';
import * as scene from './scene';
import { Renderer } from './types';
import * as walls from './walls';

type CameraFunctions = typeof camera;
type LightFunctions = typeof lights;
type SceneFunctions = typeof scene;
type ObjectFunctions = typeof objects;
type WallFunctions = typeof walls;

export class Renderer3D {
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
	renderer?: THREE.WebGLRenderer;

	options: typeof defaultOptions;
	dynamicObjects: any;
	updatableObjects: any;

	constructor(options = {}) {
		this.options = Object.assign({}, defaultOptions, options);
		this.dynamicObjects = {};
		this.updatableObjects = [];

		this.camera = camera.createCamera(this.options.camera);
		this.scene = scene.createScene();
		this.scene.add(this.camera);
	}

	// update(timestamp) {
	// 	this.updatableObjects.forEach((obj) => obj.update(timestamp));
	// }
}

/* eslint-disable @typescript-eslint/indent */
export interface Renderer3D
	extends Renderer,
		CameraFunctions,
		ObjectFunctions,
		WallFunctions,
		LightFunctions,
		SceneFunctions {}

Object.assign(Renderer3D.prototype, camera, lights, objects, scene, walls);
