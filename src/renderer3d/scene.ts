import $ from 'jquery';
import * as THREE from 'three';

export function createRenderer(params: THREE.WebGLRendererParameters) {
	const renderer = new THREE.WebGLRenderer(params);

	renderer.domElement.id = 'tagpro3d';
	document.body.appendChild(renderer.domElement);

	return renderer;
}

export function createScene() {
	const scene = new THREE.Scene();
	return scene;
}

export function resizeCanvas(gameCanvas: HTMLCanvasElement, renderer?: THREE.WebGLRenderer) {
	if (!renderer) {
		return;
	}

	$(renderer.domElement)
		.css({
			left: gameCanvas.offsetLeft,
			top: gameCanvas.offsetTop,
			width: null,
			height: null,
		})
		.attr({
			width: gameCanvas.width,
			height: gameCanvas.height,
		});

	renderer.setSize(gameCanvas.width, gameCanvas.height);
}
