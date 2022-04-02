import * as constants from './constants';
import { Ball } from './objects/Ball';
import { Bomb } from './objects/Bomb';
import { Gate } from './objects/Gate';
import { Puck } from './objects/puck';
import { Spike } from './objects/spike';

export function createBall(this: any, player: any) {
	const options = this.options;

	const tileId = player.team === 1 ? 'redball' : 'blueball';

	const mesh = options.ballsArePucks ? new Puck(tileId, options.objects.puck) : new Ball(tileId, options.objects.ball);

	return mesh;
}

export const objectMap = {
	[constants.BOMB]: Bomb,
	[constants.BOMB_OFF]: Bomb,
	// [constants.BUTTON]: Tile,
	// [constants.ENDZONE_BLUE]: Tile,
	// [constants.ENDZONE_RED]: Tile,
	// [constants.FLAG_BLUE]: Tile,
	// [constants.FLAG_BLUE_TAKEN]: Tile,
	// [constants.FLAG_RED]: Tile,
	// [constants.FLAG_RED_TAKEN]: Tile,
	// [constants.FLAG_YELLOW]: Tile,
	// [constants.FLAG_YELLOW_TAKEN]: Tile,
	[constants.GATE_BLUE]: Gate,
	[constants.GATE_GREEN]: Gate,
	[constants.GATE_OFF]: Gate,
	[constants.GATE_RED]: Gate,
	// [constants.PORTAL]: AnimatedTile,
	// [constants.PORTAL_OFF]: AnimatedTile,
	// [constants.POWERUP_BOMB]: Tile,
	// [constants.POWERUP_GRIP]: Tile,
	// [constants.POWERUP_NONE]: Tile,
	// [constants.POWERUP_SPEED]: Tile,
	// [constants.POWERUP_TAGPRO]: Tile,
	// [constants.SPEEDPAD]: AnimatedTile,
	// [constants.SPEEDPAD_BLUE]: AnimatedTile,
	// [constants.SPEEDPAD_BLUE_OFF]: AnimatedTile,
	// [constants.SPEEDPAD_OFF]: AnimatedTile,
	// [constants.SPEEDPAD_RED]: AnimatedTile,
	// [constants.SPEEDPAD_RED_OFF]: AnimatedTile,
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
