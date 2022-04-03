import * as THREE from 'three';

export interface PuckOptions {
	enabled: boolean;
	rotationCoefficient: number;
	geometries: {
		circle: {
			radius: number;
			segments: number;
		};
		cylinder: {
			height: number;
			radiusTop: number;
			radiusBottom: number;
			segments: number;
		};
	};
	materials: {
		circle: {
			default: THREE.MeshPhongMaterialParameters;
			red: THREE.MeshPhongMaterialParameters;
			blue: THREE.MeshPhongMaterialParameters;
		};
		cylinder: {
			default: THREE.MeshPhongMaterialParameters;
			red: THREE.MeshPhongMaterialParameters;
			blue: THREE.MeshPhongMaterialParameters;
		};
	};
}

export const puckOptions: PuckOptions = {
	enabled: true,
	rotationCoefficient: 0.01,
	geometries: {
		circle: {
			radius: 19,
			segments: 32,
		},
		cylinder: {
			height: 10,
			radiusTop: 19,
			radiusBottom: 19,
			segments: 32,
		},
	},
	materials: {
		circle: {
			default: {
				transparent: true,
				alphaTest: 0.1,
				opacity: 0.9,
				flatShading: true,
			},
			blue: {},
			red: {},
		},
		cylinder: {
			default: {
				transparent: true,
				opacity: 0.9,
				flatShading: true,
				side: THREE.DoubleSide,
			},
			blue: {},
			red: {},
		},
	},
};
