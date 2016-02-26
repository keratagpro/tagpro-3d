import * as THREE from 'three';

import * as utils from '../utils';
import flagpoleJson from './flagpole.json';
import Cloth from '../cloth';

export default class Flag extends THREE.Object3D {
	constructor(options = {}) {
		super();

		var pole = utils.loadObjectFromJson(flagpoleJson);
		this.add(pole);

		this.anchor.add(createCloth(options.material.cloth, options));
	}

	get anchor() {
		return this.getObjectByName('anchor');
	}

	show() {
		this.traverse(o => o.material && (o.material.opacity = 1.0));
		this.anchor.visible = true;
		return this;
	}

	hide() {
		this.traverse(o => o.material && (o.material.opacity = 0.2));
		this.anchor.visible = false;
		return this;
	}

	update(time, delta) {
		if (this.params.cloth.animate) {
			this.cloth.update(delta);
		}
	}
}

function createCloth(material, params) {
	var geometry;
	if (params.animate) {
		var cloth = new Cloth(params);
		geometry = cloth.geometry;
	}
	else {
		geometry = utils.createClothGeometry(params);
		// geometry.rotateX(-0.1);
	}

	var material1 = utils.createMaterial(material);

	return new THREE.Mesh(geometry, material1);
}