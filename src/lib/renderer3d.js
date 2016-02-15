import * as THREE from 'three';
import $ from 'jquery';

import * as clipper from './clipper';
import * as utils from './utils';
import * as lights from './lights';
import ObjectManager from './object_manager';

var tagpro;
var loader = new THREE.TextureLoader();

const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);
var quaternion = new THREE.Quaternion();

export default class Renderer3D {
	constructor(tp, config) {
		tagpro = tp;

		this.config = config;
		this.materials = config.materials;
		this.ballConfig = config.objects.ball;

		this.camera = utils.createCamera(config.camera);
		this.renderer = utils.createRenderer(config.renderer);
		this.scene = utils.createScene();

		this.scene.add(this.camera);

		lights.addLights(this.config.lights, this.scene, this.camera);

		this._updatables = [];
		this._updatablesLength = 0;

		this.players = [];
		this.manager = new ObjectManager(config);
	}

	initObjects(width, height) {
		// Create blank array of 3D objects
		this.objects = Array(width);
		for (let i = 0; i < width; i++) {
			this.objects[i] = Array(height);
		}
	}

	drawExtraTilesToBackground(map, container) {
		var tileSize = this.config.tileSize;
		var width = map.length;
		var height = map[0].length;
		var tile;

		for (var col = 0; col !== width; col++) {
			let x = col * tileSize;
			for (var row = 0; row !== height; row++) {
				let y = row * tileSize;
				tile = map[col][row];

				// HACK: Add floor tiles beneath gates
				if (~~tile === 9)
					tagpro.tiles.draw(tagpro.renderer.layers.background, 2, { x, y });
				else if (tile === 17 || tile === 18)
					tagpro.tiles.draw(tagpro.renderer.layers.background, tile, { x, y });
			}
		}
	}

	drawWalls(map, pixiLayers) {
		var extrude = this.config.objects.wall.extrude;

		var shapes = clipper.createShapesFromTilemap({
			data: map,
			tileSize: this.config.tileSize,
			diluteDelta: -extrude.bevelSize
		});

		var geometry = new THREE.ExtrudeGeometry(shapes, extrude);
		var material = utils.createMaterial(this.materials.wall);

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(-this.config.tileSize / 2, this.config.tileSize / 2, 0);

		this.scene.add(mesh);
	}

	drawDynamicTile(original, col, row) {
		var tile = tagpro.map[col][row];
		var createOrUpdateObject = this.manager.byTileId(tile.toString());

		var mesh = this.objects[col][row];

		if (createOrUpdateObject) {
			if (!mesh) {
				mesh = createOrUpdateObject.call(this.manager);
				if (!mesh) return; // HACK: noop

				var x = col * this.config.tileSize;
				var y = row * this.config.tileSize;

				mesh.position.set(x, -y, 0);
				this.scene.add(mesh);
				this.objects[col][row] = mesh;
			}
			else {
				createOrUpdateObject.call(this.manager, mesh);
			}
		}
		else {
			original(col, row); // falls back to original tagpro function
		}
	}

	render(time, delta) {
		this.renderer.render(this.scene, this.camera);
	}

	update(time, delta) {
		for (var i = 0; i < this._updatablesLength; i++) {
			let obj = this._updatables[i];

			if (!obj) continue;

			if (obj.visible) {
				obj.update(time, delta);
			}
		}
	}

	updateCanvas(tagproCanvas) {
		$(this.renderer.domElement).css({
			left: tagproCanvas.offsetLeft,
			top: tagproCanvas.offsetTop,
			width: null,
			height: null
		}).attr({
			width: tagproCanvas.width,
			height: tagproCanvas.height
		});

		this.renderer.setSize(tagproCanvas.width, tagproCanvas.height);
		utils.updateCameraFOV(this.camera, tagproCanvas.height);
	}

	updateCameraPosition(x, y) {
		this.camera.position.x = x - 19;
		this.camera.position.y = -(y - 19);
	}

	updateCameraZoom(zoom) {
		if (this.zoom !== zoom) {
			this.zoom = zoom;
			this.camera.zoom = 1 / this.zoom;
			this.camera.updateProjectionMatrix();
		}
	}

	addPlayer(player) {
		if (!player) {
			return;
		}

		var config = this.config.objects.ball;

		var geometry = config.isPuck ? utils.createPuckGeometry(config.puck) : utils.createSphereGeometry(config.sphere);
		var material = utils.createMaterial(this.materials.ball.default);
		var object = new THREE.Mesh(geometry, material);
		object.position.z = config.sphere.radius;

		if (config.hasOutline) {
			let material = utils.createMaterial(this.materials.ball.outline);
			let geometry = utils.createSphereGeometry(config.outline);
			var outline = new THREE.Mesh(geometry, material);
			object.add(outline);
		}

		this.scene.add(object);
		this.players[player.id] = object;
	}

	removePlayer(player) {
		if (!player) {
			return;
		}

		this.scene.remove(this.players[player.id]);
		delete this.players[player.id];
	}

	updatePlayerPosition(player) {
		if (!player) return;

		var object = this.players[player.id];
		if (!object) return;

		object.position.x = player.x;
		object.position.y = -player.y;

		if (!this.ballConfig.isPuck) {
			quaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.ballConfig.velocityCoefficient);
			object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
			quaternion.setFromAxisAngle(AXIS_Y, (player.lx || 0) * this.ballConfig.velocityCoefficient);
			object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
		}

		quaternion.setFromAxisAngle(AXIS_Z, -(player.a || 0) * this.ballConfig.rotationCoefficient);
		object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
	}

	updatePlayerColor(player) {
		var object = this.players[player.id];
		if (!object) return;

		var params = player.team === 1 ? this.materials.ball.red : this.materials.ball.blue;
		object.material.setValues(params);
	}

	createBackgroundFromChunks(chunks) {
		var geometry;
		chunks.forEach(({ x, y, width, height, texture }) => {
			if (!geometry) {
				geometry = new THREE.PlaneGeometry(width, height, 1, 1);
				geometry.translate(width / 2, -height / 2, 0);
			}
			else {
				geometry = geometry.clone();
			}

			var material = new THREE.MeshBasicMaterial({
				map: new THREE.CanvasTexture(texture.baseTexture.source),
			});

			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = x - 19;
			mesh.position.y = -(y - 19);
			// mesh.position.z = -this.config.tileSize / 2;

			this.scene.add(mesh);
		});
	}
}
