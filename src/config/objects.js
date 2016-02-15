
export const ball = {
	isPuck: false,
	hasOutline: true,
	velocityCoefficient: 0.1,
	rotationCoefficient: 0.015,
	sphere: {
		radius: 18,
		widthSegments: 16,
		heightSegments: 12
	},
	puck: {
		radius: 18,
		extrude: {
			amount: 10,
			bevelEnabled: true,
			bevelSegments: 2,
			bevelSize: 6,
			bevelThickness: 10,
		}
	},
	outline: {
		radius: 19
	},
};

export const button = {
	width: 16,
	height: 10,
	segments: 20
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
	width: 40,
	extrude: {
		amount: 40,
		bevelEnabled: true,
		bevelSegments: 1,
		bevelSize: 6,
		bevelThickness: 10,
	}
};

export const spike = {
	width: 32,
	segments: 6,
};

export const wall = {
	extrude: {
		amount: 60,
		steps: 1,
		bevelEnabled: true,
		bevelSegments: 1,
		bevelSize: 6,
		bevelThickness: 10,
	}
};
