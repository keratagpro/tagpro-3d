import $ from 'jquery';
import { TILE_SIZE, tiles } from 'tagpro';

import SpriteTexture from '../three/sprite_texture';
import { animatedAssetMap } from '../objects';
import { getOrCreatePowerOfTwoImage } from './image';

export function getTilesTexture() {
	return new SpriteTexture(
		getOrCreatePowerOfTwoImage(tiles.image),
		tiles.image.width / TILE_SIZE,
		tiles.image.height / TILE_SIZE
	);
}

export function getTextureByTileId(tileId, tileSize = TILE_SIZE) {
	var assetName = animatedAssetMap[tileId];

	if (!assetName) {
		var texture = getTilesTexture();
		texture.setTile(tiles[tileId]);
		return texture;
	}

	var img = $(overrideableAssets[assetName])[0];

	return new SpriteTexture(
		getOrCreatePowerOfTwoImage(img),
		img.width / tileSize,
		img.height / tileSize
	);
}
