import * as THREE from 'three';
import { tiles } from 'tagpro';

import * as objects from '../constants';
import * as utils from '../utils';
import { gate } from '../options/objects';

var _geometry;

export default class Gate extends THREE.Mesh {
	constructor(tileId, params = gate) {
		if (!_geometry) {
			_geometry = new THREE.BoxGeometry(params.geometry.width, params.geometry.height, params.geometry.width, 1, 1, 1);
			_geometry.translate(0, params.geometry.height / 2, 0);
		}

		var material = params.materials.default;
		if (!material.map) {
			material = Object.assign({
				map: utils.getTilesTexture()
			}, material);
		}

		var _material = new THREE.MeshPhongMaterial(material);

		super(_geometry, _material);

		this.name = 'gate';
		this.params = params;

		this.addOutline(params.outlineMaterials.default);
		this.updateByTileId(tileId);
	}

	addOutline(params) {
		var outline = new THREE.LineSegments(
			new THREE.EdgesGeometry(this.geometry, 0.1),
			new THREE.LineBasicMaterial(params)
		);

		outline.matrixAutoUpdate = false;

		this.add(outline);
		this._outlineMaterial = outline.material;
	}

	updateByTileId(tileId) {
		if (tileId == objects.GATE_OFF) this.off();
		else if (tileId == objects.GATE_GREEN) this.green();
		else if (tileId == objects.GATE_RED) this.red();
		else if (tileId == objects.GATE_BLUE) this.blue();
	}

	updateMaterials(tileId, material, outlineMaterial) {
		if (!outlineMaterial.color)
			outlineMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);

		this._outlineMaterial.setValues(outlineMaterial);

		this.material.map.setTile(tiles[tileId]);
		this.material.setValues(material);
	}

	off() {
		this.updateMaterials(objects.GATE_OFF, this.params.materials.off, this.params.outlineMaterials.off);
	}

	green() {
		this.updateMaterials(objects.GATE_GREEN, this.params.materials.green, this.params.outlineMaterials.green);
	}

	red() {
		this.updateMaterials(objects.GATE_RED, this.params.materials.red, this.params.outlineMaterials.red);
	}

	blue() {
		this.updateMaterials(objects.GATE_BLUE, this.params.materials.blue, this.params.outlineMaterials.blue);
	}
}
