import RgbQuant from 'rgbquant';
import * as THREE from 'three';

export function getDominantColor(canvas: HTMLCanvasElement) {
	const quantizer = new RgbQuant({
		colors: 4,
	});

	quantizer.sample(canvas);

	let palette = quantizer.palette(true, true);

	if (!palette) {
		return null;
	}

	palette = palette.map(([r, g, b]: [number, number, number]) => new THREE.Color(r / 256, g / 256, b / 256));

	// Try to find a non-grayscale color.
	const color = palette.find((col: any) => col.getHSL().s > 0.5);

	return color || palette[0];
}
