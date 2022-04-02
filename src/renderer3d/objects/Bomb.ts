import { tiles } from 'tagpro';
import * as THREE from 'three';

import * as objects from '../constants';
import { bomb } from '../options/objects';
import * as utils from '../utils';
import * as bombJson from './bomb.json';

export class Bomb extends THREE.Object3D {
	constructor(tileId, params = bomb) {
		super();

		this.materials = params.materials;

		this.add(utils.loadObjectFromJson(bombJson));

		const bombMaterial = this.getObjectByName('bomb').material;

		if (!bombMaterial.color) bombMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		bombMaterial.setValues(params.materials.body);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		if (tileId == objects.BOMB) this.show();
		else if (tileId == objects.BOMB_OFF) this.hide();
	}

	show() {
		const params = this.materials.show;

		this.traverse((o) => {
			if (!o.material) return;
			o.material.setValues(params);
		});
	}

	hide() {
		const params = this.materials.hide;

		this.traverse((o) => {
			if (!o.material) return;
			o.material.setValues(params);
		});
	}
}
