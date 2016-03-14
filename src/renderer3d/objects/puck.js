import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import * as utils from '../utils';
import { puck } from '../options/objects';

const AXIS_Y = new THREE.Vector3(0, 1, 0);
const BALL_RADIUS = 38;
const tempQuaternion = new THREE.Quaternion();

function createCircle(geometry, material) {
	var geom = new THREE.CircleGeometry(geometry.radius, geometry.segments);

	var mat = new THREE.MeshPhongMaterial(material);

	return new THREE.Mesh(geom, mat);
}

function createCylinder(geometry, material) {
	var geom = new THREE.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.segments, 1, true);
	geom.rotateX(-Math.PI / 2);
	geom.translate(0, 0, geometry.height / 2);

	var mat = new THREE.MeshPhongMaterial(material);

	return new THREE.Mesh(geom, mat);
}

export default class Puck extends THREE.Object3D {
	constructor(tileId, params = puck) {
		super();

		this.rotateX(Math.PI / 2);
		this.position.y = params.geometry.height;

		this.params = params;

		this._circle = createCircle(params.geometries.circle, params.materials.circle.default);
		this.add(this._circle);

		this._cylinder = createCylinder(params.geometries.cylinder, params.materials.cylinder.default);
		this.add(this._cylinder);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		var materialName = tileId === 'redball' ? 'red' : 'blue';

		var circle = this._circle;
		var cylinder = this._cylinder;
		var materials = this.params.materials;

		var circleMaterial = materials.circle[materialName];

		// Use built-in ball texture if not explicitly set
		if (!circleMaterial.map) {
			if (!this._tileTexture) {
				this._tileTexture = utils.getTilesTexture();
				circle.material.map = this._tileTexture;
			}

			var texture = circle.material.map;
			texture.setTile(tiles[tileId]);

			// Shrink texture mapping based on ball size.
			var diff = (TILE_SIZE / 2) - BALL_RADIUS;
			texture.offset.x += diff / TILE_SIZE;
			texture.offset.y += diff / TILE_SIZE;
			texture.repeat.x -= (2 * diff) / TILE_SIZE;
			texture.repeat.y -= (2 * diff) / TILE_SIZE;
			texture.needsUpdate = true;
		}

		if (!circleMaterial.color)
			circleMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		circle.material.setValues(circleMaterial);

		var cylinderMaterial = materials.cylinder[materialName];

		if (!cylinderMaterial.color)
			cylinderMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		cylinder.material.setValues(cylinderMaterial);
	}

	updatePosition(player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
