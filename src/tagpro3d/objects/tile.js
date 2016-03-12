import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

var _geometry, _texture;

export default class Tile extends THREE.Mesh {
	constructor(tileId) {
		if (!_texture) {
			_texture = createTexture(tiles.image);
		}

		if (!_geometry) {
			_geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
			_geometry.rotateX(-Math.PI / 2);
		}

		var material = new THREE.MeshPhongMaterial({
			transparent: true,
			map: _texture.clone()
		});

		super(_geometry, material);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		var texture = this.material.map;
		var tile = tiles[tileId];
		var { width, height } = tiles.image;

		texture.offset.set(
			tile.x * TILE_SIZE / width,
			1 - ((tile.y + 1) * TILE_SIZE) / height
		);

		texture.repeat.set(TILE_SIZE / width, TILE_SIZE / height);

		texture.needsUpdate = true;
	}
}

function createTexture(image) {
	var canvas = document.createElement('canvas');
	canvas.width = closestPowerOfTwo(image.width);
	canvas.height = closestPowerOfTwo(image.height);

	var context = canvas.getContext('2d');
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	return new THREE.Texture(canvas);
}


function closestPowerOfTwo(num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}
