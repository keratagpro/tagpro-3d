import * as THREE from 'three';
import { tiles } from 'tagpro';

import * as objects from '../constants';
import { spike } from '../../options/objects';
import { findDominantColorForTile } from '../utils';

var _material, _geometry;

export default class Spike extends THREE.Mesh {
	constructor(tile, {
		geometry,
		material
	} = spike) {
		if (!_geometry) {
			_geometry = createSpikeGeometry(geometry);
		}

		if (!_material) {
			_material = new THREE.MeshPhongMaterial(material);
			_material.color = findDominantColorForTile(tiles[objects.SPIKE]);
		}

		super(_geometry, _material);

		this.name = 'spike';
	}

	updateByTile() { }
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
