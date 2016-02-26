import * as THREE from 'three';

import * as geometries from '../geometries';

var geometry;

export default class Gate extends THREE.Mesh {
	constructor(options = {}) {

		if (!geometry) geometry = geometries.createRectangleGeometry(options.geometry.width, options.extrude);
		var material = new THREE.MeshPhongMaterial(options.material.off);

		super(geometry, material);

		this.name = 'gate';
		this.options = options;

		this._addOutline();
	}

	_addOutline() {
		var geom = new THREE.EdgesGeometry(this.geometry, 0.1);
		var mat = new THREE.LineBasicMaterial(this.options.material.outline);

		var outline = new THREE.LineSegments(geom, mat);
		outline.matrixAutoUpdate = false;

		this.add(outline);
	}

	off() {
		this.material.setValues(this.options.material.off);
		return this;
	}

	red() {
		this.material.setValues(this.options.material.red);
		return this;
	}

	green() {
		this.material.setValues(this.options.material.green);
		return this;
	}

	blue() {
		this.material.setValues(this.options.material.blue);
		return this;
	}
}
