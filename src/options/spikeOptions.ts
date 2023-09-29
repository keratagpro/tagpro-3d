import * as THREE from 'three';

export interface SpikeOptions {
	geometry: {
		width: number;
		segments: number;
	};
	material: THREE.MeshPhongMaterialParameters;
}

export const spikeOptions: SpikeOptions = {
	geometry: {
		width: 32,
		segments: 6,
	},
	material: {
		// color: 0x666666,
		opacity: 1,
	},
};
