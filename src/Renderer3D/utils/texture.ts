import { TILE_SIZE, tiles } from 'tagpro';

import { getOrCreatePowerOfTwoImage } from './image';
import { SpriteTexture } from './SpriteTexture';

export function getTilesTexture() {
	return new SpriteTexture(
		getOrCreatePowerOfTwoImage(tiles.image),
		tiles.image.width / TILE_SIZE,
		tiles.image.height / TILE_SIZE
	);
}

export function getTextureByTileId(tileId: number | string) {
	const texture = getTilesTexture();
	texture.setTile(tiles[tileId]);
	return texture;
}
