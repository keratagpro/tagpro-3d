// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.0.3
// @author        Kera
// @grant         GM_addStyle
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/3d.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r74/three.min.js
// @require       https://keratagpro.github.io/tagpro-3d/clipper.min.js
// @require       https://keratagpro.github.io/tagpro-3d/rgbquant.js
// ==/UserScript==

(function (tagpro,THREE,$,RgbQuant,ClipperLib) {
	'use strict';

	var tagpro__default = 'default' in tagpro ? tagpro['default'] : tagpro;
	$ = 'default' in $ ? $['default'] : $;
	RgbQuant = 'default' in RgbQuant ? RgbQuant['default'] : RgbQuant;

	var babelHelpers = {};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	babelHelpers.defineProperty = function (obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	};

	babelHelpers.inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	babelHelpers.possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	babelHelpers.slicedToArray = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (Symbol.iterator in Object(arr)) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

	babelHelpers;

	function after(obj, methodName, callback) {
		var orig = obj[methodName];
		obj[methodName] = function () {
			var result = orig.apply(this, arguments);
			callback.apply(this, arguments);
			return result;
		};
	}

	function addStyles(styles) {
		GM_addStyle(styles);
	}

	// https://www.reddit.com/r/TagPro/wiki/api#wiki_tiles

	var SPIKE = 7;
	var BUTTON = 8;
	var GATE_OFF = 9;
	var GATE_GREEN = 9.1;
	var GATE_RED = 9.2;
	var GATE_BLUE = 9.3;
	var BOMB = 10;
	var BOMB_OFF = 10.1;
	var ENDZONE_RED = 17;
	var ENDZONE_BLUE = 18;

	var POWERUP_NONE = 6;
	var POWERUP_GRIP = 6.1;
	var POWERUP_BOMB = 6.2;
	var POWERUP_TAGPRO = 6.3;
	var POWERUP_SPEED = 6.4;

	/**
	 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
	 * between tagpro.ready and tagpro.ready.after.
	 */
	function readyAfter(tagpro, callback) {
		if (tagpro.resourcesLoaded) {
			setTimeout(callback, 0);
		} else {
			tagpro._afterReadyCallbacks.push(callback);
		}
	}

	/**
	 * Draws some extra tiles to the background layer.
	 */
	function changeSomeTilesToFloorTiles(tiles) {
		var flooredTiles = [GATE_OFF, GATE_GREEN, GATE_RED, GATE_BLUE, ENDZONE_RED, ENDZONE_BLUE];

		flooredTiles.forEach(function (tile) {
			tiles[tile].drawFloor = true;
			tiles[tile].redrawFloor = false;
		});
	}

	var styles = "#tagpro3d {\r\n\tdisplay: block;\r\n\tpointer-events: none;\r\n\tposition: absolute;\r\n\tz-index: 1;\r\n}\r\n\r\n#viewport {\r\n\tz-index: 2;\r\n}\r\n\r\n#options {\r\n\tz-index: 3;\r\n}\r\n";

	function addAmbientLight(scene) {
		var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var _ref$color = _ref.color;
		var color = _ref$color === undefined ? 0xffffff : _ref$color;

		var light = new THREE.AmbientLight(color);
		scene.add(light);
		return light;
	}

	function addCameraLight(camera) {
		var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var _ref2$color = _ref2.color;
		var color = _ref2$color === undefined ? 0xffffff : _ref2$color;
		var _ref2$intensity = _ref2.intensity;
		var intensity = _ref2$intensity === undefined ? 1 : _ref2$intensity;
		var _ref2$distance = _ref2.distance;
		var distance = _ref2$distance === undefined ? 0 : _ref2$distance;
		var _ref2$decay = _ref2.decay;
		var decay = _ref2$decay === undefined ? 0 : _ref2$decay;

		var light = new THREE.PointLight(color, intensity, distance, decay);
		camera.add(light);
		return light;
	}

	function addDirectionalLight(scene) {
		var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var _ref3$color = _ref3.color;
		var color = _ref3$color === undefined ? 0xffffff : _ref3$color;
		var _ref3$intensity = _ref3.intensity;
		var intensity = _ref3$intensity === undefined ? 1.0 : _ref3$intensity;
		var _ref3$position = _ref3.position;
		var position = _ref3$position === undefined ? [500, -500, 400] : _ref3$position;

		var light = new THREE.DirectionalLight(color, intensity);
		light.position.set.apply(light.position, position);
		scene.add(light);
		return light;
	}

	function addLights(lights, scene, camera) {
		lights.forEach(function (light) {
			if (!light.enabled) return;

			if (light.type === 'camera') {
				addCameraLight(camera, light);
			} else if (light.type === 'ambient') {
				addAmbientLight(scene, light);
			} else if (light.type === 'directional') {
				addDirectionalLight(scene, light);
			}
		});
	}

var lights = Object.freeze({
		addAmbientLight: addAmbientLight,
		addCameraLight: addCameraLight,
		addDirectionalLight: addDirectionalLight,
		addLights: addLights
	});

	var textureLoader = new THREE.TextureLoader();
	textureLoader.setCrossOrigin('');

	var objectLoader = new THREE.ObjectLoader();

	var RAD = 180 / Math.PI;

	function createRenderer(params) {
		var renderer = new THREE.WebGLRenderer(params);

		renderer.domElement.id = 'tagpro3d';
		document.body.appendChild(renderer.domElement);

		return renderer;
	}

	function createCamera(_ref) {
		var _ref$fov = _ref.fov;
		var fov = _ref$fov === undefined ? 75 : _ref$fov;
		var _ref$aspect = _ref.aspect;
		var aspect = _ref$aspect === undefined ? 1280 / 800 : _ref$aspect;
		var near = _ref.near;
		var far = _ref.far;
		var distance = _ref.distance;

		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.y = distance;
		camera.up.set(0, 0, -1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		return camera;
	}

	function createScene() {
		var scene = new THREE.Scene();
		return scene;
	}

	function resizeCanvas(renderer, gameCanvas) {
		$(renderer.domElement).css({
			left: gameCanvas.offsetLeft,
			top: gameCanvas.offsetTop,
			width: null,
			height: null
		}).attr({
			width: gameCanvas.width,
			height: gameCanvas.height
		});

		renderer.setSize(gameCanvas.width, gameCanvas.height);
	}

	function updateCameraFOV(camera, gameCanvas) {
		camera.aspect = gameCanvas.width / gameCanvas.height;
		camera.fov = 2 * Math.atan(gameCanvas.height / (camera.position.y * 2)) * RAD;
		camera.updateProjectionMatrix();
	}

	function updateCameraPosition(camera, x, y) {
		camera.position.x = x - 20;
		camera.position.z = y - 20;
	}

	function updateCameraZoom(camera, zoom) {
		camera.zoom = 1 / zoom;
		camera.updateProjectionMatrix();
	}

	// TODO: Use single PlaneGeometry with faceVertexUvs.
	function createBackgroundPlaneFromChunks(chunks) {
		var plane = new THREE.Object3D();
		plane.position.x = -19;
		plane.position.z = -19;

		var geometry;
		chunks.forEach(function (_ref2) {
			var x = _ref2.x;
			var y = _ref2.y;
			var width = _ref2.width;
			var height = _ref2.height;
			var texture = _ref2.texture;

			if (!geometry) {
				geometry = new THREE.PlaneGeometry(width, height, 1, 1);
				geometry.rotateX(-Math.PI / 2);
				geometry.translate(width / 2, 0, height / 2);
			} else {
				geometry = geometry.clone();
			}

			var material = new THREE.MeshPhongMaterial({
				map: new THREE.CanvasTexture(texture.baseTexture.source)
			});

			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = x;
			mesh.position.z = y;

			plane.add(mesh);
		});

		return plane;
	}

	function mapBackgroundChunksToTextures(chunks) {
		return chunks.map(function (_ref3) {
			var x = _ref3.x;
			var y = _ref3.y;
			var width = _ref3.width;
			var height = _ref3.height;
			var texture = _ref3.texture;
			return {
				x: x, y: y, width: width, height: height,
				texture: new THREE.CanvasTexture(texture.baseTexture.source)
			};
		});
	}

	function loadObjectFromJson(json) {
		var mesh = objectLoader.parse(json);
		// mesh.rotateZ(Math.PI);
		return mesh;
	}

	function findDominantColorForTile(tile) {
		var tileSize = arguments.length <= 1 || arguments[1] === undefined ? tagpro.TILE_SIZE : arguments[1];

		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = tileSize;
		canvas.height = tileSize;

		context.drawImage(tagpro.tiles.image, tile.x * tileSize, tile.y * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);

		var quantizer = new RgbQuant({
			colors: 4
		});

		quantizer.sample(canvas);

		var palette = quantizer.palette(true, true);

		if (!palette) {
			return null;
		}

		palette = palette.map(function (_ref4) {
			var _ref5 = babelHelpers.slicedToArray(_ref4, 3);

			var r = _ref5[0];
			var g = _ref5[1];
			var b = _ref5[2];
			return new THREE.Color(r / 256, g / 256, b / 256);
		});

		// Try to find a non-grayscale color.
		var color = palette.find(function (col) {
			return col.getHSL().s > 0.5;
		});

		return color || palette[0];
	}

var utils = Object.freeze({
		textureLoader: textureLoader,
		objectLoader: objectLoader,
		createRenderer: createRenderer,
		createCamera: createCamera,
		createScene: createScene,
		resizeCanvas: resizeCanvas,
		updateCameraFOV: updateCameraFOV,
		updateCameraPosition: updateCameraPosition,
		updateCameraZoom: updateCameraZoom,
		createBackgroundPlaneFromChunks: createBackgroundPlaneFromChunks,
		mapBackgroundChunksToTextures: mapBackgroundChunksToTextures,
		loadObjectFromJson: loadObjectFromJson,
		findDominantColorForTile: findDominantColorForTile
	});

	var tempQuaternion = new THREE.Quaternion();
	var AXIS_X = new THREE.Vector3(1, 0, 0);
	var AXIS_Y = new THREE.Vector3(0, 1, 0);
	var AXIS_Z = new THREE.Vector3(0, 0, 1);

	var ballTileColors = {};

	var Ball = function (_THREE$Mesh) {
		babelHelpers.inherits(Ball, _THREE$Mesh);

		function Ball(options) {
			babelHelpers.classCallCheck(this, Ball);

			var material = new THREE.MeshPhongMaterial();
			var geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
			// var geometry = new THREE.SphereGeometry(options.geometry.radius, 12, 8);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Ball).call(this, geometry, material));

			_this.options = options;
			_this._createOutline();

			_this.position.y = options.geometry.radius;
			return _this;
		}

		babelHelpers.createClass(Ball, [{
			key: '_createOutline',
			value: function _createOutline() {
				var outline = this.options.outline;

				if (outline && outline.enabled) {
					var radius = this.options.geometry.radius;
					var geometry = new THREE.IcosahedronGeometry(radius, outline.detail);

					this.outlineMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
					this.add(new THREE.Mesh(geometry, this.outlineMaterial));

					var scale = 1 - outline.width / radius;
					this.geometry.scale(scale, scale, scale);
				}
			}
		}, {
			key: 'updateColor',
			value: function updateColor(player) {
				var tileName = player.team === 1 ? 'redball' : 'blueball';

				var materials = this.options.materials;
				this.material.setValues(player.team === 1 ? materials.red : materials.blue);

				if (!ballTileColors[tileName]) {
					var tile = tagpro.tiles[tileName];
					ballTileColors[tileName] = findDominantColorForTile(tile);
				}

				this.material.color = ballTileColors[tileName];

				var outline = this.options.outline;
				if (outline && outline.enabled) {
					this.outlineMaterial.setValues(player.team === 1 ? outline.red : outline.blue);
					this.outlineMaterial.color = ballTileColors[tileName];
				}
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				this.position.x = player.sprite.x;
				this.position.z = player.sprite.y;

				tempQuaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.options.velocityCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

				tempQuaternion.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.options.velocityCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

				tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.options.rotationCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
			}
		}]);
		return Ball;
	}(THREE.Mesh);

	var metadata = { "version": 4.4, "type": "Object", "generator": "Object3D.toJSON" };
	var geometries = [{ "uuid": "533B036E-7BD8-412A-9826-C270344C731B", "type": "SphereGeometry", "radius": 16, "widthSegments": 16, "heightSegments": 16, "phiStart": 0, "phiLength": 6.283185307179586, "thetaStart": 0, "thetaLength": 3.141592653589793 }, { "uuid": "EDC5A60E-30F9-46AD-8F00-57694EA6046F", "type": "CylinderGeometry", "radiusTop": 2, "radiusBottom": 3, "height": 3, "radialSegments": 32, "heightSegments": 1, "openEnded": false }, { "uuid": "D0B38B94-F57F-43DA-B2D5-EE90F990436E", "type": "TorusGeometry", "radius": 4.38, "tube": 0.76, "radialSegments": 8, "tubularSegments": 4, "arc": 1.5 }];
	var materials = [{ "uuid": "1F3DD044-3AE4-4584-86A8-C8456E25A261", "type": "MeshPhongMaterial", "color": 0, "emissive": 0, "specular": 1118481, "shininess": 30 }, { "uuid": "F74765F4-EA20-4137-94DD-F083E9E5D714", "type": "MeshPhongMaterial", "color": 8421504, "emissive": 0, "specular": 1118481, "shininess": 30 }, { "uuid": "0E765FB3-278F-4EFE-BE0F-656922DD6B22", "type": "MeshPhongMaterial", "color": 16777215, "emissive": 0, "specular": 1118481, "shininess": 30 }];
	var object = { "uuid": "DA35D27C-42A2-431C-88DE-E56516B50BBC", "type": "Mesh", "name": "bomb", "matrix": [0.7899922132492065, -0.4315394461154938, 0.43552955985069275, 0, 0.6131168603897095, 0.5560322999954224, -0.5611735582351685, 0, 0, 0.7103532552719116, 0.7038453221321106, 0, 0, 0, 0, 1], "geometry": "533B036E-7BD8-412A-9826-C270344C731B", "material": "1F3DD044-3AE4-4584-86A8-C8456E25A261", "children": [{ "uuid": "3DD112B4-0A42-4E6A-A96D-5BF76D3D877D", "type": "Mesh", "name": "head", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.36041587591171265, 16.43364143371582, 2.5216023921966553, 1], "geometry": "EDC5A60E-30F9-46AD-8F00-57694EA6046F", "material": "F74765F4-EA20-4137-94DD-F083E9E5D714", "children": [{ "uuid": "36583292-82F4-43A0-A341-165C18F8536A", "type": "Mesh", "name": "fuse", "matrix": [-0.7485897541046143, -0.19866932928562164, 0.6325692534446716, 0, -0.15174666047096252, 0.9800665974617004, 0.12822814285755157, 0, -0.6454349756240845, 0, -0.7638152241706848, 0, 3.29097580909729, 1.9205838441848755, -2.8663127422332764, 1], "geometry": "D0B38B94-F57F-43DA-B2D5-EE90F990436E", "material": "0E765FB3-278F-4EFE-BE0F-656922DD6B22" }] }] };
	var bombJson = {
		metadata: metadata,
		geometries: geometries,
		materials: materials,
		object: object
	};

	var ball = {
		enabled: true,
		velocityCoefficient: 0.1,
		rotationCoefficient: 0.015,
		geometry: {
			radius: 19,
			detail: 1
		},
		materials: {
			blue: {
				shading: THREE.FlatShading,
				color: 0x0000ff
			},
			red: {
				shading: THREE.FlatShading,
				color: 0xff0000
			}
		},
		outline: {
			enabled: true,
			detail: 2,
			width: 1,
			blue: {
				color: 0x0000bb
			},
			red: {
				color: 0xbb0000
			}
		}
	};

	var puck = {
		enabled: true,
		rotationCoefficient: 0.01,
		geometry: {
			radiusTop: 17,
			radiusBottom: 19,
			height: 10,
			segments: 32
		},
		materials: {
			default: {
				transparent: true,
				alphaTest: 0.1,
				opacity: 0.9,
				shading: THREE.FlatShading,
				side: THREE.DoubleSide
			},
			blue: {
				color: 0x0000ff
			},
			red: {
				color: 0xff0000
			}
		}
	};

	var wall = {
		material: {
			shading: THREE.FlatShading,
			color: 0xffffff
		},
		// opacity: 1.0,
		// transparent: true
		extrude: {
			amount: 40,
			steps: 1,
			bevelEnabled: false,
			bevelSegments: 1,
			bevelSize: 5,
			bevelThickness: 10
		}
	};

	var spike = {
		geometry: {
			width: 32,
			segments: 6
		},
		material: {
			// color: 0x666666,
			opacity: 1
		}
	};

	var bomb = {
		materials: {
			body: {
				color: 0x000000
			},
			show: {
				transparent: false,
				opacity: 1.0
			},
			hide: {
				transparent: true,
				opacity: 0.2
			}
		}
	};

	var button = {
		geometry: {
			width: 16,
			height: 10,
			segments: 20
		},
		material: {
			color: 0xa06e32
		}
	};

	var flag = {
		animate: false,
		width: 40,
		height: 20,
		waveDepth: 4,
		widthSegments: 10,
		heightSegments: 5,
		restDistance: 4
	};

	var gate = {
		geometry: {
			width: 40
		},
		materials: {
			default: {
				transparent: true,
				opacity: 0.7
			},
			off: {
				opacity: 0.2
			},
			green: {
				opacity: 0.7
			},
			red: {
				opacity: 0.7
			},
			blue: {
				opacity: 0.7
			}
		},
		outlineMaterials: {
			default: {}
		},
		extrude: {
			amount: 40,
			bevelEnabled: true,
			bevelSegments: 1,
			bevelSize: 6,
			bevelThickness: 10
		}
	};

var objects$1 = Object.freeze({
		ball: ball,
		puck: puck,
		wall: wall,
		spike: spike,
		bomb: bomb,
		button: button,
		flag: flag,
		gate: gate
	});

	var Bomb = function (_THREE$Object3D) {
		babelHelpers.inherits(Bomb, _THREE$Object3D);

		function Bomb(tileId) {
			var _ref = arguments.length <= 1 || arguments[1] === undefined ? bomb : arguments[1];

			var materials = _ref.materials;
			babelHelpers.classCallCheck(this, Bomb);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Bomb).call(this));

			_this.materials = materials;

			_this.add(loadObjectFromJson(bombJson));
			_this.getObjectByName('bomb').material.setValues(materials.body);

			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Bomb, [{
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				if (tileId == BOMB) this.show();else if (tileId == BOMB_OFF) this.hide();
			}
		}, {
			key: 'show',
			value: function show() {
				var params = this.materials.show;

				this.traverse(function (o) {
					if (!o.material) return;
					o.material.setValues(params);
				});
			}
		}, {
			key: 'hide',
			value: function hide() {
				var params = this.materials.hide;

				this.traverse(function (o) {
					if (!o.material) return;
					o.material.setValues(params);
				});
			}
		}]);
		return Bomb;
	}(THREE.Object3D);

	function createRectangleShape(width) {
		var half = width / 2;

		var shape = new THREE.Shape();
		shape.moveTo(-half, -half);
		shape.lineTo(half, -half);
		shape.lineTo(half, half);
		shape.lineTo(-half, half);

		return shape;
	}

	function createRectangleGeometry(width) {
		var extrude = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var shape = createRectangleShape(width);

		var geometry = extrudeShape(shape, extrude, width);

		return geometry;
	}

	function extrudeShape(shape, extrude, width) {
		var radius = width / 2;
		var geometry = shape.extrude(extrude);
		geometry.translate(0, 0, -extrude.amount);

		if (extrude.bevelEnabled) {
			var xy = 1 / ((radius + extrude.bevelSize) / radius);
			geometry.scale(xy, xy, 1);
		}

		return geometry;
	}

	var _geometry;
	var gateColors = {};

	var Gate = function (_THREE$Mesh) {
		babelHelpers.inherits(Gate, _THREE$Mesh);

		function Gate(tileId) {
			var _ref = arguments.length <= 1 || arguments[1] === undefined ? gate : arguments[1];

			var geometry = _ref.geometry;
			var materials = _ref.materials;
			var outlineMaterials = _ref.outlineMaterials;
			var extrude = _ref.extrude;
			babelHelpers.classCallCheck(this, Gate);

			if (!_geometry) _geometry = createRectangleGeometry(geometry.width, extrude);
			var material = new THREE.MeshPhongMaterial(materials.default);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Gate).call(this, _geometry, material));

			_this.name = 'gate';

			_this.rotateX(Math.PI / 2);

			_this.materials = materials;
			_this.outlineMaterials = outlineMaterials;

			_this.addOutline(outlineMaterials.default);

			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Gate, [{
			key: 'addOutline',
			value: function addOutline(materialParams) {
				var outline = new THREE.LineSegments(new THREE.EdgesGeometry(this.geometry, 0.1), new THREE.LineBasicMaterial(materialParams));

				outline.matrixAutoUpdate = false;

				this.add(outline);
				this._outlineMaterial = outline.material;
			}
		}, {
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				if (tileId == GATE_OFF) this.off();else if (tileId == GATE_GREEN) this.green();else if (tileId == GATE_RED) this.red();else if (tileId == GATE_BLUE) this.blue();
			}
		}, {
			key: 'updateMaterials',
			value: function updateMaterials(tileId, material, outlineMaterial) {
				if (!gateColors[tileId]) {
					gateColors[tileId] = findDominantColorForTile(tagpro.tiles[tileId]);
				}

				this._outlineMaterial.color = gateColors[tileId];
				this._outlineMaterial.setValues(outlineMaterial);

				this.material.color = gateColors[tileId];
				this.material.setValues(material);
			}
		}, {
			key: 'off',
			value: function off() {
				this.updateMaterials(GATE_OFF, this.materials.off, this.outlineMaterials.off);
			}
		}, {
			key: 'green',
			value: function green() {
				this.updateMaterials(GATE_GREEN, this.materials.green, this.outlineMaterials.green);
			}
		}, {
			key: 'red',
			value: function red() {
				this.updateMaterials(GATE_RED, this.materials.red, this.outlineMaterials.red);
			}
		}, {
			key: 'blue',
			value: function blue() {
				this.updateMaterials(GATE_BLUE, this.materials.blue, this.outlineMaterials.blue);
			}
		}]);
		return Gate;
	}(THREE.Mesh);

	var TILES_WIDTH = 16 * tagpro.TILE_SIZE;
	var TILES_HEIGHT = 11 * tagpro.TILE_SIZE;
	var BALL_WIDTH = 38;

	var tempQuaternion$1 = new THREE.Quaternion();
	var AXIS_Y$1 = new THREE.Vector3(0, 1, 0);

	var Puck = function (_THREE$Mesh) {
		babelHelpers.inherits(Puck, _THREE$Mesh);

		function Puck(options) {
			babelHelpers.classCallCheck(this, Puck);

			var material = new THREE.MeshPhongMaterial(options.materials.default);
			var geometry = new THREE.CircleGeometry(options.geometry.radiusTop, options.geometry.segments);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Puck).call(this, geometry, material));

			_this.options = options;
			_this.addCylinder(options);

			_this.rotateX(Math.PI / 2);
			_this.position.y = options.geometry.height;
			return _this;
		}

		babelHelpers.createClass(Puck, [{
			key: 'addCylinder',
			value: function addCylinder(options) {
				var geom = options.geometry;

				var material = new THREE.MeshPhongMaterial(options.materials.default);
				var geometry = new THREE.CylinderGeometry(geom.radiusTop, geom.radiusBottom, geom.height, geom.segments, 1, true);
				geometry.rotateX(-Math.PI / 2);
				geometry.translate(0, 0, geom.height / 2);

				var cylinder = new THREE.Mesh(geometry, material);

				this.add(cylinder);
				this.cylinder = cylinder;
			}
		}, {
			key: 'updateColor',
			value: function updateColor(player) {
				var tileName = player.team === 1 ? 'redball' : 'blueball';
				var tile = tagpro.tiles[tileName];

				if (!tile.texture) {
					createBallTexture(tile);
				}

				this.material.map = tile.texture;

				var materials = this.options.materials;
				var material = player.team === 1 ? materials.red : materials.blue;
				this.cylinder.material.setValues(material);

				if (!tile.dominantColor) {
					tile.dominantColor = findDominantColorForTile(tile);
				}

				this.cylinder.material.color = tile.dominantColor;
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				this.position.x = player.sprite.x;
				this.position.z = player.sprite.y;

				tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -(player.a || 0) * this.options.rotationCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
			}
		}]);
		return Puck;
	}(THREE.Mesh);

	function createBallTexture(tile) {
		var texture = new THREE.Texture(tagpro.tiles.image);
		texture.needsUpdate = true;

		var left = tile.x * tagpro.TILE_SIZE / TILES_WIDTH;
		var top = tile.y * tagpro.TILE_SIZE / TILES_HEIGHT;

		texture.offset.set(left + 1 / TILES_WIDTH, 1 - (top + (BALL_WIDTH + 1) / TILES_HEIGHT));

		var w = BALL_WIDTH / TILES_WIDTH;
		var h = BALL_WIDTH / TILES_HEIGHT;

		texture.repeat.set(w, h);

		tile.texture = texture;
	}

	var _material;
	var _geometry$1;
	var Spike = function (_THREE$Mesh) {
		babelHelpers.inherits(Spike, _THREE$Mesh);

		function Spike(tileId) {
			var _ref = arguments.length <= 1 || arguments[1] === undefined ? spike : arguments[1];

			var geometry = _ref.geometry;
			var material = _ref.material;
			babelHelpers.classCallCheck(this, Spike);

			if (!_geometry$1) {
				_geometry$1 = createSpikeGeometry(geometry);
			}

			if (!_material) {
				_material = new THREE.MeshPhongMaterial(material);
				_material.color = findDominantColorForTile(tagpro.tiles[SPIKE]);
			}

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Spike).call(this, _geometry$1, _material));

			_this.name = 'spike';
			return _this;
		}

		babelHelpers.createClass(Spike, [{
			key: 'updateByTile',
			value: function updateByTile() {}
		}]);
		return Spike;
	}(THREE.Mesh);

	function createSpikeGeometry() {
		var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref2$width = _ref2.width;
		var width = _ref2$width === undefined ? 32 : _ref2$width;
		var _ref2$segments = _ref2.segments;
		var segments = _ref2$segments === undefined ? 6 : _ref2$segments;

		var geom = new THREE.SphereGeometry(width / 4, segments * 10);

		for (var i = 0; i < geom.vertices.length; i += 10) {
			geom.vertices[i].x = geom.vertices[i].x * 2;
			geom.vertices[i].y = geom.vertices[i].y * 2;
			geom.vertices[i].z = geom.vertices[i].z * 2;
		}

		return geom;
	}

	var _geometry$2;
	var _texture;
	var Tile = function (_THREE$Mesh) {
		babelHelpers.inherits(Tile, _THREE$Mesh);

		function Tile(tileId) {
			babelHelpers.classCallCheck(this, Tile);

			if (!_texture) {
				_texture = createTexture(tagpro.tiles.image);
			}

			if (!_geometry$2) {
				_geometry$2 = new THREE.PlaneGeometry(tagpro.TILE_SIZE, tagpro.TILE_SIZE, 1, 1);
				_geometry$2.rotateX(-Math.PI / 2);
			}

			var material = new THREE.MeshPhongMaterial({
				transparent: true,
				map: _texture.clone()
			});

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Tile).call(this, _geometry$2, material));

			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Tile, [{
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				var texture = this.material.map;
				var tile = tagpro.tiles[tileId];
				var _tiles$image = tagpro.tiles.image;
				var width = _tiles$image.width;
				var height = _tiles$image.height;


				texture.offset.set(tile.x * tagpro.TILE_SIZE / width, 1 - (tile.y + 1) * tagpro.TILE_SIZE / height);

				texture.repeat.set(tagpro.TILE_SIZE / width, tagpro.TILE_SIZE / height);

				texture.needsUpdate = true;
			}
		}]);
		return Tile;
	}(THREE.Mesh);

	function createTexture(image) {
		var canvas = document.createElement('canvas');
		canvas.width = closestPowerOfTwo(image.width);
		canvas.height = closestPowerOfTwo(image.height);

		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		return new THREE.Texture(canvas);
	}

	function closestPowerOfTwo(num) {
		return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
	}

	var _objectMap;

	function createBall(player) {
		var options = this.options;

		var mesh = options.ballsArePucks ? new Puck(options.objects.puck) : new Ball(options.objects.ball);

		mesh.updateColor(player);

		return mesh;
	}

	var objectMap = (_objectMap = {}, babelHelpers.defineProperty(_objectMap, BOMB, Bomb), babelHelpers.defineProperty(_objectMap, BOMB_OFF, Bomb), babelHelpers.defineProperty(_objectMap, BUTTON, Tile), babelHelpers.defineProperty(_objectMap, GATE_BLUE, Gate), babelHelpers.defineProperty(_objectMap, GATE_GREEN, Gate), babelHelpers.defineProperty(_objectMap, GATE_OFF, Gate), babelHelpers.defineProperty(_objectMap, GATE_RED, Gate), babelHelpers.defineProperty(_objectMap, SPIKE, Spike), babelHelpers.defineProperty(_objectMap, POWERUP_BOMB, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_GRIP, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_NONE, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_SPEED, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_TAGPRO, Tile), _objectMap);

var objects = Object.freeze({
		createBall: createBall,
		objectMap: objectMap
	});

	// Simplifying API of jsclipper.

	var Clipper = ClipperLib.Clipper;
	var Lighten = ClipperLib.JS.Lighten;
	var PolyTree = ClipperLib.PolyTree;
	var PolyTreeToExPolygons = ClipperLib.JS.PolyTreeToExPolygons;
	var SimplifyPolygons = ClipperLib.Clipper.SimplifyPolygons;

	var ClipType = {
		Intersection: ClipperLib.ClipType.ctIntersection
	};

	var PolyType = {
		Subject: ClipperLib.PolyType.ptSubject,
		Clip: ClipperLib.PolyType.ptClip
	};

	var PolyFillType = {
		NonZero: ClipperLib.PolyFillType.pftNonZero
	};

	function SimplifyAndLighten(paths) {
		var lightenTolerance = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

		paths = SimplifyPolygons(paths, PolyFillType.NonZero);
		paths = Lighten(paths, lightenTolerance);

		return paths;
	}

	var BL = 1.1; // ◣ bottom left
	var TL = 1.2; // ◤ top left
	var TR = 1.3; // ◥ top right
	var BR = 1.4; // ◢ bottom right

	function createWalls(map, backgroundTextures, tilesImage) {
		var params = this.options.objects.wall;
		var extrude = params.extrude;
		var tileSize = this.TILE_SIZE;

		var chunkedShapes = createChunkedShapes(map, backgroundTextures, tileSize);

		var geometry;
		chunkedShapes.forEach(function (chunk, index) {
			var options = Object.assign({
				UVGenerator: createUVGenerator(chunk, index + 1, 0),
				material: index // NOTE: This doesn't work since THREE.js r74
			}, extrude);

			if (!geometry) {
				geometry = new THREE.ExtrudeGeometry(chunk.shapes, options);
			} else {
				geometry.addShapeList(chunk.shapes, options);
			}
		});

		var materials = backgroundTextures.map(function (_ref) {
			var texture = _ref.texture;

			var opts = Object.assign({}, params.material, {
				map: texture
			});

			return new THREE.MeshPhongMaterial(opts);
		});

		var opts = Object.assign({}, params.material, {
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

	function createUVGenerator(_ref2, index, sideIndex) {
		var x = _ref2.x;
		var y = _ref2.y;
		var width = _ref2.width;
		var height = _ref2.height;

		return {
			generateTopUV: function generateTopUV(geometry, indexA, indexB, indexC) {
				var vertices = geometry.vertices;
				var a = vertices[indexA];
				var b = vertices[indexB];
				var c = vertices[indexC];

				// HACK: THREE.js r74 removed material index for some reason, see their issue #7332 and commit 661ce3ad22...
				geometry.faces[geometry.faces.length - 1].materialIndex = index;

				return [new THREE.Vector2((a.x - x) / width, 1 - (a.y - y) / height), new THREE.Vector2((b.x - x) / width, 1 - (b.y - y) / height), new THREE.Vector2((c.x - x) / height, 1 - (c.y - y) / height)];
			},
			generateSideWallUV: function generateSideWallUV(geometry, indexA, indexB, indexC, indexD) {
				// HACK: Set sidewall materialIndex
				var len = geometry.faces.length - 1;
				geometry.faces[len - 1].materialIndex = sideIndex;
				geometry.faces[len].materialIndex = sideIndex;

				var w = 16 * 40;
				var h = 11 * 40;

				var a = geometry.vertices[indexA];
				var b = geometry.vertices[indexB];

				var left, right, top, bottom;

				// if (Math.abs(a.y - b.y) < 0.01) {
				// top, bottom
				left = 5 * 40 / w;
				right = 5.5 * 40 / w;
				top = 4 * 40 / h;
				bottom = 5 * 40 / h;

				return [new THREE.Vector2(right, 1 - top), new THREE.Vector2(left, 1 - top), new THREE.Vector2(left, 1 - bottom), new THREE.Vector2(right, 1 - bottom)];
				// }
				// else {
				// 	// left, right, diagonals
				// 	left = (15 * 40) / w;
				// 	right = (16 * 40) / w;
				// 	top = (0 * 40) / h;
				// 	bottom = (1 * 40) / h;

				// 	return [
				// 		new THREE.Vector2(right, 1 - top),
				// 		new THREE.Vector2(left, 1 - top),
				// 		new THREE.Vector2(left, 1 - bottom),
				// 		new THREE.Vector2(right, 1 - bottom),
				// 	];
				// }
			}
		};
	}

	function createChunkedShapes(map, textures) {
		var tileSize = arguments.length <= 2 || arguments[2] === undefined ? 40 : arguments[2];

		var paths = createPathsFromTileMap(map, tileSize);
		paths = SimplifyAndLighten(paths, tileSize / 4);

		var clipper = new Clipper();

		var results = textures.map(function (_ref3) {
			var x = _ref3.x;
			var y = _ref3.y;
			var width = _ref3.width;
			var height = _ref3.height;

			clipper.Clear();

			clipper.AddPaths(paths, PolyType.Subject, true);

			var clip = [{ X: x, Y: y }, { X: x + width, Y: y }, { X: x + width, Y: y + height }, { X: x, Y: y + height }];

			clipper.AddPaths([clip], PolyType.Clip, true);

			var result = new PolyTree();
			clipper.Execute(ClipType.Intersection, result);

			var polygons = PolyTreeToExPolygons(result);

			var shapes = createThreeShapesFromExPolygons(polygons);

			return {
				x: x,
				y: y,
				width: width,
				height: height,
				shapes: shapes
			};
		});

		return results;
	}

	function createThreeShapesFromExPolygons(polygons) {
		return polygons.map(function (_ref4) {
			var outer = _ref4.outer;
			var holes = _ref4.holes;

			var shape = new THREE.Shape();

			outer.forEach(function (_ref5) {
				var x = _ref5.X;
				var y = _ref5.Y;
				return shape.moveTo(x, y);
			});

			shape.holes = holes.map(function (hole) {
				var holeShape = new THREE.Shape();
				hole.forEach(function (_ref6) {
					var x = _ref6.X;
					var y = _ref6.Y;
					return holeShape.moveTo(x, y);
				});

				return holeShape;
			});

			return shape;
		});
	}

	function createPathsFromTileMap(map, tileSize) {
		var height = map.length;
		var width = map[0].length;

		return map.reduce(function (mem, columns, x) {
			var left = x * tileSize;
			columns.forEach(function (tile, y) {
				var top = y * tileSize;
				if (tile === 1) {
					mem.push([{ X: left, Y: top }, { X: left + tileSize, Y: top }, { X: left + tileSize, Y: top + tileSize }, { X: left, Y: top + tileSize }]);
				} else if (tile === BL) {
					mem.push([{ X: left, Y: top }, { X: left + tileSize, Y: top + tileSize }, { X: left, Y: top + tileSize }]);
				} else if (tile === TL) {
					mem.push([{ X: left, Y: top }, { X: left + tileSize, Y: top }, { X: left, Y: top + tileSize }]);
				} else if (tile === TR) {
					mem.push([{ X: left, Y: top }, { X: left + tileSize, Y: top }, { X: left + tileSize, Y: top + tileSize }]);
				} else if (tile === BR) {
					mem.push([{ X: left, Y: top + tileSize }, { X: left + tileSize, Y: top }, { X: left + tileSize, Y: top + tileSize }]);
				}
			});
			return mem;
		}, []);
	}

var walls = Object.freeze({
		createWalls: createWalls
	});

	var options = {
		renderer: {
			antialias: true,
			alpha: true
		},
		camera: {
			near: 10,
			far: 10000,
			distance: 1000
		},
		lights: [{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 }, { enabled: true, type: 'ambient', color: 0x666666 }, { enabled: true, type: 'directional', color: 0xffffff, intensity: 1.0, position: [-500, 500, -500] }],
		objects: objects$1,
		ballsArePucks: false
	};

	var t3d = Object.assign({
		TILE_SIZE: 40,
		dynamicObjects: {},
		options: options
	}, objects, utils, walls, lights);

	// Extend tagpro.ready.after
	tagpro__default.ready.after = readyAfter.bind(null, tagpro__default);

	// HACK: for debugging
	window.t3d = t3d;

	function createRenderer3D() {
		var TILE_SIZE = tagpro__default.TILE_SIZE;

		tagpro__default.tagpro3d = t3d;

		var tr = tagpro__default.renderer;

		// Make game canvas transparent
		tr.options.transparent = true;

		changeSomeTilesToFloorTiles(tagpro__default.tiles);

		// Add styles
		addStyles(styles);

		// Draw extra tiles to the 2D background layer.
		// after(tr, 'drawBackgroundTiles', () => hacks.drawExtraTilesToBackground(tagpro));

		t3d.camera = t3d.createCamera(t3d.options.camera);
		t3d.scene = t3d.createScene();
		t3d.scene.add(t3d.camera);

		//
		// Renderer
		//

		// TODO: Find a sensible tagpro.renderer function to hook this stuff into
		after(tr, 'drawStartingSplats', function () {
			t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
		});

		after(tr, 'createRenderer', function () {
			t3d.renderer = t3d.createRenderer(t3d.options.renderer);
		});

		after(tr, 'render', function () {
			t3d.renderer.render(t3d.scene, t3d.camera);
		});

		//
		// Camera
		//

		after(tr, 'centerView', function () {
			t3d.resizeCanvas(t3d.renderer, tr.canvas);
			t3d.updateCameraFOV(t3d.camera, tr.canvas);
		});

		after(tr, 'centerContainerToPoint', function (x, y) {
			t3d.updateCameraPosition(t3d.camera, x, y);
		});

		var zoom;
		after(tr, 'updateCameraZoom', function () {
			if (zoom !== tagpro__default.zoom) {
				zoom = tagpro__default.zoom;
				t3d.updateCameraZoom(t3d.camera, zoom);
			}
		});

		//
		// Balls
		//

		tr.createBallSprite = function (player) {
			player.currentTeam = player.team;

			player.object3d = t3d.createBall(player);
			t3d.scene.add(player.object3d);
		};

		tr.updatePlayerColor = function (player) {
			if (player.team !== player.currentTeam) {
				player.currentTeam = player.team;
				player.object3d.updateColor(player);
			}
		};

		after(tr, 'updatePlayerVisibility', function (player) {
			player.object3d.visible = player.sprite.visible;
		});

		after(tr, 'updatePlayerSpritePosition', function (player) {
			player.object3d.updatePosition(player);
		});

		after(tr, 'destroyPlayer', function (player) {
			t3d.scene.remove(player.object3d);
			delete player.object3d;
		});

		//
		// Walls
		//

		after(tr, 'createBackgroundTexture', function (container) {
			var textures = t3d.mapBackgroundChunksToTextures(tr.backgroundChunks);

			t3d.createWalls(tagpro__default.map, textures, tagpro__default.tiles.image.src);

			var plane = t3d.createBackgroundPlaneFromChunks(tr.backgroundChunks);
			t3d.scene.add(plane);
			tr.layers.background.visible = false;
		});

		//
		// Tiles
		//

		var originalDrawDynamicTile = tr.drawDynamicTile;
		tr.drawDynamicTile = function (x, y) {
			var tileId = tagpro__default.map[x][y];

			if (!t3d.dynamicObjects[x]) {
				t3d.dynamicObjects[x] = {};
			}

			var mesh = t3d.dynamicObjects[x][y];

			if (!mesh) {
				var TileObject = t3d.objectMap[tileId];

				if (!TileObject) {
					originalDrawDynamicTile(x, y);
					return;
				}

				mesh = new TileObject(tileId);

				mesh.position.x = x * TILE_SIZE;
				mesh.position.z = y * TILE_SIZE;

				t3d.scene.add(mesh);
				t3d.dynamicObjects[x][y] = mesh;
			} else {
				mesh.updateByTileId(tileId);
			}
		};

		console.log('TagPro 3D Initialized.');
	}

	tagpro__default.ready(createRenderer3D);

}(tagpro,THREE,$,RgbQuant,ClipperLib));