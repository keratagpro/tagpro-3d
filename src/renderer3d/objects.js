import * as THREE from 'three';

import * as constants from './constants';

import Ball from './objects/ball';
import AnimatedTile from './objects/animated_tile';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';
import Tile from './objects/tile';

export function createBall(player) {
	var options = this.options;

	var tileId = player.team === 1 ? 'redball' : 'blueball';

	var mesh = options.ballsArePucks ?
		new Puck(tileId, options.objects.puck) :
		new Ball(tileId, options.objects.ball);

	return mesh;
}

// TODO: Use single PlaneGeometry with faceVertexUvs.
export function createBackgroundPlaneFromChunks(chunks) {
	var plane = new THREE.Object3D();
	plane.position.x = -20;
	plane.position.z = -20;

	var geometry;
	chunks.forEach(({ x, y, width, height, texture }) => {
		if (!geometry) {
			geometry = new THREE.PlaneGeometry(width, height, 1, 1);
			geometry.rotateX(-Math.PI / 2);
			geometry.translate(width / 2, 0, height / 2);
		}
		else {
			geometry = geometry.clone();
		}

		var material = new THREE.MeshPhongMaterial({
			map: new THREE.CanvasTexture(texture.baseTexture.source)
		});

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = x;
		mesh.position.z = y;

		plane.add(mesh);
	});

	return plane;
}

export const objectMap = {
	[constants.BOMB]: Bomb,
	[constants.BOMB_OFF]: Bomb,
	[constants.BUTTON]: Tile,
	[constants.ENDZONE_BLUE]: Tile,
	[constants.ENDZONE_RED]: Tile,
	[constants.FLAG_BLUE]: Tile,
	[constants.FLAG_BLUE_TAKEN]: Tile,
	[constants.FLAG_RED]: Tile,
	[constants.FLAG_RED_TAKEN]: Tile,
	[constants.FLAG_YELLOW]: Tile,
	[constants.FLAG_YELLOW_TAKEN]: Tile,
	[constants.GATE_BLUE]: Gate,
	[constants.GATE_GREEN]: Gate,
	[constants.GATE_OFF]: Gate,
	[constants.GATE_RED]: Gate,
	[constants.PORTAL]: AnimatedTile,
	[constants.PORTAL_OFF]: AnimatedTile,
	[constants.POWERUP_BOMB]: Tile,
	[constants.POWERUP_GRIP]: Tile,
	[constants.POWERUP_NONE]: Tile,
	[constants.POWERUP_SPEED]: Tile,
	[constants.POWERUP_TAGPRO]: Tile,
	[constants.SPEEDPAD]: AnimatedTile,
	[constants.SPEEDPAD_BLUE]: AnimatedTile,
	[constants.SPEEDPAD_BLUE_OFF]: AnimatedTile,
	[constants.SPEEDPAD_OFF]: AnimatedTile,
	[constants.SPEEDPAD_RED]: AnimatedTile,
	[constants.SPEEDPAD_RED_OFF]: AnimatedTile,
	[constants.SPIKE]: Spike,
};

export const animatedAssetMap = {
	[constants.PORTAL]: 'portal',
	[constants.PORTAL_OFF]: 'portal',
	[constants.SPEEDPAD]: 'speedpad',
	[constants.SPEEDPAD_BLUE]: 'speedpadBlue',
	[constants.SPEEDPAD_BLUE_OFF]: 'speedpadBlue',
	[constants.SPEEDPAD_OFF]: 'speedpad',
	[constants.SPEEDPAD_RED]: 'speedpadRed',
	[constants.SPEEDPAD_RED_OFF]: 'speedpadRed',
};