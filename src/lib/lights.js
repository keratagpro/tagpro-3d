import * as THREE from 'three';

export function addAmbientLight(scene, {
	color = 0xffffff
} = {}) {
	var light = new THREE.AmbientLight(color);
	scene.add(light);
	return light;
}

export function addCameraLight(camera, {
	color = 0xffffff,
	intensity = 1,
	distance = 0,
	decay = 0
} = {}) {
	var light = new THREE.PointLight(color, intensity, distance, decay);
	camera.add(light);
	return light;
}

export function addDirectionalLight(scene, {
	color = 0xffffff,
	intensity = 1.0,
	position = [500, -500, 400]
} = {}) {
	var light = new THREE.DirectionalLight(color, intensity);
	light.position.set.apply(light.position, position);
	scene.add(light);
	return light;
}

export function addLights(lights, scene, camera) {
	lights.forEach(light => {
		if (!light.enabled) return;

		if (light.type === 'camera') {
			addCameraLight(camera, light);
		}
		else if (light.type === 'ambient') {
			addAmbientLight(scene, light);
		}
		else if (light.type === 'directional') {
			addDirectionalLight(scene, light);
		}
	});
}