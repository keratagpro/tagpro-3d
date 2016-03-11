import tagpro from 'tagpro';
import * as THREE from 'three';

import { after, addStyles } from './lib/utils';
import * as hacks from './lib/hacks';
import styles from './styles.css';
import t3d from './tagpro3d';

// Extend tagpro.ready.after
tagpro.ready.after = hacks.readyAfter.bind(null, tagpro);

// HACK: for debugging
window.t3d = t3d;

function createRenderer3D() {
	const TILE_SIZE = tagpro.TILE_SIZE;

	tagpro.tagpro3d = t3d;

	var tr = tagpro.renderer;

	// Make game canvas transparent
	tr.options.transparent = true;

	hacks.changeSomeTilesToFloorTiles(tagpro.tiles);

	// Add styles
	addStyles(styles);

	// Draw extra tiles to the 2D background layer.
	// after(tr, 'drawBackgroundTiles', () => hacks.drawExtraTilesToBackground(tagpro));

	t3d.camera = t3d.createCamera(t3d.options.camera);
	t3d.scene = t3d.createScene();
	t3d.scene.add(t3d.camera);

	//
	// Renderer
	//

	// TODO: Find a sensible tagpro.renderer function to hook this stuff into
	after(tr, 'drawStartingSplats', () => {
		t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
	});

	after(tr, 'createRenderer', function () {
		t3d.renderer = t3d.createRenderer(t3d.options.renderer);
	});

	after(tr, 'render', function () {
		t3d.renderer.render(t3d.scene, t3d.camera);
	});

	//
	// Camera
	//

	after(tr, 'centerView', function () {
		t3d.resizeCanvas(t3d.renderer, tr.canvas);
		t3d.updateCameraFOV(t3d.camera, tr.canvas);
	});

	after(tr, 'centerContainerToPoint', function (x, y) {
		t3d.updateCameraPosition(t3d.camera, x, y);
	});

	var zoom;
	after(tr, 'updateCameraZoom', function () {
		if (zoom !== tagpro.zoom) {
			zoom = tagpro.zoom;
			t3d.updateCameraZoom(t3d.camera, zoom);
		}
	});

	//
	// Balls
	//

	tr.createBallSprite = function (player) {
		player.currentTeam = player.team;

		player.object3d = t3d.createBall(player);
		t3d.scene.add(player.object3d);
	};

	tr.updatePlayerColor = function (player) {
		if (player.team !== player.currentTeam) {
			player.currentTeam = player.team;
			player.object3d.updateColor(player);
		}
	};

	after(tr, 'updatePlayerVisibility', function(player) {
		player.object3d.visible = player.sprite.visible;
	});

	after(tr, 'updatePlayerSpritePosition', function (player) {
		player.object3d.updatePosition(player);
	});

	after(tr, 'destroyPlayer', function (player) {
		t3d.scene.remove(player.object3d);
		delete player.object3d;
	});

	//
	// Walls
	//

	after(tr, 'createBackgroundTexture', (container) => {
		var textures = t3d.mapBackgroundChunksToTextures(tr.backgroundChunks);

		t3d.createWalls(tagpro.map, textures, tagpro.tiles.image.src);

		var plane = t3d.createBackgroundPlaneFromChunks(tr.backgroundChunks);
		t3d.scene.add(plane);
		tr.layers.background.visible = false;
	});

	//
	// Tiles
	//

	var originalDrawDynamicTile = tr.drawDynamicTile;
	tr.drawDynamicTile = function (x, y) {
		var tile = tagpro.map[x][y];

		var createOrUpdateObject = t3d.objectMap[tile];

		if (!createOrUpdateObject) {
			originalDrawDynamicTile(x, y);
			return;
		}

		if (!t3d.dynamicObjects[x]) {
			t3d.dynamicObjects[x] = {};
		}

		var mesh = t3d.dynamicObjects[x][y];

		if (!mesh) {
			mesh = createOrUpdateObject.call(t3d);

			// NOTE: Some tiles are "noops", e.g. goal tiles
			if (!mesh)
				return;

			mesh.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
			t3d.scene.add(mesh);

			t3d.dynamicObjects[x][y] = mesh;
		}
		else {
			createOrUpdateObject.call(t3d, mesh);
		}
	};

	console.log('TagPro 3D Initialized.');
}

tagpro.ready(createRenderer3D);
