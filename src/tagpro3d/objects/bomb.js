import * as THREE from 'three';

import bombJson from './bomb.json';
import { loadObjectFromJson } from '../utils';

export default class Bomb extends THREE.Object3D {
	constructor(options = {}) {
		super();

		var mesh = loadObjectFromJson(bombJson);
		this.add(mesh);
		this.getObjectByName('bomb').material.setValues(options.material.body);

		this.options = options;
	}

	show() {
		var values = this.options.material.show;

		this.traverse(o => {
			if (!o.material) return;
			o.material.setValues(values);
		});

		return this;
	}

	hide() {
		var values = this.options.material.hide;

		this.traverse(o => {
			if (!o.material) return;
			o.material.setValues(values);
		});

		return this;
	}
}