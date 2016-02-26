import * as THREE from 'three';
import {
	Clipper,
	JS,
	ClipperOffset,
	PolyTree,
	PolyFillType,
	JoinType,
	EndType
} from 'clipper';

const BL = 1.1; // ◣ bottom left
const TL = 1.2; // ◤ top left
const TR = 1.3; // ◥ top right
const BR = 1.4; // ◢ bottom right

export function createShapesFromTilemap({
	map,
	tileSize = 40,
	lightenTolerance = tileSize / 4,
	miterLimit = tileSize / 2,
	arcTolerance = 0.25,
	diluteDelta = 0
}) {
	var scale = 10;
	var paths = createClipperPaths(map, tileSize * scale);

	paths = Clipper.SimplifyPolygons(paths, PolyFillType.pftNonZero);
	paths = JS.Lighten(paths, lightenTolerance * scale);

	JS.ScaleDownPaths(paths, scale);

	var co = new ClipperOffset(miterLimit, arcTolerance);
	co.AddPaths(paths, JoinType.jtMiter, EndType.etClosedPolygon);

	var diluted = new PolyTree();
	co.Execute(diluted, diluteDelta);

	var polygons = JS.PolyTreeToExPolygons(diluted);

	var shapes = createThreeShapesFromExPolygons(polygons);

	return shapes;
}

function createThreeShapesFromExPolygons(polygons) {
	return polygons.map(({ outer, holes }) => {
		var shape = new THREE.Shape();

		outer.forEach(({ X: x, Y: y }, index) => shape[index === 0 ? 'moveTo' : 'lineTo'](x, y));

		shape.holes = holes.map(hole => {
			var holeShape = new THREE.Shape();
			hole.forEach(({ X: x, Y: y }, index) => holeShape[index === 0 ? 'moveTo' : 'lineTo'](x, y));

			return holeShape;
		});

		return shape;
	});
}

function createClipperPaths(map, tileSize) {
	var height = map.length;
	var width = map[0].length;

	return map.reduce((mem, columns, x) => {
		var left = x * tileSize;
		columns.forEach((tile, y) => {
			var top = y * tileSize;
			if (tile === 1) {
				mem.push([
					{ X: left, Y: top },
					{ X: left + tileSize, Y: top },
					{ X: left + tileSize, Y: top + tileSize },
					{ X: left, Y: top + tileSize },
				]);
			}
			else if (tile === BL) {
				mem.push([
					{ X: left, Y: top },
					{ X: left + tileSize, Y: top + tileSize },
					{ X: left, Y: top + tileSize },
				]);
			}
			else if (tile === TL) {
				mem.push([
					{ X: left, Y: top },
					{ X: left + tileSize, Y: top },
					{ X: left, Y: top + tileSize },
				]);
			}
			else if (tile === TR) {
				mem.push([
					{ X: left, Y: top },
					{ X: left + tileSize, Y: top },
					{ X: left + tileSize, Y: top + tileSize },
				]);
			}
			else if (tile === BR) {
				mem.push([
					{ X: left, Y: top + tileSize },
					{ X: left + tileSize, Y: top },
					{ X: left + tileSize, Y: top + tileSize },
				]);
			}
		});
		return mem;
	}, []);
}
