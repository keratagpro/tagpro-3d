import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import { extrudeShape } from '../geometries';
import { textureLoader, findDominantColorForTile } from '../utils';

const TILES_WIDTH = 16 * TILE_SIZE;
const TILES_HEIGHT = 11 * TILE_SIZE;
const BALL_WIDTH = 38;

const tempQuaternion = new THREE.Quaternion();
const AXIS_Y = new THREE.Vector3(0, 1, 0);

export default class Puck extends THREE.Mesh {
	constructor(options) {
		var material = new THREE.MeshPhongMaterial(options.materials.default);
		var geometry = new THREE.CircleGeometry(options.geometry.radiusTop, options.geometry.segments);

		super(geometry, material);

		this.options = options;
		this.addCylinder(options);

		this.rotateX(Math.PI / 2);
		this.position.y = options.geometry.height;
	}

	addCylinder(options) {
		var geom = options.geometry;

		var material = new THREE.MeshPhongMaterial(options.materials.default);
		var geometry = new THREE.CylinderGeometry(geom.radiusTop, geom.radiusBottom, geom.height, geom.segments, 1, true);
		geometry.rotateX(-Math.PI / 2);
		geometry.translate(0, 0, geom.height / 2);

		var cylinder = new THREE.Mesh(geometry, material);

		this.add(cylinder);
		this.cylinder = cylinder;
	}

	updateColor(player) {
		var tileName = player.team === 1 ? 'redball' : 'blueball';
		var tile = tiles[tileName];

		if (!tile.texture) {
			createBallTexture(tile);
		}

		this.material.map = tile.texture;

		var materials = this.options.materials;
		var material = player.team === 1 ? materials.red : materials.blue;
		this.cylinder.material.setValues(material);

		if (!tile.dominantColor) {
			tile.dominantColor = findDominantColorForTile(tile);
		}

		this.cylinder.material.color = tile.dominantColor;
	}

	updatePosition(player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}

function createBallTexture(tile) {
	var texture = new THREE.Texture(tiles.image);
	texture.needsUpdate = true;

	var left = (tile.x * TILE_SIZE) / TILES_WIDTH;
	var top = (tile.y * TILE_SIZE) / TILES_HEIGHT;

	texture.offset.set(
		left + (1 / TILES_WIDTH),
		1 - (top + (BALL_WIDTH + 1) / TILES_HEIGHT)
	);

	var w = BALL_WIDTH / TILES_WIDTH;
	var h = BALL_WIDTH / TILES_HEIGHT;

	texture.repeat.set(w, h);

	tile.texture = texture;
}