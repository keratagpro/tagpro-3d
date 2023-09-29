import * as THREE from 'three';

export class SpriteTexture extends THREE.Texture {
	x = 0;
	y = 0;

	constructor(
		image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
		protected columns: number,
		protected rows: number,
	) {
		super(image);

		this.repeat.set(1 / columns, 1 / rows);
	}

	copy(source: SpriteTexture) {
		super.copy(source);

		this.columns = source.columns;
		this.rows = source.rows;

		return this;
	}

	setXY(x: number, y: number) {
		if (x === this.x && y === this.y) return;

		this.x = x;
		this.y = y;

		this.offset.set(x / this.columns, 1 - (y + 1) / this.rows);

		this.needsUpdate = true;
	}

	setTile({ x, y }: { x: number; y: number }) {
		this.setXY(x, y);
	}
}
