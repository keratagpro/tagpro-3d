import * as THREE from 'three';

export default class SpriteTexture extends THREE.Texture {
	constructor(image, columns, rows) {
		super(image);

		this.repeat.set(1 / columns, 1 / rows);

		this._columns = columns;
		this._rows = rows;
	}

	get columns() {
		return this._columns;
	}

	get rows() {
		return this._rows;
	}

	copy(source) {
		super.copy(source);

		this._columns = source._columns;
		this._rows = source._rows;

		return this;
	}

	setXY(x, y) {
		if (x === this._x && y === this._y)
			return;

		this._x = x;
		this._y = y;

		this.offset.set(
			x / this._columns,
			1 - (y + 1) / this._rows
		);

		this.needsUpdate = true;
	}

	setTile({ x, y }) {
		this.setXY(x, y);
	}
}
