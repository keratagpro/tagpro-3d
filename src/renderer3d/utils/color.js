import * as THREE from 'three';
import RgbQuant from 'rgbquant';

export function getDominantColor(canvas) {
	var quantizer = new RgbQuant({
		colors: 4
	});

	quantizer.sample(canvas);

	var palette = quantizer.palette(true, true);

	if (!palette) {
		return null;
	}

	palette = palette.map(([r, g, b]) => new THREE.Color(r / 256, g / 256, b / 256));

	// Try to find a non-grayscale color.
	var color = palette.find(col => col.getHSL().s > 0.5);

	return color || palette[0];
}
