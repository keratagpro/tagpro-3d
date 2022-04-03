import { transfer, wrap } from 'comlink';
import * as tagpro from 'tagpro';
import { defaultOptions } from './Renderer3D/options';
import { PositionUpdate } from './Renderer3D/types';

import { after } from './utils';
import { Worker3D } from './worker';

export function createRenderer3D() {
	const tr = tagpro.renderer;

	const workerUrl = GM_getResourceURL('worker');
	const worker = new Worker(workerUrl, { type: 'module' });
	const worker3D = wrap<Worker3D>(worker);

	const options = defaultOptions;

	worker3D.setup(options);

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

		const offscreenCanvas = canvas3D.transferControlToOffscreen();

		worker3D.initialize(transfer(offscreenCanvas, [offscreenCanvas as any]), tr.canvas.width, tr.canvas.height);
	});

	after(tr, 'updateGraphics', function () {
		worker3D.render();
	});

	//
	// Camera
	//

	after(tr, 'centerView', function () {
		worker3D.resize(tr.canvas.width, tr.canvas.height);
	});

	after(tr, 'centerContainerToPoint', function (x: number, y: number) {
		worker3D.updateCameraPosition(x, y);
	});

	after(tr, 'updateCameraZoom', function () {
		worker3D.updateCameraZoom(tagpro.zoom);
	});

	//
	// Balls
	//

	if (options.ballsAre3D) {
		after(tr, 'createBallSprite', (player: TagPro.Player) => {
			worker3D.createBall(player.id, player.team);
		});

		after(tr, 'updatePlayerColor', (player: TagPro.Player) => {
			worker3D.updatePlayerColor(player.id, player.team);
		});

		after(tr, 'updatePlayerVisibility', function (player: TagPro.Player) {
			worker3D.updatePlayerVisibility(player.id, player.sprite.visible);

			// Hide the 2D ball
			player.sprites.actualBall.visible = false;
		});

		after(tr, 'updatePlayerSpritePosition', (player: TagPro.Player) => {
			const pos: PositionUpdate = {
				x: player.sprite.x,
				y: player.sprite.y,
				lx: player.lx,
				ly: player.ly,
				a: player.a,
			};
			worker3D.updatePlayerPosition(player.id, pos);
		});

		after(tr, 'destroyPlayer', function (player: TagPro.Player) {
			worker3D.destroyPlayer(player.id);
		});
	}

	//
	// Walls
	//

	if (options.wallsAre3D) {
		after(tr, 'createBackgroundTexture', () => {
			worker3D.createWalls(tagpro.map, tagpro.TILE_SIZE);
		});
	}

	console.log('TagPro 3D Initialized.');
}
