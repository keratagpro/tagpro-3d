import { tiles } from 'tagpro';
import * as THREE from 'three';

import { BallOptions } from '../../options/ballOptions';
import { getDominantColorForTile } from '../utils';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export class Ball extends THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhongMaterial> {
	outline?: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;

	constructor(
		tileId: number | string,
		public options: BallOptions,
	) {
		const geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
		const material = new THREE.MeshPhongMaterial(options.materials.default);

		super(geometry, material);

		this.position.y = options.geometry.radius;

		if (options.outline.enabled) {
			this.addOutline(options.outline, options.outlineMaterials);
		}

		this.updateByTileId(tileId);
	}

	addOutline(params: BallOptions['outline'], materials: BallOptions['outlineMaterials']) {
		const outline = new THREE.Mesh(
			new THREE.IcosahedronGeometry(params.radius, params.detail),
			new THREE.MeshBasicMaterial(materials.default),
		);

		this.add(outline);
		this.outline = outline;
	}

	updateByTileId(tileId: number | string) {
		const materialParams = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];

		if (this.options.useDominantColorFromTexturePack) {
			materialParams.color = getDominantColorForTile(tiles.image, tiles[tileId]);
		}

		this.material.setValues(materialParams);

		if (this.outline) {
			const outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];

			if (!outlineMaterial.color) {
				outlineMaterial.color = materialParams.color;
			}

			this.outline.material.setValues(outlineMaterial);
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
