import * as THREE from 'three';
import { tiles } from 'tagpro';

import bombJson from './bomb.json';
import { bomb } from '../../options/objects';
import { loadObjectFromJson, findDominantColorForTile } from '../utils';
import * as objects from '../constants';

export default class Bomb extends THREE.Object3D {
	constructor(tileId, {
		materials
	} = bomb) {
		super();

		this.materials = materials;

		this.add(loadObjectFromJson(bombJson));

		var bombMaterial = this.getObjectByName('bomb').material;
		bombMaterial.setValues(materials.body);
		bombMaterial.color = findDominantColorForTile(tiles[tileId]);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId) {
		if (tileId == objects.BOMB) this.show();
		else if (tileId == objects.BOMB_OFF) this.hide();
	}

	show() {
		var params = this.materials.show;

		this.traverse(o => {
			if (!o.material) return;
			o.material.setValues(params);
		});
	}

	hide() {
		var params = this.materials.hide;

		this.traverse(o => {
			if (!o.material) return;
			o.material.setValues(params);
		});
	}
}