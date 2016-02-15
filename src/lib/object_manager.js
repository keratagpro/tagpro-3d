import * as THREE from 'three';

import Bomb from './objects/bomb';
import Flag from './objects/flag';
import Gate from './objects/gate';
import Spike from './objects/spike';
import * as utils from './utils';

var options;
var materials;

const noop = function() {};

export default class ObjectManager {
	constructor(config) {
		options = config.objects;
		materials = config.materials;
	}

	bomb(obj = new Bomb(materials.bomb)) {
		return obj.show();
	}

	bombHidden(obj = new Bomb(materials.bomb)) {
		return obj.hide();
	}

	flagRed(obj = new Flag(materials.flag.red, options.flag)) {
		return obj.show();
	}

	flagRedTaken(obj = new Flag(materials.flag.red, options.flag)) {
		return obj.hide();
	}

	flagBlue(obj = new Flag(materials.flag.blue, options.flag)) {
		return obj.show();
	}

	flagBlueTaken(obj = new Flag(materials.flag.blue, options.flag)) {
		return obj.hide();
	}

	flagYellow(obj = new Flag(materials.flag.yellow, options.flag)) {
		return obj.show();
	}

	flagYellowTaken(obj = new Flag(materials.flag.yellow, options.flag)) {
		return obj.hide();
	}

	gateOff(obj = new Gate(materials.gate, options.gate)) {
		return obj.off();
	}

	gateRed(obj = new Gate(materials.gate, options.gate)) {
		return obj.red();
	}

	gateGreen(obj = new Gate(materials.gate, options.gate)) {
		return obj.green();
	}

	gateBlue(obj = new Gate(materials.gate, options.gate)) {
		return obj.blue();
	}

	spike(obj = new Spike(materials.spike, options.spike)) {
		return obj;
	}

	byTileId(id) {
		switch(id) {
		case '3': return this.flagRed;
		case '3.1': return this.flagRedTaken;
		case '4': return this.flagBlue;
		case '4.1': return this.flagBlueTaken;
		case '16': return this.flagYellow;
		case '16.1': return this.flagYellowTaken;
		case '7': return this.spike;
		case '9': return this.gateOff;
		case '9.1': return this.gateGreen;
		case '9.2': return this.gateRed;
		case '9.3': return this.gateBlue;
		case '10': return this.bomb;
		case '10.1': return this.bombHidden;
		case '17': return noop;
		case '18': return noop;
		// floor: 2,
		// powerupNone: 6,
		}
	}
}
