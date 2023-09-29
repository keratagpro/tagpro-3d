import { TILE_SIZE, tiles } from 'tagpro';
import * as THREE from 'three';

import { PuckOptions } from '../../options/puckOptions';
import { getTilesTexture } from '../utils';
import { SpriteTexture } from '../utils/SpriteTexture';

const AXIS_Y = new THREE.Vector3(0, 1, 0);
// const BALL_RADIUS = 38;
const tempQuaternion = new THREE.Quaternion();

export class Puck extends THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhongMaterial[]> {
	tileTexture?: THREE.Texture;

	constructor(
		tileId: string,
		public options: PuckOptions,
	) {
		const geometry = new THREE.CylinderGeometry(
			options.geometry.radiusTop,
			options.geometry.radiusBottom,
			options.geometry.height,
			options.geometry.segments,
			1,
		);

		const sideMaterial = new THREE.MeshPhongMaterial(options.materials.side.default);
		const topMaterial = new THREE.MeshPhongMaterial(options.materials.top.default);

		super(geometry, [sideMaterial, topMaterial]);

		this.position.y = options.geometry.height / 2;

		if (options.useOriginalTexture) {
			if (!this.tileTexture) {
				this.tileTexture = getTilesTexture();
				topMaterial.map = this.tileTexture;
			}

			const texture = this.tileTexture;
			// HACK: Shrink texture mapping since ball is 38px, not 40px.
			texture.offset.x += 1 / TILE_SIZE / 16;
			texture.offset.y += 1 / TILE_SIZE / 11;
			texture.repeat.x -= 2 / TILE_SIZE / 16;
			texture.repeat.y -= 2 / TILE_SIZE / 11;
		}

		this.updateByTileId(tileId);
	}

	updateByTileId(tileId: number | string) {
		const { side, top } = this.options.materials;
		const sideParams = side[tileId === 'redball' ? 'red' : 'blue'];
		const topParams = top[tileId === 'redball' ? 'red' : 'blue'];

		const [sideMaterial, topMaterial] = this.material;

		sideMaterial.setValues(sideParams);
		topMaterial.setValues(topParams);

		if (this.options.useOriginalTexture) {
			const texture = topMaterial.map as SpriteTexture;
			texture.setTile(tiles[tileId]);
		}
	}

	updatePosition(player: TagPro.Player) {
		this.position.x = player.sprite.x;
		this.position.z = player.sprite.y;

		tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
		this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
	}
}
