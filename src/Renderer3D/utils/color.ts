import RgbQuant from 'rgbquant';
import { TILE_SIZE } from 'tagpro';
import * as THREE from 'three';

import { cropImageToCanvas } from './image';

export function getDominantColor(canvas: HTMLCanvasElement) {
	const quantizer = new RgbQuant({ colors: 4 });

	quantizer.sample(canvas);

	const palette = quantizer.palette(true, true);

	if (!palette) {
		return new THREE.Color(0x333333);
	}

	const colors = palette.map(([r, g, b]) => new THREE.Color(r / 256, g / 256, b / 256));

	// Try to find a non-grayscale color.
	const hsl: THREE.HSL = { h: 0, s: 0, l: 0 };
	const color = colors.find((col) => {
		col.getHSL(hsl);
		return hsl.s > 0.5;
	});

	return color || colors[0];
}

const tileColorCache: Record<string, THREE.Color> = {};

export function getDominantColorForTile(
	img: HTMLImageElement,
	{ x, y }: TagPro.Tile,
	width = TILE_SIZE,
	height = TILE_SIZE
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
