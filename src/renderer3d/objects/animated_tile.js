import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import * as constants from '../constants';
import * as utils from '../utils';
import { animatedTile } from '../options/objects';

var _geometry;

export default class AnimatedTile extends THREE.Mesh {
	constructor(tileId, params = animatedTile) {
		if (!_geometry) {
			_geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
			_geometry.rotateX(-Math.PI / 2);
		}

		var texture = utils.getTextureByTileId(tileId);

		var material = new THREE.MeshPhongMaterial(
			Object.assign({ map: texture }, params.material)
		);

		super(_geometry, material);

		this._startTime = performance.now();
		this._frameDuration = 1000 / (6 + Math.random() / 10);

		this.texture = texture;
		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		if (tileId == constants.SPEEDPAD_OFF ||
			tileId == constants.SPEEDPAD_BLUE_OFF ||
			tileId == constants.SPEEDPAD_RED_OFF ||
			tileId == constants.PORTAL_OFF)
			this.pause();
		else
			this.play();
	}

	play() {
		this.setRange(0, this.texture.columns - 2);
	}

	pause() {
		this.setRange(this.texture.columns - 1, this.texture.columns - 1);
	}

	setRange(from, to) {
		this._from = from;
		this._to = to;
	}

	update(timestamp) {
		if (this._from === this._to) {
			this.texture.setXY(this._from, 0);
		}
		else {
			var range = this._to - this._from;
			var delta = timestamp - this._startTime;
			var index = Math.round((delta / this._frameDuration) % range);
			this.texture.setXY(index + this._from, 0);
		}
	}
}
