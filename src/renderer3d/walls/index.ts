import { TILE_SIZE, tiles } from 'tagpro';
import * as THREE from 'three';

import { Renderer3D } from '..';
import { wallOptions } from '../options/objects';
// import { getTilesTexture } from '../utils';
import * as debug from '../utils/debug';
import { geometries } from './geometries';

const WALL = 1;
const BL = 1.1; // ◣ bottom left
const TL = 1.2; // ◤ top left
const TR = 1.3; // ◥ top right
const BR = 1.4; // ◢ bottom right

export function createWalls(this: Renderer3D, map: TagPro.Map, options = wallOptions) {
	const squares = [];
	const diagonals = [];

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

	const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

	const squareMesh = new THREE.InstancedMesh(geometries.square, wallMaterial, squares.length);
	squareMesh.name = 'wall-squares';
	for (let i = 0; i < squares.length; i++) {
		const square = squares[i];
		const matrix = new THREE.Matrix4();
		matrix.setPosition(square.x, 0, square.y);
		squareMesh.setMatrixAt(i, matrix);
	}

	const diagonalMesh = new THREE.InstancedMesh(geometries.diagonalBottomLeft, wallMaterial, diagonals.length);
	diagonalMesh.name = 'wall-diagonals';
	for (let i = 0; i < diagonals.length; i++) {
		const diagonal = diagonals[i];
		const matrix = new THREE.Matrix4();

		const pos = new THREE.Vector3(diagonal.x, 0, diagonal.y);

		const rot = new THREE.Euler();
		rot.z = THREE.MathUtils.degToRad(diagonal.angle);
		const quaternion = new THREE.Quaternion();
		quaternion.setFromEuler(rot);

		matrix.compose(pos, quaternion, new THREE.Vector3(1, 1, 1));

		diagonalMesh.setMatrixAt(i, matrix);
	}

	const wallObject = new THREE.Object3D();
	wallObject.add(squareMesh, diagonalMesh);

	wallObject.rotation.x = Math.PI / 2;
	wallObject.position.y = TILE_SIZE / 2;
	wallObject.scale.set(TILE_SIZE, TILE_SIZE, TILE_SIZE);

	this.scene.add(wallObject);

	(window as any).wallObject = wallObject;

	console.log(wallObject);
}

// export function createWalls(this: Renderer3D, map: TagPro.Map, options = wallOptions) {
// 	// const cols = tiles.image.width / TILE_SIZE;
// 	// const rows = tiles.image.height / TILE_SIZE;

// 	// const topWallTexture = getTilesTexture();
// 	// setTextureOffset(topWallTexture, cols, rows, options.tiles.top);

// 	// const sideWallTexture = getTilesTexture();
// 	// setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);

// 	const geom = createGeometryFromTilemap(map);

// 	const mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0xff0000 }));

// 	// const mesh = new THREE.Mesh(geom, [
// 	// 	new THREE.MeshPhongMaterial(Object.assign({ map: topWallTexture }, options.materials.top)),
// 	// 	new THREE.MeshPhongMaterial(Object.assign({ map: sideWallTexture }, options.materials.side)),
// 	// ]);

// 	mesh.rotation.x = Math.PI / 2;
// 	mesh.position.y = TILE_SIZE / 2;
// 	mesh.scale.set(TILE_SIZE, TILE_SIZE, TILE_SIZE);
// 	this.scene.add(mesh);

// 	const edgesGeometry = new THREE.EdgesGeometry(geom);
// 	const lines = new THREE.LineSegments(edgesGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
// 	this.scene.add(lines);
// 	// const edges = new THREE.EdgesHelper(mesh, 0x000000);
// 	// this.scene.add(edges);
// }

// function setTextureOffset(texture, cols, rows, tile) {
// 	const x = tile.x / cols;
// 	const y = 1 - tile.y / rows;
// 	const w = (tile.width || 1) / cols;
// 	const h = (tile.height || 1) / rows;

// 	texture.offset.set(x, y);
// 	texture.repeat.set(w, -h);
// 	texture.needsUpdate = true;
// }
