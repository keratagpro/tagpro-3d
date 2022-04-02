import * as THREE from 'three';

export function addAmbientLight(scene: THREE.Scene, { color = 0xffffff } = {}) {
	const light = new THREE.AmbientLight(color);
	scene.add(light);
	return light;
}

export function addCameraLight(
	camera: THREE.PerspectiveCamera,
	{ color = 0xffffff, intensity = 1, distance = 0, decay = 0 } = {}
) {
	const light = new THREE.PointLight(color, intensity, distance, decay);
	camera.add(light);
	return light;
}

interface LightOptions {
	color?: number;
	intensity?: number;
	position?: [number, number, number];
}

export function addDirectionalLight(
	scene: THREE.Scene,
	{ color = 0xffffff, intensity = 1.0, position = [500, -500, 400] }: LightOptions = {}
) {
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(...position);
	scene.add(light);
	return light;
}

export function addLights(lights: any[], scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
	lights.forEach((light) => {
		if (!light.enabled) return;

		if (light.type === 'camera') {
			addCameraLight(camera, light);
		} else if (light.type === 'ambient') {
			addAmbientLight(scene, light);
		} else if (light.type === 'directional') {
			addDirectionalLight(scene, light);
		}
	});
}
