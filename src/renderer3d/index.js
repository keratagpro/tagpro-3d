import { tiles } from 'tagpro';

import defaults from './options';
import * as camera from './camera';
import * as lights from './lights';
import * as objects from './objects';
import * as scene from './scene';
import * as walls from './walls';

class Renderer3D {
	constructor(options = defaults) {
		this.options = options;
		this.dynamicObjects = {};
		this.updatableObjects = [];

		this.camera = camera.createCamera(options.camera);
		this.scene = scene.createScene();
		this.scene.add(this.camera);
	}

	update(timestamp) {
		this.updatableObjects.forEach(obj => obj.update(timestamp));
	}
}

Object.assign(Renderer3D.prototype,
	camera,
	lights,
	objects,
	scene,
	walls
);

export default Renderer3D;