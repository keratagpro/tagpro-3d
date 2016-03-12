import * as THREE from 'three';
import { TILE_SIZE } from 'tagpro';

export default class SpriteTexture extends THREE.Texture {
	constructor(image, columns = 16, rows = 11, tileSize = TILE_SIZE) {
		super(image);

		this.repeat.set(1 / columns, 1 / rows);

		this._columns = columns;
		this._rows = rows;
		this._tileSize = tileSize;
		this._width = columns * tileSize;
		this._height = rows * tileSize;
	}

	setTile(tile) {
		this.offset.set(
			tile.x * this._tileSize / this._width,
			1 - ((tile.y + 1) * this._tileSize) / this._height
		);

		this.needsUpdate = true;
	}
}