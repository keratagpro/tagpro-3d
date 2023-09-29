import * as THREE from 'three';

export const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('');

export const objectLoader = new THREE.ObjectLoader();

export function loadObjectFromJson(json: unknown) {
	const mesh = objectLoader.parse(json);
	return mesh;
}
