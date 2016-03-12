import * as constants from '../tagpro3d/constants';

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
		constants.GATE_OFF,
		constants.GATE_GREEN,
		constants.GATE_RED,
		constants.GATE_BLUE,
		constants.ENDZONE_RED,
		constants.ENDZONE_BLUE,
	];

	flooredTiles.forEach(tile => {
		tiles[tile].drawFloor = true;
		tiles[tile].redrawFloor = false;
	});
}
