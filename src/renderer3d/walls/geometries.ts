import * as THREE from 'three';

function createPathGeometry(...points: [number, number][]) {
	const shape = new THREE.Shape();
	points.forEach(([x, y]) => shape.moveTo(x, y));

	const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
	geometry.translate(-0.5, -0.5, -0.5);

	return geometry;
}

export const geometries = {
	square: createPathGeometry([0, 0], [1, 0], [1, 1], [0, 1]),
	diagonalBottomLeft: createPathGeometry([0, 1], [1, 1], [0, 0]),
	diagonalTopLeft: createPathGeometry([0, 0], [0, 1], [1, 0]),
	diagonalTopRight: createPathGeometry([1, 0], [1, 1], [0, 0]),
	diagonalBottomRight: createPathGeometry([0, 1], [1, 0], [1, 1]),
};
