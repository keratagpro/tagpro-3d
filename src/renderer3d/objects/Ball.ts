import { tiles } from 'tagpro';
import * as THREE from 'three';

import { ballOptions } from '../options/objects';
import * as utils from '../utils';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export class Ball extends THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhongMaterial> {
	options: typeof ballOptions;

	_outline?: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;

	constructor(tileId: number | string, options = ballOptions) {
		const _geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
		const _material = new THREE.MeshPhongMaterial(options.materials.default);

		super(_geometry, _material);

		this.options = options;
		this.position.y = options.geometry.radius;

		this.addOutline(options.outline, options.outlineMaterials);
		this.updateByTileId(tileId);
	}

	addOutline(params: typeof ballOptions.outline, materials: typeof ballOptions.outlineMaterials) {
		if (!params.enabled) return;

		const outline = new THREE.Mesh(
			new THREE.IcosahedronGeometry(params.radius, params.detail),
			new THREE.MeshBasicMaterial(materials.default)
		);

		this.add(outline);
		this._outline = outline;
	}

	updateByTileId(tileId: number | string) {
		const material = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];

		if (!material.color) material.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		this.material.setValues(material);

		if (this._outline) {
			const outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];

			if (!outlineMaterial.color) outlineMaterial.color = material.color;

			this._outline.material.setValues(outlineMaterial);
		}
	}

	updatePosition(player: TagPro.Player) {
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
