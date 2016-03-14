import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import * as utils from '../utils';
import { puck } from '../options/objects';

const AXIS_Y = new THREE.Vector3(0, 1, 0);
const BALL_RADIUS = 38;
const tempQuaternion = new THREE.Quaternion();

function createCircle(geometry, material) {
	var geom = new THREE.CircleGeometry(geometry.radius, geometry.segments);
	geom.rotateX(-Math.PI / 2);

	var mat = new THREE.MeshPhongMaterial(material);

	var mesh = new THREE.Mesh(geom, mat);

	return mesh;
}

function createCylinder(geometry, material) {
	var geom = new THREE.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.segments, 1, true);

	var mat = new THREE.MeshPhongMaterial(material);

	return new THREE.Mesh(geom, mat);
}

export default class Puck extends THREE.Object3D {
	constructor(tileId, params = puck) {
		super();

		this.params = params;

		this.position.y = params.geometries.cylinder.height / 2;

		this._circle = createCircle(params.geometries.circle, params.materials.circle.default);
		this._circle.position.y = params.geometries.cylinder.height / 2;
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

			// HACK: Shrink texture mapping since ball is 38px, not 40px.
			texture.offset.x += (1 / TILE_SIZE) / 16;
			texture.offset.y += (1 / TILE_SIZE) / 11;
			texture.repeat.x -= (2 / TILE_SIZE) / 16;
			texture.repeat.y -= (2 / TILE_SIZE) / 11;
		}
		else if (!circleMaterial.color) {
			circleMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);
		}

		circle.material.setValues(circleMaterial);

		var cylinderMaterial = materials.cylinder[materialName];

		if (!cylinderMaterial.color)
			cylinderMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		cylinder.material.setValues(cylinderMaterial);
	}

	updatePosition(player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.params.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
