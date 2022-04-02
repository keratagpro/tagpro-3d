import * as constants from '../Renderer3D/constants';

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

	flooredTiles.forEach((tile) => {
		tiles[tile].drawFloor = true;
		tiles[tile].redrawFloor = false;
	});
}
