import * as THREE from 'three';

export const square = createPathGeometry([0, 0], [1, 0], [1, 1], [0, 1]);
export const diagonalBottomLeft = createPathGeometry([0, 1], [1, 1], [0, 0]);
export const diagonalTopLeft = createPathGeometry([0, 0], [0, 1], [1, 0]);
export const diagonalTopRight = createPathGeometry([1, 0], [1, 1], [0, 0]);
export const diagonalBottomRight = createPathGeometry([0, 1], [1, 0], [1, 1]);

function createPathGeometry(...points) {
	var shape = new THREE.Shape();
	points.forEach(([x, y]) => shape.moveTo(x, y));

	var geometry = shape.extrude({ amount: 1, bevelEnabled: false });
	geometry.translate(-0.5, -0.5, -0.5);

	return geometry;
}
