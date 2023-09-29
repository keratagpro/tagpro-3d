import * as THREE from 'three';

export function createRenderer(parameters: THREE.WebGLRendererParameters) {
	const renderer = new THREE.WebGLRenderer(parameters);
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

	// renderer.domElement.width = gameCanvas.width;
	// renderer.domElement.height = gameCanvas.height;

	renderer.setSize(gameCanvas.width, gameCanvas.height);
}
