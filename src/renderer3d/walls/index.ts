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
	// const cols = tiles.image.width / TILE_SIZE;
	// const rows = tiles.image.height / TILE_SIZE;

	// const topWallTexture = getTilesTexture();
	// setTextureOffset(topWallTexture, cols, rows, options.tiles.top);

	// const sideWallTexture = getTilesTexture();
	// setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);

	const geom = createGeometryFromTilemap(map);

	const mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0xff0000 }));

	// const mesh = new THREE.Mesh(geom, [
	// 	new THREE.MeshPhongMaterial(Object.assign({ map: topWallTexture }, options.materials.top)),
	// 	new THREE.MeshPhongMaterial(Object.assign({ map: sideWallTexture }, options.materials.side)),
	// ]);

	mesh.rotation.x = Math.PI / 2;
	mesh.position.y = TILE_SIZE / 2;
	mesh.scale.set(TILE_SIZE, TILE_SIZE, TILE_SIZE);
	this.scene.add(mesh);

	// const edges = new THREE.EdgesHelper(mesh, 0x000000);
	// this.scene.add(edges);
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

function createGeometryFromTilemap(tagproMap: TagPro.Map) {
	const tileGeometries: THREE.BufferGeometry[] = [];

	debug.time('creating wall geometry');
	tagproMap.forEach((columns, x) => {
		columns.forEach((tile, y) => {
			let tileGeometry: THREE.BufferGeometry;

			switch (tile) {
				case WALL:
					tileGeometry = geometries.square;
					break;
				case BL:
					tileGeometry = geometries.diagonalBottomLeft;
					break;
				case TL:
					tileGeometry = geometries.diagonalTopLeft;
					break;
				case TR:
					tileGeometry = geometries.diagonalTopRight;
					break;
				case BR:
					tileGeometry = geometries.diagonalBottomRight;
					break;
				default:
					return;
			}

			tileGeometry = tileGeometry.clone();
			tileGeometry.translate(x, y, 0);
			tileGeometries.push(tileGeometry);
		});
	});
	debug.timeEnd('creating wall geometry');

	debug.time('merging wall geometry vertices');
	const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(tileGeometries);
	debug.timeEnd('merging wall geometry vertices');

	return geometry;
}
