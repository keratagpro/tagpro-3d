import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';

import * as geometries from './geometries';
import * as utils from './utils';
import * as debug from '../utils/debug';
import { wall } from '../options/objects';

const WALL = 1;
const BL = 1.1; // ◣ bottom left
const TL = 1.2; // ◤ top left
const TR = 1.3; // ◥ top right
const BR = 1.4; // ◢ bottom right

export function createWalls(map, params = wall) {
	var cols = tiles.image.width / TILE_SIZE;
	var rows = tiles.image.height / TILE_SIZE;

	var topWallTexture = new THREE.Texture(tiles.image);
	setTextureOffset(topWallTexture, cols, rows, params.tiles.top);

	var sideWallTexture = new THREE.Texture(tiles.image);
	setTextureOffset(sideWallTexture, cols, rows, params.tiles.side);

	var geom = createGeometryFromTilemap(map);

	var mat = new THREE.MultiMaterial([
		new THREE.MeshPhongMaterial(Object.assign({ map: topWallTexture }, params.materials.top)),
		new THREE.MeshPhongMaterial(Object.assign({ map: sideWallTexture }, params.materials.side)),
	]);

	var mesh = new THREE.Mesh(geom, mat);

	mesh.rotation.x = Math.PI / 2;
	mesh.position.y = TILE_SIZE / 2;
	mesh.scale.set(TILE_SIZE, TILE_SIZE, TILE_SIZE);
	this.scene.add(mesh);

	var edges = new THREE.EdgesHelper(mesh, 0x000000);
	this.scene.add(edges);
}

function setTextureOffset(texture, cols, rows, tile) {
	var x = tile.x / cols;
	var y = 1 - (tile.y / rows);
	var w = (tile.width || 1) / cols;
	var h = (tile.height || 1) / rows;

	texture.offset.set(x, y);
	texture.repeat.set(w, -h);
	texture.needsUpdate = true;
}

function createGeometryFromTilemap(map) {
	var geometry = new THREE.Geometry();

	debug.time('creating wall geometry');
	map.forEach((columns, x) => {
		columns.forEach((tile, y) => {
			var geom;
			switch(tile) {
			case WALL: geom = geometries.square; break;
			case BL: geom = geometries.diagonalBottomLeft; break;
			case TL: geom = geometries.diagonalTopLeft; break;
			case TR: geom = geometries.diagonalTopRight; break;
			case BR: geom = geometries.diagonalBottomRight; break;
			default: return;
			}

			geom = geom.clone();
			geom.translate(x, y, 0);
			geometry.merge(geom);
		});
	});
	debug.timeEnd('creating wall geometry');

	debug.time('merging wall geometry vertices');
	geometry.mergeVertices();
	debug.timeEnd('merging wall geometry vertices');

	debug.time('removing wall geometry inner faces');
	utils.removeInnerFaces(geometry);
	debug.timeEnd('removing wall geometry inner faces');

	return geometry;
}