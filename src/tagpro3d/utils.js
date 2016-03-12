import $ from 'jquery';
import * as THREE from 'three';
import { TILE_SIZE, tiles } from 'tagpro';
import RgbQuant from 'rgbquant';

import SpriteTexture from '../lib/sprite_texture';

export const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('');

export const objectLoader = new THREE.ObjectLoader();

const RAD = 180 / Math.PI;

export function createRenderer(params) {
	var renderer = new THREE.WebGLRenderer(params);

	renderer.domElement.id = 'tagpro3d';
	document.body.appendChild(renderer.domElement);

	return renderer;
}

export function createCamera({ fov = 75, aspect = 1280/800, near, far, distance }) {
	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.y = distance;
	camera.up.set(0, 0, -1);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	return camera;
}

export function createScene() {
	var scene = new THREE.Scene();
	return scene;
}

export function resizeCanvas(renderer, gameCanvas) {
	$(renderer.domElement).css({
		left: gameCanvas.offsetLeft,
		top: gameCanvas.offsetTop,
		width: null,
		height: null
	}).attr({
		width: gameCanvas.width,
		height: gameCanvas.height
	});

	renderer.setSize(gameCanvas.width, gameCanvas.height);
}

export function updateCameraFOV(camera, gameCanvas) {
	camera.aspect = gameCanvas.width / gameCanvas.height;
	camera.fov = 2 * Math.atan(gameCanvas.height / (camera.position.y * 2)) * RAD;
	camera.updateProjectionMatrix();
}

export function updateCameraPosition(camera, x, y) {
	camera.position.x = x - 20;
	camera.position.z = y - 20;
}

export function updateCameraZoom(camera, zoom) {
	camera.zoom = 1 / zoom;
	camera.updateProjectionMatrix();
}

// TODO: Use single PlaneGeometry with faceVertexUvs.
export function createBackgroundPlaneFromChunks(chunks) {
	var plane = new THREE.Object3D();
	plane.position.x = -19;
	plane.position.z = -19;

	var geometry;
	chunks.forEach(({ x, y, width, height, texture }) => {
		if (!geometry) {
			geometry = new THREE.PlaneGeometry(width, height, 1, 1);
			geometry.rotateX(-Math.PI / 2);
			geometry.translate(width / 2, 0, height / 2);
		}
		else {
			geometry = geometry.clone();
		}

		var material = new THREE.MeshPhongMaterial({
			map: new THREE.CanvasTexture(texture.baseTexture.source)
		});

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = x;
		mesh.position.z = y;

		plane.add(mesh);
	});

	return plane;
}

export function mapBackgroundChunksToTextures(chunks) {
	return chunks.map(({ x, y, width, height, texture }) => ({
		x, y, width, height,
		texture: new THREE.CanvasTexture(texture.baseTexture.source)
	}));
}

export function loadObjectFromJson(json) {
	var mesh = objectLoader.parse(json);
	// mesh.rotateZ(Math.PI);
	return mesh;
}

export function findDominantColorForTile(tile, tileSize = TILE_SIZE) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	canvas.width = tileSize;
	canvas.height = tileSize;

	context.drawImage(tiles.image,
		tile.x * tileSize, tile.y * tileSize, tileSize, tileSize,
		0, 0, tileSize, tileSize);

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

var _tileTexture;
export function getTileTexture() {
	if (!_tileTexture) {
		_tileTexture = createTexture(tiles.image);
		return _tileTexture;
	}

	return _tileTexture.clone();
}

function createTexture(image) {
	var canvas = document.createElement('canvas');
	canvas.width = closestPowerOfTwo(image.width);
	canvas.height = closestPowerOfTwo(image.height);

	var context = canvas.getContext('2d');
	context.drawImage(image, 0, 0, canvas.width, canvas.height);

	return new SpriteTexture(canvas);
}

function closestPowerOfTwo(num) {
	return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
}