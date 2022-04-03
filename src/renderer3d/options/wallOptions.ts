import * as THREE from 'three';

export interface WallOptions {
	materials: {
		top: THREE.MeshPhongMaterialParameters;
		side: THREE.MeshPhongMaterialParameters;
	};
	extrude: THREE.ExtrudeGeometryOptions;
	tiles: any;
}

export const wallOptions: WallOptions = {
	materials: {
		top: {
			color: 0x333333,
			opacity: 0.9,
			flatShading: true,
			transparent: true,
		},
		side: {
			color: 0x333333,
			opacity: 0.9,
			flatShading: true,
			transparent: true,
		},
	},
	extrude: {
		depth: 40,
		steps: 1,
		bevelEnabled: false,
		bevelSegments: 1,
		bevelSize: 5,
		bevelThickness: 10,
		bevelOffset: -5,
	},
	tiles: {
		top: {
			x: 5.5,
			y: 5.5,
		},
		side: {
			x: 5.5,
			y: 5.5,
		},
	},
};
