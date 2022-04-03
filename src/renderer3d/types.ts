export interface Renderer {
	camera: THREE.PerspectiveCamera;
	scene: THREE.Scene;
}

export interface PlayerData {
	team: number;
	object3D: THREE.Object3D & PlayerObject;
}

export interface PlayerObject {
	updateByTileId(tileId: string): void;
	updatePosition(pos: PositionUpdate): void;
}

export interface PositionUpdate {
	x: number;
	y: number;
	lx?: number;
	ly?: number;
	a?: number;
}
