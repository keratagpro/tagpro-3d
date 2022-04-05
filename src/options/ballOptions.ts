import * as THREE from 'three';

export interface BallOptions {
	useDominantColorFromTexture: boolean;
	velocityCoefficient: number;
	rotationCoefficient: number;
	geometry: {
		detail: number;
		radius: number;
	};
	materials: {
		default: THREE.MeshPhongMaterialParameters;
		red: THREE.MeshPhongMaterialParameters;
		blue: THREE.MeshPhongMaterialParameters;
	};
	outline: {
		enabled: boolean;
		detail: number;
		radius: number;
	};
	outlineMaterials: {
		default: THREE.MeshBasicMaterialParameters;
		red: THREE.MeshBasicMaterialParameters;
		blue: THREE.MeshBasicMaterialParameters;
	};
}

export const ballOptions: BallOptions = {
	useDominantColorFromTexture: true,
	velocityCoefficient: 0.1,
	rotationCoefficient: 0.015,
	geometry: {
		detail: 1,
		radius: 17,
	},
	materials: {
		default: {
			flatShading: true,
		},
		blue: {
			color: 0x0000ff,
		},
		red: {
			color: 0xff0000,
		},
	},
	outline: {
		enabled: true,
		detail: 2,
		radius: 19,
	},
	outlineMaterials: {
		default: {
			side: THREE.BackSide,
		},
		blue: {},
		red: {},
	},
};
