import * as tagpro from 'tagpro';

import { Renderer3D } from './Renderer3D';
import * as utils from './utils';

export default function createRenderer3D() {
	const after = utils.after;
	const tr = tagpro.renderer;
	const t3d = new Renderer3D();

	Object.assign(tagpro, { tagpro3d: t3d });

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

	// after(tr, 'updateGraphics', function () {
	// 	t3d.update(performance.now());
	// });

	after(tr, 'render', function () {
		t3d.renderer?.render(t3d.scene, t3d.camera);
	});

	//
	// Camera
	//

	after(tr, 'centerView', function () {
		t3d.resizeCanvas(tr.canvas, t3d.renderer);
		t3d.updateCameraFOV(t3d.camera, tr.canvas);
	});

	after(tr, 'centerContainerToPoint', function (x: number, y: number) {
		t3d.updateCameraPosition(t3d.camera, x, y);
	});

	let zoom: number;
	after(tr, 'updateCameraZoom', function () {
		if (zoom !== tagpro.zoom) {
			zoom = tagpro.zoom;
			t3d.updateCameraZoom(t3d.camera, zoom);
		}
	});

	//
	// Balls
	//

	tr.createBallSprite = function (player: any) {
		player.currentTeam = player.team;

		player.object3d = t3d.createBall(player);
		t3d.scene.add(player.object3d);
	};

	tr.updatePlayerColor = function (player: any) {
		if (player.team !== player.currentTeam) {
			player.currentTeam = player.team;
			player.object3d.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
		}
	};

	after(tr, 'updatePlayerVisibility', function (player: any) {
		player.object3d.visible = player.sprite.visible;
	});

	after(tr, 'updatePlayerSpritePosition', function (player: any) {
		player.object3d.updatePosition(player);
	});

	after(tr, 'destroyPlayer', function (player: any) {
		t3d.scene.remove(player.object3d);
		delete player.object3d;
	});

	//
	// Walls
	//

	after(tr, 'createBackgroundTexture', () => {
		t3d.createWalls(tagpro.map, t3d.options.objects.wall);
	});

	console.log('TagPro 3D Initialized.');
}
