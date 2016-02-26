import * as THREE from 'three';

export function createRectangleShape(width) {
	var half = width / 2;

	var shape = new THREE.Shape();
	shape.moveTo(-half, -half);
	shape.lineTo(half, -half);
	shape.lineTo(half, half);
	shape.lineTo(-half, half);

	return shape;
}

export function createRectangleGeometry(width, extrude = {}) {
	var shape = createRectangleShape(width);

	var geometry = extrudeShape(shape, extrude, width);

	return geometry;
}

export function createClothGeometry({
	width,
	height,
	widthSegments = 10,
	heightSegments = 5,
	waveDepth = 10
}) {
	var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
	geometry.translate(width / 2, height / 2, 0);

	for (var col = 0; col <= widthSegments; col++) {
		let z = Math.sin((col / widthSegments) * Math.PI * 2) * waveDepth;
		for (var row = 0; row <= heightSegments; row++) {
			geometry.vertices[row * (widthSegments + 1) + col].z = z;
		}
	}

	return geometry;
}

export function extrudeShape(shape, extrude, width) {
	var radius = width / 2;
	var geometry = shape.extrude(extrude);
	geometry.translate(0, 0, -extrude.amount);

	if (extrude.bevelEnabled) {
		var xy = 1 / ((radius + extrude.bevelSize) / radius);
		geometry.scale(xy, xy, 1);
	}

	return geometry;
}