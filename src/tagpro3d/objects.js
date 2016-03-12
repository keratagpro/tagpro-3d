import * as THREE from 'three';

import Ball from './objects/ball';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';
import Tile from './objects/tile';

import * as constants from './constants';

export function createBall(player) {
	var options = this.options;

	var mesh = options.ballsArePucks ?
		new Puck(options.objects.puck) :
		new Ball(options.objects.ball);

	mesh.updateColor(player);

	return mesh;
}

export const objectMap = {
	[constants.BOMB]: Bomb,
	[constants.BOMB_OFF]: Bomb,
	[constants.BUTTON]: Tile,
	[constants.GATE_BLUE]: Gate,
	[constants.GATE_GREEN]: Gate,
	[constants.GATE_OFF]: Gate,
	[constants.GATE_RED]: Gate,
	[constants.SPIKE]: Spike,
	[constants.POWERUP_BOMB]: Tile,
	[constants.POWERUP_GRIP]: Tile,
	[constants.POWERUP_NONE]: Tile,
	[constants.POWERUP_SPEED]: Tile,
	[constants.POWERUP_TAGPRO]: Tile,
};
