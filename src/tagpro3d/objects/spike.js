import * as THREE from 'three';

var material, geometry;

export default class Spike extends THREE.Mesh {
	constructor(options = {}) {
		if (!geometry) geometry = createSpikeGeometry(options.geometry);
		if (!material) material = new THREE.MeshPhongMaterial(options.material);

		super(geometry, material);

		this.name = 'spike';
	}
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
