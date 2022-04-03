import { tiles } from 'tagpro';
import * as THREE from 'three';

import * as objects from '../constants';
import { BombOptions } from '../options/bombOptions';
import * as utils from '../utils';
import * as bombModel from './bomb-model.json';

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial> {
	return 'material' in obj;
}

export class Bomb extends THREE.Object3D {
	materials: BombOptions['materials'];

	constructor(tileId: number | string, public options: BombOptions) {
		super();

		this.materials = options.materials;

		this.add(utils.loadObjectFromJson(bombModel));

		const bomb = this.getObjectByName('bomb') as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
		const bombMaterial = bomb.material;

		if (!bombMaterial.color) {
			bombMaterial.color = new THREE.Color(utils.getDominantColorForTile(tiles.image, tiles[tileId]));
		}

		bombMaterial.setValues(options.materials.body);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId: number | string) {
		if (tileId == objects.BOMB) this.show();
		else if (tileId == objects.BOMB_OFF) this.hide();
	}

	show() {
		const params = this.materials.show;

		this.traverse((obj) => {
			if (isMesh(obj)) {
				obj.material.setValues(params);
			}
		});
	}

	hide() {
		const params = this.materials.hide;

		this.traverse((obj) => {
			if (isMesh(obj)) {
				obj.material.setValues(params);
			}
		});
	}
}
