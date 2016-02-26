import * as THREE from 'three';

import * as clipper from './clipper';

import Ball from './objects/ball';
import Bomb from './objects/bomb';
import Gate from './objects/gate';
import Puck from './objects/puck';
import Spike from './objects/spike';

export function createBall(player) {
	var options = this.options;

	var mesh = options.ballsArePucks ?
		new Puck(options.objects.puck) :
		new Ball(options.objects.ball);

	mesh.updateColor(player);

	return mesh;
}

export function drawWalls(map) {
	var params = this.options.objects.wall;
	var extrude = params.extrude;
	var tileSize = this.TILE_SIZE;

	var shapes = clipper.createShapesFromTilemap({
		map,
		tileSize,
		diluteDelta: extrude.bevelEnabled ? -extrude.bevelSize : 0
	});

	var geometry = new THREE.ExtrudeGeometry(shapes, extrude);
	var material = new THREE.MeshPhongMaterial(params.material);

	var mesh = new THREE.Mesh(geometry, material);
	mesh.name = 'walls';
	mesh.rotateX(Math.PI / 2);
	mesh.position.set(-tileSize / 2, extrude.amount, -tileSize / 2);

	this.scene.add(mesh);

	var edges = new THREE.EdgesHelper(mesh, 0x000000);
	this.scene.add(edges);

	return mesh;
}

export const objectMap = {
	7: function(obj = new Spike(this.options.objects.spike)) {
		return obj;
	},
	9: function(obj = new Gate(this.options.objects.gate)) {
		return obj.off();
	},
	9.1: function(obj = new Gate(this.options.objects.gate)) {
		return obj.green();
	},
	9.2: function(obj = new Gate(this.options.objects.gate)) {
		return obj.red();
	},
	9.3: function(obj = new Gate(this.options.objects.gate)) {
		return obj.blue();
	},
	10: function(obj = new Bomb(this.options.objects.bomb)) {
		return obj.show();
	},
	10.1: function(obj = new Bomb(this.options.objects.bomb)) {
		return obj.hide();
	},
};