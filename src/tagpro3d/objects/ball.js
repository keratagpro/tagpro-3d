import * as THREE from 'three';
import { tiles } from 'tagpro';

import { ball } from '../../options/objects';
import { findDominantColorForTile } from '../utils';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

var ballTileColors = {};

export default class Ball extends THREE.Mesh {
	constructor(params = ball) {
		var _geometry = new THREE.IcosahedronGeometry(params.geometry.radius, params.geometry.detail);
		var _material = new THREE.MeshPhongMaterial(params.materials.default);

		super(_geometry, _material);

		this.position.y = params.geometry.radius;
		this._createOutline(params.outline);

		this.params = params;
	}

	_createOutline(opts) {
		if (!opts.enabled)
			return;

		var outline = new THREE.Mesh(
			new THREE.IcosahedronGeometry(opts.radius, opts.detail),
			new THREE.MeshBasicMaterial({ side: THREE.BackSide })
		);

		this.add(outline);
		this._outline = outline;
	}

	updateColor(player) {
		var tileName = player.team === 1 ? 'redball' : 'blueball';

		if (!ballTileColors[tileName]) {
			ballTileColors[tileName] = findDominantColorForTile(tiles[tileName]);
		}

		this.material.color = ballTileColors[tileName];

		var materials = this.params.materials;
		this.material.setValues(player.team === 1 ? materials.red : materials.blue);

		if (this.params.outline.enabled) {
			this._outline.material.color = this.material.color;
		}
	}

	updatePosition(player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.params.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.params.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.params.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
