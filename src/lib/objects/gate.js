import * as THREE from 'three';

import * as utils from '../utils';

var geometry;

export default class Gate extends THREE.Mesh {
	constructor(materials = {}, options = {}) {
		if (!geometry) geometry = utils.createRectangleGeometry(options.width, options.extrude);
		var material = utils.createMaterial(materials.default);

		super(geometry, material);

		this.name = 'gate';

		this.options = options;
		this.materials = materials;
	}

	off() {
		this.material.setValues(this.materials.off);
		return this;
	}

	red() {
		this.material.setValues(this.materials.red);
		return this;
	}

	green() {
		this.material.setValues(this.materials.green);
		return this;
	}

	blue() {
		this.material.setValues(this.materials.blue);
		return this;
	}
}
