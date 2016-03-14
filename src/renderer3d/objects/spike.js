import * as THREE from 'three';
import { tiles } from 'tagpro';

import * as constants from '../constants';
import * as utils from '../utils';
import { spike } from '../options/objects';

var _material, _geometry;

export default class Spike extends THREE.Mesh {
	constructor(tileId, {
		geometry,
		material
	} = spike) {
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

	updateByTileId() { }
}

function createSpikeGeometry({ width = 32, segments = 6 } = {}) {
	var geom = new THREE.SphereGeometry(width / 4, segments * 10);

	for (var i = 0; i < geom.vertices.length; i += 10) {
		geom.vertices[i].x = geom.vertices[i].x * 2;
		geom.vertices[i].y = geom.vertices[i].y * 2;
		geom.vertices[i].z = geom.vertices[i].z * 2;
	}

	return geom;
}
