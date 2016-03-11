import * as THREE from 'three';

import Ball from './objects/ball';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';

export function createBall(player) {
	var options = this.options;

	var mesh = options.ballsArePucks ?
		new Puck(options.objects.puck) :
		new Ball(options.objects.ball);

	mesh.updateColor(player);

	return mesh;
}

export const objectMap = {
	7: function(obj = new Spike(this.options.objects.spike)) {
		return obj;
	},
	9: function(obj = new Gate(this.options.objects.gate)) {
		return obj.off();
	},
	9.1: function(obj = new Gate(this.options.objects.gate)) {
		return obj.green();
	},
	9.2: function(obj = new Gate(this.options.objects.gate)) {
		return obj.red();
	},
	9.3: function(obj = new Gate(this.options.objects.gate)) {
		return obj.blue();
	},
	10: function(obj = new Bomb(this.options.objects.bomb)) {
		return obj.show();
	},
	10.1: function(obj = new Bomb(this.options.objects.bomb)) {
		return obj.hide();
	},
};
