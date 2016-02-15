import * as THREE from 'three';

import * as utils from '../utils';
import config from '../../config/defaults';
const spike = config.objects.spike;

var _material, _geometry;

export default class Spike extends THREE.Mesh {
	constructor(material = {}, options = {}) {
		if (!_geometry) _geometry = createSpikeGeometry(options);
		if (!_material) _material = utils.createMaterial(material);

		super(_geometry, _material);

		this.name = 'spike';
	}
}

function createSpikeGeometry({
	width = spike.width,
	segments = spike.segments
} = {}) {
	var geometry = new THREE.SphereGeometry(width / 4, segments * 10);

	for (var i = 0; i < geometry.vertices.length; i += 10) {
		geometry.vertices[i].x = geometry.vertices[i].x * 2;
		geometry.vertices[i].y = geometry.vertices[i].y * 2;
		geometry.vertices[i].z = geometry.vertices[i].z * 2;
	}

	return geometry;
}
