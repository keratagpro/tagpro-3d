import $ from 'jquery';
import * as THREE from 'three';

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
	console.log(camera.position);
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
	camera.position.x = x - 19;
	camera.position.z = y - 19;
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
