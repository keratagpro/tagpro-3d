import * as THREE from 'three';

import Ball from './objects/ball';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';

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
	[constants.SPIKE]: Spike,
	[constants.GATE_OFF]: Gate,
	[constants.GATE_GREEN]: Gate,
	[constants.GATE_RED]: Gate,
	[constants.GATE_BLUE]: Gate,
	[constants.BOMB]: Bomb,
	[constants.BOMB_OFF]: Bomb,
};
