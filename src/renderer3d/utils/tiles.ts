import { TILE_SIZE } from 'tagpro';

import * as color from './color';
import * as image from './image';

const tileColorCache = {};

export function getDominantColorForTile(img, { x, y }, width = TILE_SIZE, height = TILE_SIZE) {
	const key = `${img.src}-${x}-${y}-${width}-${height}`;

	if (!tileColorCache[key]) {
		const cropped = image.cropImageToCanvas(img, x * TILE_SIZE, y * TILE_SIZE, width, height);
		tileColorCache[key] = color.getDominantColor(cropped);
	}

	return tileColorCache[key];
}
