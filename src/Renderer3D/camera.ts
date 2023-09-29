import * as THREE from 'three';

const RAD = 180 / Math.PI;

export interface CameraOptions {
	fov?: number;
	aspect?: number;
	near?: number;
	far?: number;
	distance: number;
}

export function createCamera({ fov = 75, aspect = 1280 / 800, near, far, distance }: CameraOptions) {
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.y = distance;
	camera.up.set(0, 0, -1);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	return camera;
}

export function updateCameraFOV(camera: THREE.PerspectiveCamera, gameCanvas: HTMLCanvasElement) {
	camera.aspect = gameCanvas.width / gameCanvas.height;
	camera.fov = 2 * Math.atan(gameCanvas.height / (camera.position.y * 2)) * RAD;
	camera.updateProjectionMatrix();
}

export function updateCameraPosition(camera: THREE.PerspectiveCamera, x: number, y: number) {
	camera.position.x = x - 19;
	camera.position.z = y - 19;
}

export function updateCameraZoom(camera: THREE.PerspectiveCamera, zoom: number) {
	camera.zoom = 1 / zoom;
	camera.updateProjectionMatrix();
}
