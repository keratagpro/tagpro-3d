import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import * as utils from '../utils';
import { tile } from '../../options/objects';
import SpriteTexture from '../../lib/sprite_texture';

var _geometry;

export default class Tile extends THREE.Mesh {
	constructor(tileId, params = tile) {
		if (!_geometry) {
			_geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
			_geometry.rotateX(-Math.PI / 2);
		}

		var texture = utils.getTilesTexture();
		texture.setTile(tiles[tileId]);

		var material = new THREE.MeshPhongMaterial(
			Object.assign({ map: texture }, params.material)
		);

		super(_geometry, material);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		this.material.map.setTile(tiles[tileId]);
	}
}
