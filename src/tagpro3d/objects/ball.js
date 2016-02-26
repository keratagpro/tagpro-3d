import * as THREE from 'three';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export default class Ball extends THREE.Mesh {
	constructor(options) {
		var material = new THREE.MeshPhongMaterial();
		var geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
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

			this.position.y = radius;
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

		tempQuaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.options.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.options.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
