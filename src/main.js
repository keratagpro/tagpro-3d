import tagpro from 'tagpro';
import * as THREE from 'three';
import $ from 'jquery';

import defaults from './config/defaults';
import Detector from './vendor/Detector';
import Renderer3D from './lib/renderer3d';

const styles = `
	#tagpro3d {
		display: block;
		pointer-events: none;
		position: absolute;
		z-index: 1;
	}

	#viewport {
		z-index: 2;
	}

	#options {
		z-index: 3;
	}
`;


function init() {
	GM_addStyle(styles);

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
		return;
	}

	var tr = tagpro.renderer;
	var canvas = tr.canvas;
	var config = defaults;

	transparentCanvas(tr);

	var r3d = tagpro.renderer3d = new Renderer3D(tagpro, config);

	tr.drawDynamicTile = r3d.drawDynamicTile.bind(r3d, tr.drawDynamicTile);

	after(tr, 'centerContainerToPoint', r3d.updateCameraPosition.bind(r3d));
	after(tr, 'centerView', r3d.updateCanvas.bind(r3d, tr.canvas));
	after(tr, 'destroyPlayer', r3d.removePlayer.bind(r3d));
	after(tr, 'render', r3d.render.bind(r3d));
	after(tr, 'updateCameraZoom', () => r3d.updateCameraZoom(tagpro.zoom));
	after(tr, 'updatePlayerSpritePosition', r3d.updatePlayerPosition.bind(r3d));

	tr.createBallSprite = r3d.addPlayer.bind(r3d);
	tr.updatePlayerColor = r3d.updatePlayerColor.bind(r3d);

	after(tr, 'drawBackgroundTiles', () => {
		r3d.updateCanvas(tr.canvas);
		r3d.drawExtraTilesToBackground(tagpro.map, tr.layers.background);
		r3d.drawWalls(tagpro.map);
		r3d.initObjects(tagpro.map.length, tagpro.map[0].length);
	});

	after(tr, 'chunkifyBackground', () => {
		r3d.createBackgroundFromChunks(tr.backgroundChunks);
		tr.layers.background.visible = false;
	});

	var time, delta;
	var lastTime = performance.now() * 0.001;

	tagpro.events.register({
		update: function() {
			time = performance.now() * 0.001;
			delta = time - lastTime;
			r3d.update(time, delta);
		}
	});

	console.log('TagPro 3D Initialized.');
}

function transparentCanvas(tr) {
	var oldCanvas = $(tr.canvas);
	var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
	oldCanvas.after(newCanvas);
	oldCanvas.remove();
	tr.canvas = newCanvas.get(0);
	tr.options.transparent = true;
	tr.renderer = tr.createRenderer();
	tr.resizeAndCenterView();
	newCanvas.show();
}

function after(obj, methodName, callback) {
	var orig = obj[methodName];
	obj[methodName] = function() {
		var result = orig.apply(this, arguments);
		callback.apply(this, arguments);
		return result;
	};
}

tagpro.ready(init);
