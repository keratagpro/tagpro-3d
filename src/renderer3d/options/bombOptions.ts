import * as THREE from 'three';

export interface BombOptions {
	materials: {
		body: THREE.MeshPhongMaterialParameters;
		show: THREE.MeshPhongMaterialParameters;
		hide: THREE.MeshPhongMaterialParameters;
	};
}

export const bombOptions: BombOptions = {
	materials: {
		body: {
			color: 0x000000,
		},
		show: {
			transparent: false,
			opacity: 1.0,
		},
		hide: {
			transparent: true,
			opacity: 0.2,
		},
	},
};
