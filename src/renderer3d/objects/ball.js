import * as THREE from 'three';
import { tiles } from 'tagpro';

import { ball } from '../options/objects';
import * as utils from '../utils';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export default class Ball extends THREE.Mesh {
	constructor(tileId, params = ball) {
		var _geometry = new THREE.IcosahedronGeometry(params.geometry.radius, params.geometry.detail);
		var _material = new THREE.MeshPhongMaterial(params.materials.default);

		super(_geometry, _material);

		this.params = params;
		this.position.y = params.geometry.radius;

		this.addOutline(params.outline, params.outlineMaterials);
		this.updateByTileId(tileId);
	}

	addOutline(params, materials) {
		if (!params.enabled)
			return;

		var outline = new THREE.Mesh(
			new THREE.IcosahedronGeometry(params.radius, params.detail),
			new THREE.MeshBasicMaterial(materials.default)
		);

		this.add(outline);
		this._outline = outline;
	}

	updateByTileId(tileId) {
		var material = this.params.materials[tileId === 'redball' ? 'red' : 'blue'];

		if (!material.color)
			material.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		this.material.setValues(material);

		if (this._outline) {
			var outlineMaterial = this.params.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];

			if (!outlineMaterial.color)
				outlineMaterial.color = material.color;

			this._outline.material.setValues(outlineMaterial);
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
