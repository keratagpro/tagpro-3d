import * as THREE from 'three';
import { tiles } from 'tagpro';

import * as geometries from '../geometries';
import * as objects from '../constants';
import { gate } from '../../options/objects';
import { findDominantColorForTile } from '../utils';

var _geometry;
var gateColors = {};

export default class Gate extends THREE.Mesh {
	constructor(tile, {
		geometry,
		materials,
		outlineMaterials,
		extrude
	} = gate) {
		if (!_geometry) _geometry = geometries.createRectangleGeometry(geometry.width, extrude);
		var material = new THREE.MeshPhongMaterial(materials.default);

		super(_geometry, material);
		this.name = 'gate';

		this.rotateX(Math.PI / 2);

		this.materials = materials;
		this.outlineMaterials = outlineMaterials;

		this.addOutline(outlineMaterials.default);

		this.updateByTile(tile);
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

	updateByTile(tile) {
		if (tile == objects.GATE_OFF) this.off();
		else if (tile == objects.GATE_GREEN) this.green();
		else if (tile == objects.GATE_RED) this.red();
		else if (tile == objects.GATE_BLUE) this.blue();
	}

	updateMaterials(tileId, material, outlineMaterial) {
		if (!gateColors[tileId]) {
			gateColors[tileId] = findDominantColorForTile(tiles[tileId]);
		}

		this._outlineMaterial.color = gateColors[tileId];
		this._outlineMaterial.setValues(outlineMaterial);

		this.material.color = gateColors[tileId];
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
