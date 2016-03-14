import * as THREE from 'three';

export const ball = {
	enabled: true,
	velocityCoefficient: 0.1,
	rotationCoefficient: 0.015,
	geometry: {
		detail: 1,
		radius: 17
	},
	materials: {
		default: {
			shading: THREE.FlatShading
		},
		blue: { },
		red: { }
	},
	outline: {
		enabled: true,
		detail: 2,
		radius: 19
	},
	outlineMaterials: {
		default: {
			side: THREE.BackSide
		},
		blue: { },
		red: { }
	}
};

export const puck = {
	enabled: true,
	rotationCoefficient: 0.01,
	geometries: {
		circle: {
			height: 10,
			radius: 17,
			segments: 32
		},
		cylinder: {
			height: 10,
			radiusTop: 17,
			radiusBottom: 19,
			segments: 32
		}
	},
	materials: {
		circle: {
			default: {
				transparent: true,
				alphaTest: 0.1,
				opacity: 0.9,
				shading: THREE.FlatShading
			},
			blue: { },
			red: { }
		},
		cylinder: {
			default: {
				transparent: true,
				opacity: 0.9,
				shading: THREE.FlatShading
			},
			blue: { },
			red: { }
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
	},
	topWallTile: {
		x: 5.5,
		y: 5.5
	},
	sideWallTile: {
		x: 5.5,
		y: 5.5
	}
};

export const spike = {
	geometry: {
		width: 32,
		segments: 6,
	},
	material: {
		// color: 0x666666,
		opacity: 1
	}
};

export const bomb = {
	materials: {
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
		height: 40
	},
	materials: {
		default: {
			transparent: true,
			side: THREE.DoubleSide,
			opacity: 0.3
		},
		off: { },
		green: { },
		red: { },
		blue: { }
	},
	outlineMaterials: {
		default: { },
		off: { },
		green: { },
		red: { },
		blue: { },
	}
};

export const tile = {
	material: {
		transparent: true,
	}
};

export const animatedTile = {
	material: {
		transparent: true
	}
};
