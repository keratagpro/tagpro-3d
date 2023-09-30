// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.3.1-dev
// @author        Kera
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/icon.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro*.koalabeast.com/game*
// @include       https://tagpro*.koalabeast.com/game*
// @include       http://tangent.jukejuice.com*
// @include       https://tangent.jukejuice.com*
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
// @require       https://unpkg.com/fast-average-color@9.4.0/dist/index.browser.js
// @require       https://unpkg.com/loglevel@1.8.0/lib/loglevel.js
// @require       https://unpkg.com/three@0.157.0/build/three.min.js
// ==/UserScript==

(function (tagpro, PIXI, THREE, fastAverageColor, log) {
	'use strict';

	const ballOptions = {
		useDominantColorFromTexture: true,
		velocityCoefficient: 0.1,
		rotationCoefficient: 0.015,
		geometry: {
			detail: 1,
			radius: 17,
		},
		materials: {
			default: {
				flatShading: true,
			},
			blue: {
				color: 0x0000ff,
			},
			red: {
				color: 0xff0000,
			},
		},
		outline: {
			enabled: true,
			detail: 2,
			radius: 19,
		},
		outlineMaterials: {
			default: {
				side: THREE.BackSide,
			},
			blue: {},
			red: {},
		},
	};

	const bombOptions = {
		materials: {
			body: {
				color: 0x000000,
			},
			show: {
				transparent: false,
				opacity: 1.0,
			},
			hide: {
				transparent: true,
				opacity: 0.2,
			},
		},
	};

	const cameraOptions = {
		near: 10,
		far: 10000,
		distance: 3000,
	};

	const lightOptions = [
		{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 },
		{ enabled: true, type: 'ambient', color: 0x666666 },
		{ enabled: true, type: 'directional', color: 0xffffff, intensity: 1.0, position: [-500, 500, -500] },
	];

	const puckOptions = {
		useOriginalTexture: true,
		rotationCoefficient: 0.01,
		geometry: {
			height: 10,
			radiusTop: 17,
			radiusBottom: 19,
			segments: 32,
		},
		materials: {
			top: {
				default: {
					color: 0x666666,
					side: THREE.DoubleSide,
					// transparent: true,
					// opacity: 0.9,
				},
				blue: {
					color: 0x00ffff,
				},
				red: {
					color: 0xffff00,
				},
			},
			side: {
				default: {
					color: 0x666666,
					side: THREE.DoubleSide,
					// transparent: true,
					// opacity: 0.9,
				},
				blue: {
					color: 0x0000ff,
				},
				red: {
					color: 0xff0000,
				},
			},
		},
	};

	const wallOptions = {
		useDominantColorFromTexture: true,
		useTexture: false,
		materials: {
			top: {
				color: 0x666666,
				opacity: 0.9,
				flatShading: true,
				transparent: true,
			},
			side: {
				color: 0x666666,
				opacity: 0.9,
				flatShading: true,
				transparent: true,
			},
		},
		extrude: {
			depth: 80,
			steps: 1,
			bevelEnabled: false,
			bevelSegments: 1,
			bevelSize: 5,
			bevelThickness: 10,
			bevelOffset: -5,
		},
		tiles: {
			top: {
				x: 5.5,
				y: 5.5,
			},
			side: {
				x: 5.5,
				y: 5.5,
			},
		},
	};

	const defaultOptions = {
		renderer: {
			antialias: true,
			alpha: true,
		},
		camera: cameraOptions,
		lights: lightOptions,
		objects: {
			ball: ballOptions,
			puck: puckOptions,
			wall: wallOptions,
			bomb: bombOptions,
		},
		ballsArePucks: false,
		ballsAre3D: true,
		wallsAre3D: true,
	};

	const RAD = 180 / Math.PI;
	function createCamera({ fov = 75, aspect = 1280 / 800, near, far, distance }) {
		const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.y = distance;
		camera.up.set(0, 0, -1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		return camera;
	}
	function updateCameraFOV(camera, gameCanvas) {
		camera.aspect = gameCanvas.width / gameCanvas.height;
		camera.fov = 2 * Math.atan(gameCanvas.height / (camera.position.y * 2)) * RAD;
		camera.updateProjectionMatrix();
	}
	function updateCameraPosition(camera, x, y) {
		camera.position.x = x - 19;
		camera.position.z = y - 19;
	}
	function updateCameraZoom(camera, zoom) {
		camera.zoom = 1 / zoom;
		camera.updateProjectionMatrix();
	}

	var camera = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		createCamera: createCamera,
		updateCameraFOV: updateCameraFOV,
		updateCameraPosition: updateCameraPosition,
		updateCameraZoom: updateCameraZoom,
	});

	function addAmbientLight(scene, { color = 0xffffff } = {}) {
		const light = new THREE.AmbientLight(color);
		scene.add(light);
		return light;
	}
	function addCameraLight(camera, { color = 0xffffff, intensity = 1, distance = 0, decay = 0 } = {}) {
		const light = new THREE.PointLight(color, intensity, distance, decay);
		camera.add(light);
		return light;
	}
	function addDirectionalLight(scene, { color = 0xffffff, intensity = 1.0, position = [500, -500, 400] } = {}) {
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(...position);
		scene.add(light);
		return light;
	}
	function addLights(lights, scene, camera) {
		for (const light of lights) {
			if (!light.enabled) return;
			if (light.type === 'camera') {
				addCameraLight(camera, light);
			} else if (light.type === 'ambient') {
				addAmbientLight(scene, light);
			} else if (light.type === 'directional') {
				addDirectionalLight(scene, light);
			}
		}
	}

	var lights = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		addAmbientLight: addAmbientLight,
		addCameraLight: addCameraLight,
		addDirectionalLight: addDirectionalLight,
		addLights: addLights,
	});

	const resizedImageCache = {};
	function resizeImage(image, width, height) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		context?.drawImage(image, 0, 0, canvas.width, canvas.height);
		return canvas;
	}
	function getOrCreatePowerOfTwoImage(image) {
		if (!resizedImageCache[image.src]) {
			const w = closestPowerOfTwo(image.width);
			const h = closestPowerOfTwo(image.height);
			const img = resizeImage(image, w, h);
			resizedImageCache[image.src] = img;
		}
		return resizedImageCache[image.src];
	}
	function closestPowerOfTwo(num) {
		return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
	}
	function cropImageToCanvas(image, x, y, width, height) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		context?.drawImage(image, x, y, width, height, 0, 0, width, height);
		return canvas;
	}

	function getDominantColor(canvas) {
		const fac = new fastAverageColor.FastAverageColor();
		const c = fac.getColor(canvas);
		if (c.error) {
			return new THREE.Color(0x333333);
		}
		return new THREE.Color(c.value[0] / 256, c.value[1] / 256, c.value[2] / 256);
	}
	const tileColorCache = {};
	function getDominantColorForTile(img, { x, y }, width = tagpro.TILE_SIZE, height = tagpro.TILE_SIZE) {
		const left = x * tagpro.TILE_SIZE;
		const top = y * tagpro.TILE_SIZE;
		const key = [img.src, left, top, width, height].join('-');
		if (!tileColorCache[key]) {
			const cropped = cropImageToCanvas(img, left, top, width, height);
			tileColorCache[key] = getDominantColor(cropped);
		}
		return tileColorCache[key];
	}

	class SpriteTexture extends THREE.Texture {
		columns;
		rows;
		x = 0;
		y = 0;
		constructor(image, columns, rows) {
			super(image);
			this.columns = columns;
			this.rows = rows;
			this.repeat.set(1 / columns, 1 / rows);
		}
		copy(source) {
			super.copy(source);
			this.columns = source.columns;
			this.rows = source.rows;
			return this;
		}
		setXY(x, y) {
			if (x === this.x && y === this.y) return;
			this.x = x;
			this.y = y;
			this.offset.set(x / this.columns, 1 - (y + 1) / this.rows);
			this.needsUpdate = true;
		}
		setTile({ x, y }) {
			this.setXY(x, y);
		}
	}

	function getTilesTexture() {
		return new SpriteTexture(
			getOrCreatePowerOfTwoImage(tagpro.tiles.image),
			tagpro.tiles.image.width / tagpro.TILE_SIZE,
			tagpro.tiles.image.height / tagpro.TILE_SIZE,
		);
	}
	function getTextureByTileId(tileId) {
		const texture = getTilesTexture();
		texture.setTile(tagpro.tiles[tileId]);
		return texture;
	}

	const tempQuaternion$1 = new THREE.Quaternion();
	const AXIS_X = new THREE.Vector3(1, 0, 0);
	const AXIS_Y$1 = new THREE.Vector3(0, 1, 0);
	const AXIS_Z = new THREE.Vector3(0, 0, 1);
	class Ball extends THREE.Mesh {
		options;
		outline;
		constructor(tileId, options) {
			const geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
			const material = new THREE.MeshPhongMaterial(options.materials.default);
			super(geometry, material);
			this.options = options;
			this.position.y = options.geometry.radius;
			if (options.outline.enabled) {
				this.addOutline(options.outline, options.outlineMaterials);
			}
			this.updateByTileId(tileId);
		}
		addOutline(params, materials) {
			const outline = new THREE.Mesh(
				new THREE.IcosahedronGeometry(params.radius, params.detail),
				new THREE.MeshBasicMaterial(materials.default),
			);
			this.add(outline);
			this.outline = outline;
		}
		updateByTileId(tileId) {
			const materialParams = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];
			if (this.options.useDominantColorFromTexture) {
				materialParams.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
			}
			this.material.setValues(materialParams);
			if (this.outline) {
				const outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];
				if (!outlineMaterial.color) {
					outlineMaterial.color = materialParams.color;
				}
				this.outline.material.setValues(outlineMaterial);
			}
		}
		updatePosition(player) {
			this.position.x = player.sprite.x;
			this.position.z = player.sprite.y;
			tempQuaternion$1.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.options.velocityCoefficient);
			this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
			tempQuaternion$1.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.options.velocityCoefficient);
			this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
			tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -(player.a || 0) * this.options.rotationCoefficient);
			this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
		}
	}

	const AXIS_Y = new THREE.Vector3(0, 1, 0);
	// const BALL_RADIUS = 38;
	const tempQuaternion = new THREE.Quaternion();
	class Puck extends THREE.Mesh {
		options;
		tileTexture;
		constructor(tileId, options) {
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
			this.options = options;
			this.position.y = options.geometry.height / 2;
			if (options.useOriginalTexture) {
				if (!this.tileTexture) {
					this.tileTexture = getTilesTexture();
					topMaterial.map = this.tileTexture;
				}
				const texture = this.tileTexture;
				// HACK: Shrink texture mapping since ball is 38px, not 40px.
				texture.offset.x += 1 / tagpro.TILE_SIZE / 16;
				texture.offset.y += 1 / tagpro.TILE_SIZE / 11;
				texture.repeat.x -= 2 / tagpro.TILE_SIZE / 16;
				texture.repeat.y -= 2 / tagpro.TILE_SIZE / 11;
			}
			this.updateByTileId(tileId);
		}
		updateByTileId(tileId) {
			const { side, top } = this.options.materials;
			const sideParams = side[tileId === 'redball' ? 'red' : 'blue'];
			const topParams = top[tileId === 'redball' ? 'red' : 'blue'];
			const [sideMaterial, topMaterial] = this.material;
			sideMaterial.setValues(sideParams);
			topMaterial.setValues(topParams);
			if (this.options.useOriginalTexture) {
				const texture = topMaterial.map;
				texture.setTile(tagpro.tiles[tileId]);
			}
		}
		updatePosition(player) {
			this.position.x = player.sprite.x;
			this.position.z = player.sprite.y;
			tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
			this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
		}
	}

	function createBall(player, options) {
		const tileId = player.team === 1 ? 'redball' : 'blueball';
		if (options.ballsArePucks) {
			return new Puck(tileId, options.objects.puck);
		} else {
			return new Ball(tileId, options.objects.ball);
		}
	}

	var objects = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		createBall: createBall,
	});

	function createRenderer(parameters) {
		const renderer = new THREE.WebGLRenderer(parameters);
		return renderer;
	}
	function createScene() {
		const scene = new THREE.Scene();
		return scene;
	}
	function resizeCanvas(gameCanvas, renderer) {
		if (!renderer) {
			return;
		}
		// renderer.domElement.width = gameCanvas.width;
		// renderer.domElement.height = gameCanvas.height;
		renderer.setSize(gameCanvas.width, gameCanvas.height);
	}

	var scene = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		createRenderer: createRenderer,
		createScene: createScene,
		resizeCanvas: resizeCanvas,
	});

	// import { SpriteTexture } from './utils/SpriteTexture';
	const WALL = 1;
	const BL = 1.1; // ◣ bottom left
	const TL = 1.2; // ◤ top left
	const TR = 1.3; // ◥ top right
	const BR = 1.4; // ◢ bottom right
	function pointsToShape({ points, offset = 0, scale = 1 }) {
		return new THREE.Shape(points.map(([x, y]) => new THREE.Vector2((x + offset) * scale, (y + offset) * scale)));
	}
	const squareShape = pointsToShape({
		points: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		offset: -0.5,
		scale: tagpro.TILE_SIZE,
	});
	const diagonalShape = pointsToShape({
		points: [
			[0, 1],
			[1, 1],
			[0, 0],
		],
		offset: -0.5,
		scale: tagpro.TILE_SIZE,
	});
	function extractWallTiles(map) {
		const squares = [];
		const diagonals = [];
		for (let y = 0, rows = map.length; y < rows; y++) {
			const row = map[y];
			for (let x = 0, cols = row.length; x < cols; x++) {
				const tile = row[x];
				switch (tile) {
					case WALL:
						squares.push({ x, y });
						break;
					case TR:
						diagonals.push({ x, y, angle: 0 });
						break;
					case TL:
						diagonals.push({ x, y, angle: 90 });
						break;
					case BL:
						diagonals.push({ x, y, angle: 180 });
						break;
					case BR:
						diagonals.push({ x, y, angle: 270 });
						break;
				}
			}
		}
		return { squares, diagonals };
	}
	function createWalls(map, options) {
		const { top: topMaterialParams, side: sideMaterialParams } = options.materials;
		if (options.useTexture) {
			// const cols = tiles.image.width / TILE_SIZE;
			// const rows = tiles.image.height / TILE_SIZE;
			// const topWallTexture = getTilesTexture();
			// setTextureOffset(topWallTexture, cols, rows, options.tiles.top);
			const topWallTexture = getTextureByTileId('1.421');
			topMaterialParams.map = topWallTexture;
			// const sideWallTexture = getTilesTexture();
			// setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);
			const sideWallTexture = getTextureByTileId('1.421');
			sideMaterialParams.map = sideWallTexture;
		}
		if (options.useDominantColorFromTexture) {
			topMaterialParams.color = getDominantColorForTile(tagpro.tiles.image, options.tiles.top);
			sideMaterialParams.color = getDominantColorForTile(tagpro.tiles.image, options.tiles.side);
		}
		const wallMaterials = [
			new THREE.MeshPhongMaterial(topMaterialParams),
			new THREE.MeshPhongMaterial(sideMaterialParams),
		];
		const { squares, diagonals } = extractWallTiles(map);
		const squareGeometry = new THREE.ExtrudeGeometry(squareShape, options.extrude);
		const squareMesh = new THREE.InstancedMesh(squareGeometry, wallMaterials, squares.length);
		squareMesh.name = 'walls-squares';
		for (let i = 0; i < squares.length; i++) {
			const square = squares[i];
			const matrix = new THREE.Matrix4();
			matrix.setPosition(square.x * tagpro.TILE_SIZE, square.y * tagpro.TILE_SIZE, 0);
			squareMesh.setMatrixAt(i, matrix);
		}
		const scale = new THREE.Vector3(1, 1, 1);
		const diagonalGeometry = new THREE.ExtrudeGeometry(diagonalShape, options.extrude);
		const diagonalMesh = new THREE.InstancedMesh(diagonalGeometry, wallMaterials, diagonals.length);
		diagonalMesh.name = 'walls-diagonals';
		for (let i = 0; i < diagonals.length; i++) {
			const diagonal = diagonals[i];
			const matrix = new THREE.Matrix4();
			const pos = new THREE.Vector3(diagonal.x * tagpro.TILE_SIZE, diagonal.y * tagpro.TILE_SIZE, 0);
			const rot = new THREE.Euler();
			rot.z = THREE.MathUtils.degToRad(diagonal.angle);
			const quaternion = new THREE.Quaternion();
			quaternion.setFromEuler(rot);
			matrix.compose(pos, quaternion, scale);
			diagonalMesh.setMatrixAt(i, matrix);
		}
		const wallObject = new THREE.Object3D();
		wallObject.name = 'walls';
		wallObject.add(squareMesh, diagonalMesh);
		wallObject.rotation.set(Math.PI * 1.5, 0, Math.PI * 1.5);
		return wallObject;
	}
	// function setTextureOffset(texture: SpriteTexture, cols: number, rows: number, tile: TileParams) {
	// 	const x = tile.x / cols;
	// 	const y = 1 - tile.y / rows;
	// 	const w = (tile.width || 1) / cols;
	// 	const h = (tile.height || 1) / rows;
	// 	texture.offset.set(x, y);
	// 	texture.repeat.set(w, -h);
	// 	texture.needsUpdate = true;
	// }

	var walls = /*#__PURE__*/ Object.freeze({
		__proto__: null,
		createWalls: createWalls,
	});

	class Renderer3D {
		options;
		camera;
		scene;
		renderer;
		players = {};
		constructor(options) {
			this.options = options;
			this.camera = createCamera(this.options.camera);
			this.scene = createScene();
			this.scene.add(this.camera);
		}
	}
	Object.assign(Renderer3D.prototype, camera, lights, objects, scene, walls);

	function after(obj, methodName, callback) {
		const original = obj[methodName];
		Object.assign(original, {
			[methodName]() {
				const result = original.apply(this, arguments);
				callback.apply(this, arguments);
				return result;
			},
		});
	}

	const textureLoader = new THREE.TextureLoader();
	textureLoader.setCrossOrigin('');
	new THREE.ObjectLoader();

	const originalFactory = log.default.methodFactory;
	log.default.methodFactory = function (methodName, logLevel, loggerName) {
		const rawMethod = originalFactory(methodName, logLevel, loggerName);
		return function (message) {
			rawMethod('[TagPro3D] ' + message);
		};
	};
	log.default.setLevel(log.default.getLevel());

	function isInGame() {
		return tagpro.state > 0;
	}

	function createRenderer3D() {
		const t3d = new Renderer3D(defaultOptions);
		const tr = tagpro.renderer;
		//
		// Renderer
		//
		let threeTexture;
		after(tr, 'createBackground', function () {
			const canvas3D = document.createElement('canvas');
			canvas3D.width = tr.canvas.width;
			canvas3D.height = tr.canvas.height;
			threeTexture = PIXI.Texture.fromCanvas(canvas3D);
			const threeSprite = new PIXI.Sprite(threeTexture);
			threeSprite.name = 'tagpro3d';
			threeSprite.interactiveChildren = false;
			/* eslint-disable @typescript-eslint/no-empty-function */
			threeSprite.updateTransform = function () {};
			tr.layers.foreground.addChild(threeSprite);
			t3d.renderer = t3d.createRenderer({
				...t3d.options.renderer,
				canvas: canvas3D,
			});
			t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
		});
		after(tr, 'updateGraphics', function () {
			t3d.renderer?.render(t3d.scene, t3d.camera);
			threeTexture.update();
		});
		//
		// Camera
		//
		after(tr, 'centerView', function () {
			t3d.resizeCanvas(tr.canvas, t3d.renderer);
			t3d.updateCameraFOV(t3d.camera, tr.canvas);
		});
		after(tr, 'centerContainerToPoint', function (x, y) {
			t3d.updateCameraPosition(t3d.camera, x, y);
		});
		let zoom;
		after(tr, 'updateCameraZoom', function () {
			if (zoom !== tagpro.zoom) {
				zoom = tagpro.zoom;
				t3d.updateCameraZoom(t3d.camera, zoom);
			}
		});
		//
		// Balls
		//
		if (t3d.options.ballsAre3D) {
			const players = t3d.players;
			after(tr, 'createBallSprite', (player) => {
				const ball3D = t3d.createBall(player, t3d.options);
				players[player.id] = {
					team: player.team,
					object3D: ball3D,
				};
				t3d.scene.add(ball3D);
				log.default.info('Created 3D ball for ' + player.id);
			});
			after(tr, 'updatePlayerColor', (player) => {
				const player3D = t3d.players[player.id];
				if (player.team !== player3D.team) {
					player3D.team = player.team;
					player3D.object3D.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
				}
			});
			after(tr, 'updatePlayerVisibility', function (player) {
				const player3D = t3d.players[player.id];
				player3D.object3D.visible = player.sprite.visible;
				// Hide the 2D ball
				player.sprites.actualBall.visible = false;
			});
			after(tr, 'updatePlayerSpritePosition', (player) => {
				const player3D = t3d.players[player.id];
				player3D.object3D.updatePosition(player);
			});
			after(tr, 'destroyPlayer', function (player) {
				const player3D = t3d.players[player.id];
				t3d.scene.remove(player3D.object3D);
				delete t3d.players[player.id];
			});
		}
		//
		// Walls
		//
		if (t3d.options.wallsAre3D) {
			after(tr, 'createBackgroundTexture', () => {
				const walls3D = t3d.createWalls(tagpro.map, t3d.options.objects.wall);
				t3d.scene.add(walls3D);
				log.default.info('Created 3D walls.');
			});
		}
		return t3d;
	}

	/**
	 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
	 * between tagpro.ready and tagpro.ready.after.
	 */
	tagpro.ready.after = function (callback) {
		if (tagpro.resourcesLoaded) {
			setTimeout(callback, 0);
		} else {
			tagpro._afterReadyCallbacks.push(callback);
		}
	};
	tagpro.ready(function () {
		log.default.setLevel('info');
		if (isInGame()) {
			log.default.info('Initializing.');
			createRenderer3D();
			log.default.info('Initialized.');
		}
	});
})(tagpro, PIXI, THREE, FastAverageColor, log);
