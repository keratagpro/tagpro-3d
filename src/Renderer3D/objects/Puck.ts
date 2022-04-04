// import { TILE_SIZE, tiles } from 'tagpro';
import * as THREE from 'three';

import { PuckOptions } from '../../options/puckOptions';

const AXIS_Y = new THREE.Vector3(0, 1, 0);
// const BALL_RADIUS = 38;
const tempQuaternion = new THREE.Quaternion();

function createCircle(geometry: any, material: THREE.MeshPhongMaterialParameters) {
	const geom = new THREE.CircleGeometry(geometry.radius, geometry.segments);
	geom.rotateX(-Math.PI / 2);

	const mat = new THREE.MeshPhongMaterial(material);

	const mesh = new THREE.Mesh(geom, mat);

	return mesh;
}

function createCylinder(geometry: any, material: any) {
	const geom = new THREE.CylinderGeometry(
		geometry.radiusTop,
		geometry.radiusBottom,
		geometry.height,
		geometry.segments,
		1,
		true
	);

	const mat = new THREE.MeshPhongMaterial(material);

	return new THREE.Mesh(geom, mat);
}

export class Puck extends THREE.Object3D {
	_circle: ReturnType<typeof createCircle>;
	_cylinder: ReturnType<typeof createCylinder>;
	_tileTexture?: THREE.Texture;

	constructor(tileId: string, public options: PuckOptions) {
		super();

		this.options = options;

		this.position.y = options.geometries.cylinder.height / 2;

		this._circle = createCircle(options.geometries.circle, options.materials.circle.default);
		this._circle.position.y = options.geometries.cylinder.height / 2;
		this.add(this._circle);

		this._cylinder = createCylinder(options.geometries.cylinder, options.materials.cylinder.default);
		this.add(this._cylinder);

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId: number | string) {
		const materialName = tileId === 'redball' ? 'red' : 'blue';

		const circle = this._circle;
		const cylinder = this._cylinder;
		const materials = this.options.materials;

		const circleMaterial = materials.circle[materialName];

		// Use built-in ball texture if not explicitly set
		// if (!circleMaterial.map) {
		// 	if (!this._tileTexture) {
		// 		this._tileTexture = utils.getTilesTexture();
		// 		circle.material.map = this._tileTexture!;
		// 	}

		// 	const texture = circle.material.map;
		// 	texture.setTile(tiles[tileId]);

		// 	// HACK: Shrink texture mapping since ball is 38px, not 40px.
		// 	texture.offset.x += 1 / TILE_SIZE / 16;
		// 	texture.offset.y += 1 / TILE_SIZE / 11;
		// 	texture.repeat.x -= 2 / TILE_SIZE / 16;
		// 	texture.repeat.y -= 2 / TILE_SIZE / 11;
		// }

		circle.material.setValues(circleMaterial);

		const cylinderMaterial = materials.cylinder[materialName];

		cylinder.material.setValues(cylinderMaterial);
	}

	updatePosition(player: TagPro.Player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
