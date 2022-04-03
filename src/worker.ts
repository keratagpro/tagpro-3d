import { expose } from 'comlink';

import { Renderer3D } from './Renderer3D';
import { Options } from './Renderer3D/options';
import { PositionUpdate } from './Renderer3D/types';

var t3d: Renderer3D;
let zoom: number;

console.log('TagPro3D: loaded worker.');

const handlers = {
	setup(options: Options) {
		t3d = new Renderer3D(options);
	},
	initialize(canvas: OffscreenCanvas, width: number, height: number) {
		console.log('initialize', width, height);
		t3d.renderer = t3d.createRenderer({
			...t3d.options.renderer,
			canvas,
		});

		t3d.renderer.setSize(width, height, false);

		t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
	},
	render() {
		t3d.renderer?.render(t3d.scene, t3d.camera);
	},
	resize(width: number, height: number) {
		t3d.renderer?.setSize(width, height, false);
		t3d.updateCameraFOV(t3d.camera, width, height);
	},
	updateCameraPosition(x: number, y: number) {
		t3d.updateCameraPosition(t3d.camera, x, y);
	},
	updateCameraZoom(newZoom: number) {
		if (zoom !== newZoom) {
			zoom = newZoom;
			t3d.updateCameraZoom(t3d.camera, zoom);
		}
	},
	createBall(id: number, team: number) {
		const ball3D = t3d.createBall(t3d.options);

		ball3D.updateByTileId(team === 1 ? 'redball' : 'blueball');

		t3d.players[id] = {
			team,
			object3D: ball3D,
		};

		t3d.scene.add(ball3D);
	},
	updatePlayerColor(id: number, team: number) {
		const player = t3d.players[id];
		if (team !== player.team) {
			player.team = team;
			player.object3D.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
		}
	},
	updatePlayerVisibility(id: number, visible: boolean) {
		t3d.players[id].object3D.visible = visible;
	},
	updatePlayerPosition(id: number, pos: PositionUpdate) {
		const player3D = t3d.players[id];
		player3D.object3D.updatePosition(pos);
	},
	destroyPlayer(id: number) {
		t3d.scene.remove(t3d.players[id].object3D);
		delete t3d.players[id];
	},
	createWalls(map: TagPro.Map, tileSize: number) {
		const walls3D = t3d.createWalls(map, tileSize, t3d.options.objects.wall);
		t3d.scene.add(walls3D);
	},
};

export type Worker3D = typeof handlers;

expose(handlers);
