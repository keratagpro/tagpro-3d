import * as THREE from 'three';

import { extrudeShape } from '../geometries';

const tempQuaternion = new THREE.Quaternion();
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export default class Puck extends THREE.Mesh {
	constructor(options) {
		var material = new THREE.MeshPhongMaterial();
		var geometry = createPuckGeometry(options.geometry, options.extrude);
		// var geometry = new THREE.SphereGeometry(options.geometry.radius, 12, 8);

		super(geometry, material);

		this.options = options;
		this._createOutline();
	}

	_createOutline() {
		var outline = this.options.outline;

		if (outline && outline.enabled) {
			var radius = this.options.geometry.radius;
			this.outlineMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
			this.add(new THREE.Mesh(this.geometry.clone(), this.outlineMaterial));

			var scale = 1 - (outline.width / radius);
			this.geometry.scale(scale, scale, scale);

			this.position.z = radius;
		}
	}

	updateColor(player) {
		var material = this.options.material;
		this.material.setValues(player.team === 1 ? material.red : material.blue);

		var outline = this.options.outline;
		if (outline && outline.enabled) {
			this.outlineMaterial.setValues(player.team === 1 ? outline.red : outline.blue);
		}
	}

	updatePosition(player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Z, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}

function createPuckGeometry({ radius, holeRadius }, extrude) {
	var shape = createPuckShape(radius, holeRadius);
	var geometry = extrudeShape(shape, extrude, radius * 2);

	return geometry;
}

function createPuckShape(radius, holeRadius) {
	var shape = new THREE.Shape();
	shape.moveTo(radius, 0);
	shape.absarc(0, 0, radius, 0, 2 * Math.PI, false);

	if (holeRadius > 0) {
		var hole = new THREE.Shape();
		hole.moveTo(holeRadius, 0);
		hole.absarc(0, 0, holeRadius, 0, 2 * Math.PI, true);
		shape.holes.push(hole);
	}

	return shape;
}