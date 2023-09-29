import * as THREE from 'three';

export type TileParams = {
	x: number;
	y: number;
	width?: number;
	height?: number;
};

export interface WallOptions {
	useDominantColorFromTexture: boolean;
	useTexture: boolean;
	materials: {
		top: THREE.MeshPhongMaterialParameters;
		side: THREE.MeshPhongMaterialParameters;
	};
	extrude: THREE.ExtrudeGeometryOptions;
	tiles: {
		top: TileParams;
		side: TileParams;
	};
}

export const wallOptions: WallOptions = {
	useDominantColorFromTexture: true,
	useTexture: false,
	materials: {
		top: {
			color: 0x666666,
			opacity: 0.9,
			flatShading: true,
			transparent: true,
		},
		side: {
			color: 0x666666,
			opacity: 0.9,
			flatShading: true,
			transparent: true,
		},
	},
	extrude: {
		depth: 80,
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
