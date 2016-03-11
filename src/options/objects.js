import * as THREE from 'three';
// import { extend } from 'jquery';

import { textureLoader as loader } from '../tagpro3d/utils';

export const ball = {
	enabled: true,
	velocityCoefficient: 0.1,
	rotationCoefficient: 0.015,
	geometry: {
		radius: 19,
		detail: 1
	},
	materials: {
		blue: {
			shading: THREE.FlatShading,
			color: 0x0000ff
		},
		red: {
			shading: THREE.FlatShading,
			color: 0xff0000
		}
	},
	outline: {
		enabled: true,
		detail: 2,
		width: 1,
		blue: {
			color: 0x0000bb
		},
		red: {
			color: 0xbb0000
		}
	}
};

export const puck = {
	enabled: true,
	rotationCoefficient: 0.01,
	geometry: {
		radius: 19,
		height: 10,
		segments: 32
	},
	materials: {
		default: {
			transparent: true,
			alphaTest: 0.1,
			opacity: 0.9,
			shading: THREE.FlatShading,
			side: THREE.DoubleSide
		},
		blue: {
			color: 0x0000ff,
		},
		red: {
			color: 0xff0000,
		}
	}
};

export const wall = {
	material: {
		shading: THREE.FlatShading,
		color: 0xffffff,
		// opacity: 1.0,
		// transparent: true
	},
	extrude: {
		amount: 40,
		steps: 1,
		bevelEnabled: false,
		bevelSegments: 1,
		bevelSize: 5,
		bevelThickness: 10,
	}
};

export const spike = {
	geometry: {
		width: 32,
		segments: 6,
	},
	material: {
		color: 0x666666,
		opacity: 1
	}
};

export const bomb = {
	material: {
		body: {
			color: 0x000000
		},
		show: {
			transparent: false,
			opacity: 1.0
		},
		hide: {
			transparent: true,
			opacity: 0.2
		}
	}
};

export const button = {
	geometry: {
		width: 16,
		height: 10,
		segments: 20
	},
	material: {
		color: 0xa06e32,
	}
};

export const flag = {
	animate: false,
	width: 40,
	height: 20,
	waveDepth: 4,
	widthSegments: 10,
	heightSegments: 5,
	restDistance: 4
};

export const gate = {
	geometry: {
		width: 40,
	},
	material: {
		outline: {
			color: 0x333333,
		},
		off: {
			transparent: true,
			color: 0x000000,
			opacity: 0.0,
		},
		blue: {
			color: 0x0000ff,
			opacity: 0.7,
		},
		green: {
			color: 0x00ff00,
			opacity: 0.7,
		},
		red: {
			color: 0xff0000,
			opacity: 0.7,
		}
	},
	extrude: {
		amount: 40,
		bevelEnabled: true,
		bevelSegments: 1,
		bevelSize: 6,
		bevelThickness: 10,
	}
};
