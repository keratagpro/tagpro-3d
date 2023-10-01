import { Logger } from 'loglevel';

import { Options } from '../options';
import { log } from '../utils/logger';
import * as camera from './camera';
import * as lights from './lights';
import * as objects from './objects';
import * as scene from './scene';
import { PlayerData, Renderer } from './types';
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
	players: Record<number, PlayerData> = {};
	log: Logger;

	constructor(public options: Options) {
		this.camera = camera.createCamera(this.options.camera);
		this.scene = scene.createScene();
		this.scene.add(this.camera);
		this.log = log;
	}
}

export interface Renderer3D
	extends Renderer,
		CameraFunctions,
		ObjectFunctions,
		WallFunctions,
		LightFunctions,
		SceneFunctions {}

Object.assign(Renderer3D.prototype, camera, lights, objects, scene, walls);
