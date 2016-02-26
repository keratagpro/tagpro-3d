/**
 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
 * between tagpro.ready and tagpro.ready.after.
 */
export function readyAfter(tagpro, callback) {
	if (tagpro.resourcesLoaded) {
		setTimeout(callback, 0);
	}
	else {
		tagpro._afterReadyCallbacks.push(callback);
	}
}

/**
 * Draws some extra tiles to the background layer.
 */
export function drawExtraTilesToBackground(tagpro) {
	var tileSize = tagpro.TILE_SIZE;
	var width = tagpro.map.length;
	var height = tagpro.map[0].length;
	var container = tagpro.renderer.layers.background;

	var tile;
	for (var col = 0; col !== width; col++) {
		let x = col * tileSize;
		for (var row = 0; row !== height; row++) {
			let y = row * tileSize;
			tile = tagpro.map[col][row];

			if (~~tile === 9) {
				// Floor tiles beneath gates
				tagpro.tiles.draw(container, 2, { x, y });
			}
			else if (tile === 17 || tile === 18) {
				// Goal tiles
				tagpro.tiles.draw(container, tile, { x, y });
			}
		}
	}
}