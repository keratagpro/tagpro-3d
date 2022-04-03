import { Ball } from './objects/Ball';
import { Puck } from './objects/Puck';
import { Options } from './options';

export function createBall(options: Options) {
	if (options.ballsArePucks) {
		return new Puck(options.objects.puck);
	} else {
		return new Ball(options.objects.ball);
	}
}
