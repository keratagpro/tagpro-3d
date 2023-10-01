import * as FastAverageColor from 'fast-average-color';
import { TILE_SIZE } from 'tagpro';
import * as THREE from 'three';

import { log } from '../../utils/logger';
import { cropImageToCanvas } from './image';

export function getDominantColor(canvas: HTMLCanvasElement) {
	// NOTE: Type coercion is needed because it's exported this way at window.FastAverageColor.
	const fac = new (FastAverageColor as unknown as typeof FastAverageColor.FastAverageColor)();

	const c = fac.getColor(canvas, {
		algorithm: 'dominant',
		ignoredColor: [[0, 0, 0, 0]], // NOTE: Haven't checked why this color appears...
	});

	if (c.error) {
		log.warn('Could not extract dominant color.');
		return new THREE.Color(0x333333);
	}

	log.info(`Found dominant color: ${c.value} %c ⬤`, `color: ${c.hex}`);

	return new THREE.Color(c.value[0] / 256, c.value[1] / 256, c.value[2] / 256);
}

const tileColorCache: Record<string, THREE.Color> = {};

export function getDominantColorForTile(
	img: HTMLImageElement,
	{ x, y }: TagPro.Tile,
	width = TILE_SIZE,
	height = TILE_SIZE,
) {
	const left = x * TILE_SIZE;
	const top = y * TILE_SIZE;
	const key = [img.src, left, top, width, height].join('-');

	if (!tileColorCache[key]) {
		const cropped = cropImageToCanvas(img, left, top, width, height);
		tileColorCache[key] = getDominantColor(cropped);
	}

	return tileColorCache[key];
}
