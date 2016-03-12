import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import { getTileTexture } from '../utils';
import { tile } from '../../options/objects';

var _geometry, _texture;

export default class Tile extends THREE.Mesh {
	constructor(tileId, {
		material
	} = tile) {
		if (!_geometry) {
			_geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
			_geometry.rotateX(-Math.PI / 2);
		}

		var _material = new THREE.MeshPhongMaterial(material);
		_material.map = getTileTexture();

		super(_geometry, _material);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		this.material.map.setTile(tiles[tileId]);
	}
}
