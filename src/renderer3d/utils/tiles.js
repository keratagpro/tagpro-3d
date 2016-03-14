import * as color from './color';
import * as image from './image';
import { TILE_SIZE } from 'tagpro';

const tileColorCache = {};

export function getDominantColorForTile(img, { x, y }, width = TILE_SIZE, height = TILE_SIZE) {
	var key = `${img.src}-${x}-${y}-${width}-${height}`;

	if (!tileColorCache[key]) {
		var cropped = image.cropImageToCanvas(img, x * TILE_SIZE, y * TILE_SIZE, width, height);
		tileColorCache[key] = color.getDominantColor(cropped);
	}

	return tileColorCache[key];
}
