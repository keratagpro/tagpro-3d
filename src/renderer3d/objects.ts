import { Ball } from './objects/Ball';
import { Puck } from './objects/Puck';
import { Options } from './options';

export function createBall(player: TagPro.Player, options: Options) {
	const tileId = player.team === 1 ? 'redball' : 'blueball';

	if (options.ballsArePucks) {
		return new Puck(tileId, options.objects.puck);
	} else {
		return new Ball(tileId, options.objects.ball);
	}
}
