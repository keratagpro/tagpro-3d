import * as THREE from 'three';

export interface PuckOptions {
	useOriginalTexture: boolean;
	rotationCoefficient: number;
	geometry: {
		height: number;
		radiusTop: number;
		radiusBottom: number;
		segments: number;
	};
	materials: {
		top: {
			default: THREE.MeshPhongMaterialParameters;
			red: THREE.MeshPhongMaterialParameters;
			blue: THREE.MeshPhongMaterialParameters;
		};
		side: {
			default: THREE.MeshPhongMaterialParameters;
			red: THREE.MeshPhongMaterialParameters;
			blue: THREE.MeshPhongMaterialParameters;
		};
	};
}

export const puckOptions: PuckOptions = {
	useOriginalTexture: true,
	rotationCoefficient: 0.01,
	geometry: {
		height: 10,
		radiusTop: 17,
		radiusBottom: 19,
		segments: 32,
	},
	materials: {
		top: {
			default: {
				color: 0x666666,
				side: THREE.DoubleSide,
				// transparent: true,
				// opacity: 0.9,
			},
			blue: {
				color: 0x00ffff,
			},
			red: {
				color: 0xffff00,
			},
		},
		side: {
			default: {
				color: 0x666666,
				side: THREE.DoubleSide,
				// transparent: true,
				// opacity: 0.9,
			},
			blue: {
				color: 0x0000ff,
			},
			red: {
				color: 0xff0000,
			},
		},
	},
};
