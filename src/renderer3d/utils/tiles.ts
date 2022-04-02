import { TILE_SIZE } from 'tagpro';

import * as color from './color';
import * as image from './image';

const tileColorCache: Record<string, number> = {};

type Tile = { x: number; y: number };

export function getDominantColorForTile(img: HTMLImageElement, { x, y }: Tile, width = TILE_SIZE, height = TILE_SIZE) {
	const key = `${img.src}-${x}-${y}-${width}-${height}`;

	if (!tileColorCache[key]) {
		const cropped = image.cropImageToCanvas(img, x * TILE_SIZE, y * TILE_SIZE, width, height);
		tileColorCache[key] = color.getDominantColor(cropped);
	}

	return tileColorCache[key];
}
