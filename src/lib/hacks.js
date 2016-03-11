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
export function changeSomeTilesToFloorTiles(tiles) {
	const flooredTiles = [
		9, 9.1, 9.2, 9.3, // gates
		17, 18 // goal tiles
	];

	flooredTiles.forEach(tile => {
		tiles[tile].drawFloor = true;
		tiles[tile].redrawFloor = false;
	});
}
