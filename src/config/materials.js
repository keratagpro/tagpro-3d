import * as THREE from 'three';

const assign = Object.assign;

var loader = new THREE.TextureLoader();
loader.setCrossOrigin('');

export const ball = {
	default: {
		shiny: true,
		map: loader.load('https://keratagpro.github.io/tagpro-balls-3d/textures/misc/tile.png'),
		side: THREE.DoubleSide,
	},
	outline: {
		color: 0x000000,
		side: THREE.BackSide
	},
	red: {
		color: 0xff0000
	},
	blue: {
		color: 0x0000ff
	}
};

export const bomb = {
	default: {
		color: 0x000000
	},
	visible: {
		visible: true
	},
	hidden: {
		visible: false
	}
};

export const button = {
	shiny: true,
	color: 0xa06e32,
};

var cloth = {
	side: THREE.DoubleSide
};

export const flag = {
	blue: assign({
		color: 0x0000ff,
	}, cloth),
	red: assign({
		color: 0xff0000,
	}, cloth),
	yellow: assign({
		color: 0xffff00
	}, cloth),
};

export const gate = {
	default: {
		shiny: true,
		transparent: true,
	},
	off: {
		color: 0x000000,
		opacity: 0.2,
		wireframe: true
	},
	blue: {
		color: 0x0000ff,
		opacity: 0.7,
		wireframe: false
	},
	green: {
		color: 0x00ff00,
		opacity: 0.7,
		wireframe: false
	},
	red: {
		color: 0xff0000,
		opacity: 0.7,
		wireframe: false
	}
};

export const spike = {
	shiny: true,
	color: 0x666666,
	opacity: 1
};

export const wall = {
	shiny: true,
	color: 0x787878,
	opacity: 0.95,
	transparent: true
};
