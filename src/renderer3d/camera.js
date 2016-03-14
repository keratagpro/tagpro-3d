import * as THREE from 'three';

const RAD = 180 / Math.PI;

export function createCamera({ fov = 75, aspect = 1280/800, near, far, distance }) {
	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.y = distance;
	camera.up.set(0, 0, -1);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	return camera;
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
