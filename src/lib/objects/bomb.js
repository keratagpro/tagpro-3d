import * as THREE from 'three';

import bombModel from '../models/bomb.json';
import { loadObjectFromJson } from '../utils';

export default class Bomb extends THREE.Object3D {
	constructor(materials = {}, options = {}) {
		super();

		this.materials = materials;

		var mesh = loadObjectFromJson(bombModel);

		this.add(mesh);

		this.getObjectByName('bomb').material.setValues(materials.default);
	}

	show() {
		this.traverse(o => o.material && o.material.setValues(this.materials.visible));
		return this;
	}

	hide() {
		this.traverse(o => o.material && o.material.setValues(this.materials.hidden));
		return this;
	}
}
