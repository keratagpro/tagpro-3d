import * as THREE from 'three';
import { tiles } from 'tagpro';

import * as geometries from '../geometries';
import * as objects from '../constants';
import * as utils from '../utils';
import { gate } from '../../options/objects';

var _geometry;
var gateColors = {};

export default class Gate extends THREE.Mesh {
	constructor(tileId, {
		geometry,
		materials,
		outlineMaterials,
		extrude
	} = gate) {
		if (!_geometry) {
			_geometry = new THREE.BoxGeometry(geometry.width, geometry.height, geometry.width, 1, 1, 1);
			_geometry.translate(0, geometry.height / 2, 0);
		}

		var texture = utils.getTilesTexture();
		texture.setTile(tiles[tileId]);

		var material = new THREE.MeshPhongMaterial(
			Object.assign({ map: texture }, materials.default)
		);

		super(_geometry, material);
		this.name = 'gate';

		this.materials = materials;
		this.outlineMaterials = outlineMaterials;

		this.addOutline(outlineMaterials.default);

		this.updateByTileId(tileId);
	}

	addOutline(materialParams) {
		var outline = new THREE.LineSegments(
			new THREE.EdgesGeometry(this.geometry, 0.1),
			new THREE.LineBasicMaterial(materialParams)
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
		if (!gateColors[tileId]) {
			gateColors[tileId] = utils.findDominantColorForTile(tiles[tileId]);
		}

		this._outlineMaterial.color = gateColors[tileId];
		this._outlineMaterial.setValues(outlineMaterial);

		this.material.map.setTile(tiles[tileId]);
		this.material.setValues(material);
	}

	off() {
		this.updateMaterials(objects.GATE_OFF, this.materials.off, this.outlineMaterials.off);
	}

	green() {
		this.updateMaterials(objects.GATE_GREEN, this.materials.green, this.outlineMaterials.green);
	}

	red() {
		this.updateMaterials(objects.GATE_RED, this.materials.red, this.outlineMaterials.red);
	}

	blue() {
		this.updateMaterials(objects.GATE_BLUE, this.materials.blue, this.outlineMaterials.blue);
	}
}
