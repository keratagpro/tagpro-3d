import * as THREE from 'three';

import * as geometries from '../geometries';

var geometry;

export default class Gate extends THREE.Mesh {
	constructor(options = {}) {

		if (!geometry) geometry = geometries.createRectangleGeometry(options.geometry.width, options.extrude);
		var material = new THREE.MeshPhongMaterial(options.material.off);

		super(geometry, material);

		this.rotateX(Math.PI / 2);

		this.name = 'gate';
		this.options = options;

		this._addOutline();
	}

	_addOutline() {
		var geom = new THREE.EdgesGeometry(this.geometry, 0.1);
		var mat = new THREE.LineBasicMaterial(this.options.material.outline);

		this.outline = new THREE.LineSegments(geom, mat);
		this.outline.matrixAutoUpdate = false;

		this.add(this.outline);
	}

	off() {
		this.outline.visible = true;
		this.material.setValues(this.options.material.off);
		return this;
	}

	red() {
		this.outline.visible = false;
		this.material.setValues(this.options.material.red);
		return this;
	}

	green() {
		this.outline.visible = false;
		this.material.setValues(this.options.material.green);
		return this;
	}

	blue() {
		this.outline.visible = false;
		this.material.setValues(this.options.material.blue);
		return this;
	}
}
