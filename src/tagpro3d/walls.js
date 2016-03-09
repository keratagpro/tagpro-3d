import * as THREE from 'three';

import * as Clipper from '../lib/clipper';
import { textureLoader } from './utils';

const BL = 1.1; // ◣ bottom left
const TL = 1.2; // ◤ top left
const TR = 1.3; // ◥ top right
const BR = 1.4; // ◢ bottom right

export function createWalls(map, backgroundTextures, tilesImage) {
	var params = this.options.objects.wall;
	var extrude = params.extrude;
	var tileSize = this.TILE_SIZE;

	var chunkedShapes = createChunkedShapes(map, backgroundTextures, tileSize);

	var geometry;
	chunkedShapes.forEach((chunk, index) => {
		var options = Object.assign({
			UVGenerator: createUVGenerator(chunk, index + 1, 0),
			material: index // NOTE: This doesn't work since THREE.js r74
		}, extrude);

		if (!geometry) {
			geometry = new THREE.ExtrudeGeometry(chunk.shapes, options);
		}
		else {
			geometry.addShapeList(chunk.shapes, options);
		}
	});


	var materials = backgroundTextures.map(({ texture }) => {
		let opts = Object.assign({}, params.material, {
			map: texture
		});

		return new THREE.MeshPhongMaterial(opts);
	});

	let opts = Object.assign({}, params.material, {
		map: textureLoader.load(tilesImage)
	});

	var tileMaterial = new THREE.MeshPhongMaterial(opts);
	materials.unshift(tileMaterial);

	var material = new THREE.MultiMaterial(materials);

	var mesh = new THREE.Mesh(geometry, material);
	mesh.name = 'walls';
	mesh.rotateX(Math.PI / 2);
	mesh.position.set(-tileSize / 2, extrude.amount, -tileSize / 2);

	this.scene.add(mesh);

	// var edges = new THREE.EdgesHelper(mesh, 0x000000);
	// this.scene.add(edges);

	return mesh;
}

function createUVGenerator({ x, y, width, height }, index, sideIndex) {
	return {
		generateTopUV(geometry, indexA, indexB, indexC) {
			var vertices = geometry.vertices;
			var a = vertices[indexA];
			var b = vertices[indexB];
			var c = vertices[indexC];

			// HACK: THREE.js r74 removed material index for some reason, see their issue #7332 and commit 661ce3ad22...
			geometry.faces[geometry.faces.length - 1].materialIndex = index;

			return [
				new THREE.Vector2((a.x - x) / width, 1 - (a.y - y) / height),
				new THREE.Vector2((b.x - x) / width, 1 - (b.y - y) / height),
				new THREE.Vector2((c.x - x) / height, 1 - (c.y - y) / height),
			];
		},
		generateSideWallUV(geometry, indexA, indexB, indexC, indexD) {
			// HACK: Set sidewall materialIndex
			var len = geometry.faces.length - 1;
			geometry.faces[len - 1].materialIndex = sideIndex;
			geometry.faces[len].materialIndex = sideIndex;

			var w = 16 * 40;
			var h = 11 * 40;

			var left = (5.5 * 40) / w;
			var right = (6.5 * 40) / w;
			var top = (5.5 * 40) / h;
			var bottom = (6.5 * 40) / h;

			return [
				new THREE.Vector2(left, 1 - top),
				new THREE.Vector2(left, 1 - bottom),
				new THREE.Vector2(right, 1 - bottom),
				new THREE.Vector2(right, 1 - top)
			];
		}
	};
}

function createChunkedShapes(map, textures, tileSize = 40) {
	var paths = createPathsFromTileMap(map, tileSize);
	paths = Clipper.SimplifyAndLighten(paths, tileSize / 4);

	var clipper = new Clipper.Clipper();

	var results = textures.map(({ x, y, width, height }) => {
		clipper.Clear();

		clipper.AddPaths(paths, Clipper.PolyType.Subject, true);

		let clip = [
			{ X: x, Y: y },
			{ X: x + width, Y: y },
			{ X: x + width, Y: y + height },
			{ X: x, Y: y + height }
		];

		clipper.AddPaths([clip], Clipper.PolyType.Clip, true);

		var result = new Clipper.PolyTree();
		clipper.Execute(Clipper.ClipType.Intersection, result);

		var polygons = Clipper.PolyTreeToExPolygons(result);

		var shapes = createThreeShapesFromExPolygons(polygons);

		return {
			x,
			y,
			width,
			height,
			shapes
		};
	});

	return results;
}

function createThreeShapesFromExPolygons(polygons) {
	return polygons.map(({ outer, holes }) => {
		var shape = new THREE.Shape();

		outer.forEach(({ X: x, Y: y }) => shape.moveTo(x, y));

		shape.holes = holes.map(hole => {
			var holeShape = new THREE.Shape();
			hole.forEach(({ X: x, Y: y }) => holeShape.moveTo(x, y));

			return holeShape;
		});

		return shape;
	});
}

// Output is either new PolyTree() or new Paths()
// Get polygons with JS.PolyTreeToExPolygons()
function dilutePaths(output, paths, delta = 0, miterLimit = 20, arcTolerance = 0.25) {
	var co = new Clipper.Offset(miterLimit, arcTolerance);
	co.AddPaths(paths, Clipper.JoinType.Miter, Clipper.EndType.ClosedPolygon);
	co.Execute(output, delta);
}

function createPathsFromTileMap(map, tileSize) {
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
