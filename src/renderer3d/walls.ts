import { TILE_SIZE } from 'tagpro';
import * as THREE from 'three';

import { WallOptions } from './options/wallOptions';
// import { getTilesTexture } from './utils';

const WALL = 1;
const BL = 1.1; // ◣ bottom left
const TL = 1.2; // ◤ top left
const TR = 1.3; // ◥ top right
const BR = 1.4; // ◢ bottom right

function pointsToShape({
	points,
	offset = 0,
	scale = 1,
}: {
	points: [number, number][];
	offset?: number;
	scale?: number;
}) {
	return new THREE.Shape(points.map(([x, y]) => new THREE.Vector2((x + offset) * scale, (y + offset) * scale)));
}

const squareShape = pointsToShape({
	points: [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	],
	offset: -0.5,
	scale: TILE_SIZE,
});
const diagonalShape = pointsToShape({
	points: [
		[0, 1],
		[1, 1],
		[0, 0],
	],
	offset: -0.5,
	scale: TILE_SIZE,
});

function extractWallTiles(map: TagPro.Map) {
	const squares: { x: number; y: number }[] = [];
	const diagonals: { x: number; y: number; angle: number }[] = [];

	for (let y = 0, rows = map.length; y < rows; y++) {
		const row = map[y];
		for (let x = 0, cols = row.length; x < cols; x++) {
			const tile = row[x];
			switch (tile) {
				case WALL:
					squares.push({ x, y });
					break;
				case TR:
					diagonals.push({ x, y, angle: 0 });
					break;
				case TL:
					diagonals.push({ x, y, angle: 90 });
					break;
				case BL:
					diagonals.push({ x, y, angle: 180 });
					break;
				case BR:
					diagonals.push({ x, y, angle: 270 });
					break;
			}
		}
	}

	return { squares, diagonals };
}

export function createWalls(map: TagPro.Map, options: WallOptions) {
	// const cols = tiles.image.width / TILE_SIZE;
	// const rows = tiles.image.height / TILE_SIZE;

	// const topWallTexture = getTilesTexture();
	// setTextureOffset(topWallTexture, cols, rows, options.tiles.top);

	// const sideWallTexture = getTilesTexture();
	// setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);

	const wallMaterials = [
		new THREE.MeshPhongMaterial({ ...options.materials.top }),
		new THREE.MeshPhongMaterial({ ...options.materials.side }),
	];

	const { squares, diagonals } = extractWallTiles(map);

	const squareGeometry = new THREE.ExtrudeGeometry(squareShape, options.extrude);
	const squareMesh = new THREE.InstancedMesh(squareGeometry, wallMaterials, squares.length);
	squareMesh.name = 'walls-squares';
	for (let i = 0; i < squares.length; i++) {
		const square = squares[i];
		const matrix = new THREE.Matrix4();
		matrix.setPosition(square.x * TILE_SIZE, square.y * TILE_SIZE, 0);
		squareMesh.setMatrixAt(i, matrix);
	}

	const scale = new THREE.Vector3(1, 1, 1);

	const diagonalGeometry = new THREE.ExtrudeGeometry(diagonalShape, options.extrude);
	const diagonalMesh = new THREE.InstancedMesh(diagonalGeometry, wallMaterials, diagonals.length);
	diagonalMesh.name = 'walls-diagonals';
	for (let i = 0; i < diagonals.length; i++) {
		const diagonal = diagonals[i];
		const matrix = new THREE.Matrix4();

		const pos = new THREE.Vector3(diagonal.x * TILE_SIZE, diagonal.y * TILE_SIZE, 0);

		const rot = new THREE.Euler();
		rot.z = THREE.MathUtils.degToRad(diagonal.angle);
		const quaternion = new THREE.Quaternion();
		quaternion.setFromEuler(rot);

		matrix.compose(pos, quaternion, scale);

		diagonalMesh.setMatrixAt(i, matrix);
	}

	const wallObject = new THREE.Object3D();
	wallObject.name = 'walls';
	wallObject.add(squareMesh, diagonalMesh);

	wallObject.rotation.set(Math.PI * 1.5, 0, Math.PI * 1.5);

	return wallObject;
}

// function setTextureOffset(texture, cols, rows, tile) {
// 	const x = tile.x / cols;
// 	const y = 1 - tile.y / rows;
// 	const w = (tile.width || 1) / cols;
// 	const h = (tile.height || 1) / rows;

// 	texture.offset.set(x, y);
// 	texture.repeat.set(w, -h);
// 	texture.needsUpdate = true;
// }
