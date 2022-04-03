import * as tagpro from 'tagpro';

import { Renderer3D } from './Renderer3D';
import * as utils from './utils';
import { before } from './utils';

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

	after(tr, 'createBackground', function () {
		const canvas3D = document.createElement('canvas');
		canvas3D.width = tr.canvas.width;
		canvas3D.height = tr.canvas.height;

		const threeTexture = PIXI.Texture.fromCanvas(canvas3D);
		const threeSprite = new PIXI.Sprite(threeTexture);
		threeSprite.name = 'tagpro3d';
		/* eslint-disable @typescript-eslint/no-empty-function */
		threeSprite.updateTransform = function () {};

		tr.layers.foreground.addChild(threeSprite);

		t3d.renderer = t3d.createRenderer({
			...t3d.options.renderer,
			canvas: canvas3D,
		});

		t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
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
		const players = t3d.players;

		after(tr, 'createBallSprite', (player: TagPro.Player) => {
			const ball3D = t3d.createBall(player, t3d.options);
			players[player.id] = {
				team: player.team,
				object3D: ball3D,
			};
			t3d.scene.add(ball3D);
			player.sprites.actualBall.visible = false;
		});

		after(tr, 'updatePlayerColor', (player: TagPro.Player) => {
			const player3D = t3d.players[player.id];
			if (player.team !== player3D.team) {
				player3D.team = player.team;
				player3D.object3D.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
			}
		});

		after(tr, 'updatePlayerVisibility', function (player: TagPro.Player) {
			const player3D = t3d.players[player.id];
			player3D.object3D.visible = player.sprite.visible;
		});

		after(tr, 'updatePlayerSpritePosition', (player: TagPro.Player) => {
			const player3D = t3d.players[player.id];
			player3D.object3D.updatePosition(player);
		});

		after(tr, 'destroyPlayer', function (player: TagPro.Player) {
			const player3D = t3d.players[player.id];
			t3d.scene.remove(player3D.object3D);
			delete t3d.players[player.id];
		});
	}

	//
	// Walls
	//

	if (t3d.options.wallsAre3D) {
		after(tr, 'createBackgroundTexture', () => {
			const walls3D = t3d.createWalls(tagpro.map, t3d.options.objects.wall);
			t3d.scene.add(walls3D);
		});
	}

	console.log('TagPro 3D Initialized.');
}
