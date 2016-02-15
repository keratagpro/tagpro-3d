import pick from 'lodash-es/pick';
import * as THREE from 'three';

import defaults from '../config/defaults';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 800;
const ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;
const RAD = 180 / Math.PI;
const materialProperties = ['color', 'specular', 'shininess', 'opacity', 'map', 'shading', 'blending', 'wireframe', 'depthTest', 'depthWrite', 'side', 'transparent'];

const loader = new THREE.ObjectLoader();

export function loadObjectFromJson(json) {
	var mesh = loader.parse(json);
	mesh.rotateX(Math.PI / 2);
	return mesh;
}

export function createMaterial(params) {
	var Material = params.shiny ? THREE.MeshPhongMaterial : THREE.MeshLambertMaterial;
	return new Material(pick(params, materialProperties));
}

export function createRenderer({
	alpha = true,
	antialias = true
} = {}) {
	var renderer = new THREE.WebGLRenderer({
		alpha,
		antialias
	});

	document.body.appendChild(renderer.domElement);
	renderer.domElement.id = 'tagpro3d';

	return renderer;
}

export function createScene() {
	var scene = new THREE.Scene();
	return scene;
}

export function createCamera({
	aspect = 1280 / 800,
	fov = 75,
	near = 10,
	far = 10000,
	distance = 1000
} = {}) {
	var camera = new THREE.PerspectiveCamera(fov, ASPECT_RATIO, near, far);

	camera.position.z = distance;

	return camera;
}

export function updateCameraFOV(camera, canvasHeight) {
	camera.fov = 2 * Math.atan(canvasHeight / (camera.position.z * 2)) * RAD;
	camera.updateProjectionMatrix();
}

export function createRectangle(width = defaults.tileSize) {
	var half = width / 2;

	var shape = new THREE.Shape();
	shape.moveTo(-half, -half);
	shape.lineTo(half, -half);
	shape.lineTo(half, half);
	shape.lineTo(-half, half);

	return shape;
}

export function createCircle(radius = defaults.tileSize / 2) {
	var shape = new THREE.Shape();

	shape.moveTo(radius, 0);
	shape.absarc(0, 0, radius, 0, 2 * Math.PI, false);

	return shape;
}

export function createRectangleGeometry(width = defaults.tileSize, extrude = {}) {
	var shape = createRectangle(width);

	var geometry = shape.extrude(extrude);
	// geometry.translate(0, 0, -extrude.amount);

	if (extrude.bevelEnabled) {
		var xy = 1 / ((width + extrude.bevelSize * 2) / width);
		geometry.scale(xy, xy, 1);
	}

	return geometry;
}

export function createPuckGeometry({
	radius = defaults.tileSize,
	extrude = {}
} = {}) {
	var shape = createCircle(radius);

	var geometry = shape.extrude(extrude);
	geometry.translate(0, 0, -extrude.amount);

	if (extrude.bevelEnabled) {
		var width = radius * 2;
		var xy = 1 / ((width + extrude.bevelSize * 2) / width);
		geometry.scale(xy, xy, 1);
	}

	return geometry;
}

export function createSphereGeometry({
	radius = defaults.tileSize,
	widthSegments = 16,
	heightSegments = 12
} = {}) {
	var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

	return geometry;
}

export function createCylinderGeometry({
	radiusTop = 10,
	radiusBottom = 10,
	height = defaults.tileSize,
	segments = 16
} = {}) {
	var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);

	geometry.translate(0, 0, -height / 2);

	return geometry;
}

export function createClothGeometry({
	width = defaults.tileSize,
	height = defaults.tileSize / 2,
	widthSegments = defaults.tileSize / 4,
	heightSegments = defaults.tileSize / 8,
	waveDepth = defaults.tileSize / 4
}) {
	var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
	geometry.translate(width / 2, height / 2, 0);

	for (var col = 0; col <= widthSegments; col++) {
		let z = Math.sin((col / widthSegments) * Math.PI * 2) * waveDepth;
		for (var row = 0; row <= heightSegments; row++) {
			geometry.vertices[row * (widthSegments + 1) + col].z = z;
		}
	}

	geometry.rotateX(Math.PI);

	return geometry;
}
