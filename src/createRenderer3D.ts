import * as tagpro from 'tagpro';

import { Renderer3D } from './Renderer3D';
import { Ball } from './Renderer3D/objects/Ball';
import { Puck } from './Renderer3D/objects/Puck';
import * as utils from './utils';
import { before } from './utils';

interface Player3D extends TagPro.Player {
	currentTeam: number;
	object3d: Ball | Puck;
}

export function createRenderer3D() {
	const after = utils.after;
	const tr = tagpro.renderer;
	const t3d = new Renderer3D();

	console.log('tagpro.renderer', tr);
	console.log('tagpro3d', t3d);

	Object.assign(window, { tagpro3d: t3d });

	//
	// Renderer
	//

	// TODO: Find a sensible tagpro.renderer function to hook this stuff into
	after(tr, 'drawStartingSplats', () => {
		t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
	});

	after(tr, 'createBackground', function () {
		const canvas3D = document.createElement('canvas');
		canvas3D.width = tr.canvas.width;
		canvas3D.height = tr.canvas.height;
		const threeTexture = PIXI.Texture.fromCanvas(canvas3D);
		const threeSprite = new PIXI.Sprite(threeTexture);
		threeSprite.name = 'tagpro3d';
		threeSprite.updateTransform = function () {};

		tr.layers.foreground.addChild(threeSprite);

		t3d.renderer = t3d.createRenderer({
			...t3d.options.renderer,
			canvas: canvas3D,
		});
	});

	// after(tr, 'updateGraphics', function () {
	// 	t3d.update(performance.now());
	// });

	before(tr, 'render', function () {
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

	if (t3d.options.ballsAre3D) {
		after(tr, 'createBallSprite', (player: Player3D) => {
			player.currentTeam = player.team;
			player.object3d = t3d.createBall(player);
			t3d.scene.add(player.object3d);
		});

		after(tr, 'updatePlayerColor', (player: Player3D) => {
			if (player.team !== player.currentTeam) {
				player.currentTeam = player.team;
				player.object3d.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
			}
		});

		after(tr, 'updatePlayerVisibility', function (player: any) {
			player.object3d.visible = player.sprite.visible;
		});

		after(tr, 'updatePlayerSpritePosition', (player: Player3D) => {
			player.object3d.updatePosition(player);
		});

		after(tr, 'destroyPlayer', function (player: any) {
			t3d.scene.remove(player.object3d);
			delete player.object3d;
		});
	}

	//
	// Walls
	//

	if (t3d.options.wallsAre3D) {
		after(tr, 'createBackgroundTexture', () => {
			t3d.createWalls(tagpro.map, t3d.options.objects.wallOptions);
		});
	}

	console.log('TagPro 3D Initialized.');
}
