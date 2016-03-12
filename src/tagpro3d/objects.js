import * as THREE from 'three';

import * as constants from './constants';

import AnimatedTile from './objects/animated_tile';
import Ball from './objects/ball';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';
import Tile from './objects/tile';

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
	[constants.FLAG_RED]: Tile,
	[constants.FLAG_RED_TAKEN]: Tile,
	[constants.FLAG_BLUE]: Tile,
	[constants.FLAG_BLUE_TAKEN]: Tile,
	[constants.FLAG_YELLOW]: Tile,
	[constants.FLAG_YELLOW_TAKEN]: Tile,
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
	[constants.SPEEDPAD]: AnimatedTile,
	[constants.SPEEDPAD_OFF]: AnimatedTile,
	[constants.SPEEDPAD_RED]: AnimatedTile,
	[constants.SPEEDPAD_RED_OFF]: AnimatedTile,
	[constants.SPEEDPAD_BLUE]: AnimatedTile,
	[constants.SPEEDPAD_BLUE_OFF]: AnimatedTile,
};

export const overridableAssetMap = {
	[constants.SPEEDPAD]: 'speedpad',
	[constants.SPEEDPAD_RED]: 'speedpadRed',
	[constants.SPEEDPAD_BLUE]: 'speedpadBlue',
};