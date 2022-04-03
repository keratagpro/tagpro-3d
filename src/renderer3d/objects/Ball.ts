import { renderer } from 'tagpro';
import * as THREE from 'three';

import { BallOptions } from '../options/ballOptions';
import { PositionUpdate } from '../types';

const tempQuaternion = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

export class Ball extends THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhongMaterial> {
	_outline?: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;

	constructor(public options: BallOptions) {
		const geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
		const material = new THREE.MeshPhongMaterial(options.materials.default);

		super(geometry, material);

		this.position.y = options.geometry.radius;

		if (options.outline.enabled) {
			this.addOutline(options.outline, options.outlineMaterials);
		}
	}

	addOutline(params: BallOptions['outline'], materials: BallOptions['outlineMaterials']) {
		const outline = new THREE.Mesh(
			new THREE.IcosahedronGeometry(params.radius, params.detail),
			new THREE.MeshBasicMaterial(materials.default)
		);

		this.add(outline);
		this._outline = outline;
	}

	updateByTileId(tileId: number | string) {
		const material = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];

		this.material.setValues(material);

		if (this._outline) {
			const outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];

			if (!outlineMaterial.color) {
				outlineMaterial.color = material.color;
			}

			this._outline.material.setValues(outlineMaterial);
		}
	}

	updatePosition({ x, y, lx = 0, ly = 0, a = 0 }: PositionUpdate) {
		this.position.x = x;
		this.position.z = y;

		tempQuaternion.setFromAxisAngle(AXIS_X, ly * this.options.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Z, -lx * this.options.velocityCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

		tempQuaternion.setFromAxisAngle(AXIS_Y, -a * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
