import { tiles } from 'tagpro';
import * as THREE from 'three';

import * as constants from '../constants';
import { spike } from '../options/objects';
import * as utils from '../utils';

let _material: THREE.MeshPhongMaterial;
let _geometry: THREE.SphereGeometry;

export class Spike extends THREE.Mesh {
	constructor(tileId: number, { geometry, material }: any = spike) {
		if (!_geometry) {
			_geometry = createSpikeGeometry(geometry);
		}

		if (!_material) {
			if (!material.color) {
				material.color = utils.getDominantColorForTile(tiles.image, tiles[constants.SPIKE]);
			}

			_material = new THREE.MeshPhongMaterial(material);
		}

		super(_geometry, _material);

		this.name = 'spike';
	}

	updateByTileId() {}
}

function createSpikeGeometry({ width = 32, segments = 6 } = {}) {
	const geom = new THREE.SphereGeometry(width / 4, segments * 10);

	for (let i = 0; i < geom.vertices.length; i += 10) {
		geom.vertices[i].x = geom.vertices[i].x * 2;
		geom.vertices[i].y = geom.vertices[i].y * 2;
		geom.vertices[i].z = geom.vertices[i].z * 2;
	}

	return geom;
}
