// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.1.1
// @author        Kera
// @grant         GM_addStyle
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/icon.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include       http://*.newcompte.fr*
// @require       https://cdnjs.cloudflare.com/ajax/libs/three.js/r74/three.min.js
// @require       https://keratagpro.github.io/tagpro-3d/rgbquant.js
// ==/UserScript==

(function (tagpro,THREE,RgbQuant,$) {
	'use strict';

	var tagpro__default = 'default' in tagpro ? tagpro['default'] : tagpro;
	RgbQuant = 'default' in RgbQuant ? RgbQuant['default'] : RgbQuant;
	$ = 'default' in $ ? $['default'] : $;

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

	babelHelpers.get = function get(object, property, receiver) {
	  if (object === null) object = Function.prototype;
	  var desc = Object.getOwnPropertyDescriptor(object, property);

	  if (desc === undefined) {
	    var parent = Object.getPrototypeOf(object);

	    if (parent === null) {
	      return undefined;
	    } else {
	      return get(parent, property, receiver);
	    }
	  } else if ("value" in desc) {
	    return desc.value;
	  } else {
	    var getter = desc.get;

	    if (getter === undefined) {
	      return undefined;
	    }

	    return getter.call(receiver);
	  }
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

	function isInGame() {
		return tagpro.state > 0;
	}

	function addStyles(styles) {
		GM_addStyle(styles);
	}

	// https://www.reddit.com/r/TagPro/wiki/api#wiki_tiles

	var BOMB = 10;
	var BOMB_OFF = 10.1;
	var BUTTON = 8;
	var ENDZONE_BLUE = 18;
	var ENDZONE_RED = 17;
	var FLAG_BLUE = 4;
	var FLAG_BLUE_TAKEN = 4.1;
	var FLAG_RED = 3;
	var FLAG_RED_TAKEN = 3.1;
	var FLAG_YELLOW = 16;
	var FLAG_YELLOW_TAKEN = 16.1;
	var GATE_BLUE = 9.3;
	var GATE_GREEN = 9.1;
	var GATE_OFF = 9;
	var GATE_RED = 9.2;
	var PORTAL = 13;
	var PORTAL_OFF = 13.1;
	var POWERUP_BOMB = 6.2;
	var POWERUP_GRIP = 6.1;
	var POWERUP_NONE = 6;
	var POWERUP_SPEED = 6.4;
	var POWERUP_TAGPRO = 6.3;
	var SPEEDPAD = 5;
	var SPEEDPAD_BLUE = 15;
	var SPEEDPAD_BLUE_OFF = 15.1;
	var SPEEDPAD_OFF = 5.1;
	var SPEEDPAD_RED = 14;
	var SPEEDPAD_RED_OFF = 14.1;
	var SPIKE = 7;

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

	function after(obj, methodName, callback) {
		var orig = obj[methodName];
		obj[methodName] = function () {
			var result = orig.apply(this, arguments);
			callback.apply(this, arguments);
			return result;
		};
	}

	var ball = {
		enabled: true,
		velocityCoefficient: 0.1,
		rotationCoefficient: 0.015,
		geometry: {
			detail: 1,
			radius: 17
		},
		materials: {
			default: {
				shading: THREE.FlatShading
			},
			blue: {},
			red: {}
		},
		outline: {
			enabled: true,
			detail: 2,
			radius: 19
		},
		outlineMaterials: {
			default: {
				side: THREE.BackSide
			},
			blue: {},
			red: {}
		}
	};

	var puck = {
		enabled: true,
		rotationCoefficient: 0.01,
		geometries: {
			circle: {
				radius: 19,
				segments: 32
			},
			cylinder: {
				height: 10,
				radiusTop: 19,
				radiusBottom: 19,
				segments: 32
			}
		},
		materials: {
			circle: {
				default: {
					transparent: true,
					alphaTest: 0.1,
					opacity: 0.9,
					shading: THREE.FlatShading
				},
				blue: {},
				red: {}
			},
			cylinder: {
				default: {
					transparent: true,
					opacity: 0.9,
					shading: THREE.FlatShading,
					side: THREE.DoubleSide
				},
				blue: {},
				red: {}
			}
		}
	};

	var wall = {
		materials: {
			top: {
				opacity: 0.7,
				shading: THREE.FlatShading,
				transparent: true
			},
			side: {
				opacity: 0.7,
				shading: THREE.FlatShading,
				transparent: true
			}
		},
		extrude: {
			amount: 40,
			steps: 1,
			bevelEnabled: false,
			bevelSegments: 1,
			bevelSize: 5,
			bevelThickness: 10
		},
		tiles: {
			top: {
				x: 5.5,
				y: 5.5
			},
			side: {
				x: 5.5,
				y: 5.5
			}
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
			width: 40,
			height: 40
		},
		materials: {
			default: {
				transparent: true,
				side: THREE.DoubleSide,
				opacity: 0.3
			},
			off: {},
			green: {},
			red: {},
			blue: {}
		},
		outlineMaterials: {
			default: {},
			off: {},
			green: {},
			red: {},
			blue: {}
		}
	};

	var tile = {
		material: {
			transparent: true
		}
	};

	var animatedTile = {
		material: {
			transparent: true
		}
	};

var objects = Object.freeze({
		ball: ball,
		puck: puck,
		wall: wall,
		spike: spike,
		bomb: bomb,
		button: button,
		flag: flag,
		gate: gate,
		tile: tile,
		animatedTile: animatedTile
	});

	var defaults = {
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
		objects: objects,
		ballsArePucks: false
	};

	var RAD = 180 / Math.PI;

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

var camera = Object.freeze({
		createCamera: createCamera,
		updateCameraFOV: updateCameraFOV,
		updateCameraPosition: updateCameraPosition,
		updateCameraZoom: updateCameraZoom
	});

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

	function getDominantColor(canvas) {
		var quantizer = new RgbQuant({
			colors: 4
		});

		quantizer.sample(canvas);

		var palette = quantizer.palette(true, true);

		if (!palette) {
			return null;
		}

		palette = palette.map(function (_ref) {
			var _ref2 = babelHelpers.slicedToArray(_ref, 3);

			var r = _ref2[0];
			var g = _ref2[1];
			var b = _ref2[2];
			return new THREE.Color(r / 256, g / 256, b / 256);
		});

		// Try to find a non-grayscale color.
		var color = palette.find(function (col) {
			return col.getHSL().s > 0.5;
		});

		return color || palette[0];
	}

	var log = console.log.bind(console);
	var time = console.time.bind(console);
	var timeEnd = console.timeEnd.bind(console);

	var resizedImageCache = {};

	function resizeImage(image, width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		return canvas;
	}

	function getOrCreatePowerOfTwoImage(image) {
		if (!resizedImageCache[image.src]) {
			var w = closestPowerOfTwo(image.width);
			var h = closestPowerOfTwo(image.height);
			var img = resizeImage(image, w, h);
			resizedImageCache[image.src] = img;
		}

		return resizedImageCache[image.src];
	}

	function closestPowerOfTwo(num) {
		return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
	}

	function cropImageToCanvas(image, x, y, width, height) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		canvas.width = width;
		canvas.height = height;

		context.drawImage(image, x, y, width, height, 0, 0, width, height);

		return canvas;
	}

	var textureLoader = new THREE.TextureLoader();
	textureLoader.setCrossOrigin('');

	var objectLoader = new THREE.ObjectLoader();

	function loadObjectFromJson(json) {
		var mesh = objectLoader.parse(json);
		return mesh;
	}

	var SpriteTexture = function (_THREE$Texture) {
		babelHelpers.inherits(SpriteTexture, _THREE$Texture);

		function SpriteTexture(image, columns, rows) {
			babelHelpers.classCallCheck(this, SpriteTexture);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SpriteTexture).call(this, image));

			_this.repeat.set(1 / columns, 1 / rows);

			_this._columns = columns;
			_this._rows = rows;
			return _this;
		}

		babelHelpers.createClass(SpriteTexture, [{
			key: 'copy',
			value: function copy(source) {
				babelHelpers.get(Object.getPrototypeOf(SpriteTexture.prototype), 'copy', this).call(this, source);

				this._columns = source._columns;
				this._rows = source._rows;

				return this;
			}
		}, {
			key: 'setXY',
			value: function setXY(x, y) {
				if (x === this._x && y === this._y) return;

				this._x = x;
				this._y = y;

				this.offset.set(x / this._columns, 1 - (y + 1) / this._rows);

				this.needsUpdate = true;
			}
		}, {
			key: 'setTile',
			value: function setTile(_ref) {
				var x = _ref.x;
				var y = _ref.y;

				this.setXY(x, y);
			}
		}, {
			key: 'columns',
			get: function get() {
				return this._columns;
			}
		}, {
			key: 'rows',
			get: function get() {
				return this._rows;
			}
		}]);
		return SpriteTexture;
	}(THREE.Texture);

	function getTilesTexture() {
		return new SpriteTexture(getOrCreatePowerOfTwoImage(tagpro.tiles.image), tagpro.tiles.image.width / tagpro.TILE_SIZE, tagpro.tiles.image.height / tagpro.TILE_SIZE);
	}

	function getTextureByTileId(tileId) {
		var tileSize = arguments.length <= 1 || arguments[1] === undefined ? tagpro.TILE_SIZE : arguments[1];

		var assetName = animatedAssetMap[tileId];

		if (!assetName) {
			var texture = getTilesTexture();
			texture.setTile(tagpro.tiles[tileId]);
			return texture;
		}

		var img = $(overrideableAssets[assetName])[0];

		return new SpriteTexture(getOrCreatePowerOfTwoImage(img), img.width / tileSize, img.height / tileSize);
	}

	var tileColorCache = {};

	function getDominantColorForTile(img, _ref) {
		var x = _ref.x;
		var y = _ref.y;
		var width = arguments.length <= 2 || arguments[2] === undefined ? tagpro.TILE_SIZE : arguments[2];
		var height = arguments.length <= 3 || arguments[3] === undefined ? tagpro.TILE_SIZE : arguments[3];

		var key = img.src + '-' + x + '-' + y + '-' + width + '-' + height;

		if (!tileColorCache[key]) {
			var cropped = cropImageToCanvas(img, x * tagpro.TILE_SIZE, y * tagpro.TILE_SIZE, width, height);
			tileColorCache[key] = getDominantColor(cropped);
		}

		return tileColorCache[key];
	}

	var tempQuaternion = new THREE.Quaternion();
	var AXIS_X = new THREE.Vector3(1, 0, 0);
	var AXIS_Y = new THREE.Vector3(0, 1, 0);
	var AXIS_Z = new THREE.Vector3(0, 0, 1);

	var Ball = function (_THREE$Mesh) {
		babelHelpers.inherits(Ball, _THREE$Mesh);

		function Ball(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? ball : arguments[1];
			babelHelpers.classCallCheck(this, Ball);

			var _geometry = new THREE.IcosahedronGeometry(params.geometry.radius, params.geometry.detail);
			var _material = new THREE.MeshPhongMaterial(params.materials.default);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Ball).call(this, _geometry, _material));

			_this.params = params;
			_this.position.y = params.geometry.radius;

			_this.addOutline(params.outline, params.outlineMaterials);
			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Ball, [{
			key: 'addOutline',
			value: function addOutline(params, materials) {
				if (!params.enabled) return;

				var outline = new THREE.Mesh(new THREE.IcosahedronGeometry(params.radius, params.detail), new THREE.MeshBasicMaterial(materials.default));

				this.add(outline);
				this._outline = outline;
			}
		}, {
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				var material = this.params.materials[tileId === 'redball' ? 'red' : 'blue'];

				if (!material.color) material.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);

				this.material.setValues(material);

				if (this._outline) {
					var outlineMaterial = this.params.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];

					if (!outlineMaterial.color) outlineMaterial.color = material.color;

					this._outline.material.setValues(outlineMaterial);
				}
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				this.position.x = player.sprite.x;
				this.position.z = player.sprite.y;

				tempQuaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.params.velocityCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

				tempQuaternion.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.params.velocityCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);

				tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.params.rotationCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
			}
		}]);
		return Ball;
	}(THREE.Mesh);

	var _geometry;

	var AnimatedTile = function (_THREE$Mesh) {
		babelHelpers.inherits(AnimatedTile, _THREE$Mesh);

		function AnimatedTile(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? animatedTile : arguments[1];
			babelHelpers.classCallCheck(this, AnimatedTile);

			if (!_geometry) {
				_geometry = new THREE.PlaneGeometry(tagpro.TILE_SIZE, tagpro.TILE_SIZE, 1, 1);
				_geometry.rotateX(-Math.PI / 2);
			}

			var texture = getTextureByTileId(tileId);

			var material = new THREE.MeshPhongMaterial(Object.assign({ map: texture }, params.material));

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(AnimatedTile).call(this, _geometry, material));

			_this._startTime = performance.now();
			_this._frameDuration = 1000 / (6 + Math.random() / 10);

			_this.texture = texture;
			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(AnimatedTile, [{
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				if (tileId == SPEEDPAD_OFF || tileId == SPEEDPAD_BLUE_OFF || tileId == SPEEDPAD_RED_OFF || tileId == PORTAL_OFF) this.pause();else this.play();
			}
		}, {
			key: 'play',
			value: function play() {
				this.setRange(0, this.texture.columns - 2);
			}
		}, {
			key: 'pause',
			value: function pause() {
				this.setRange(this.texture.columns - 1, this.texture.columns - 1);
			}
		}, {
			key: 'setRange',
			value: function setRange(from, to) {
				this._from = from;
				this._to = to;
			}
		}, {
			key: 'update',
			value: function update(timestamp) {
				if (this._from === this._to) {
					this.texture.setXY(this._from, 0);
				} else {
					var range = this._to - this._from;
					var delta = timestamp - this._startTime;
					var index = Math.round(delta / this._frameDuration % range);
					this.texture.setXY(index + this._from, 0);
				}
			}
		}]);
		return AnimatedTile;
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

	var Bomb = function (_THREE$Object3D) {
		babelHelpers.inherits(Bomb, _THREE$Object3D);

		function Bomb(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? bomb : arguments[1];
			babelHelpers.classCallCheck(this, Bomb);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Bomb).call(this));

			_this.materials = params.materials;

			_this.add(loadObjectFromJson(bombJson));

			var bombMaterial = _this.getObjectByName('bomb').material;

			if (!bombMaterial.color) bombMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);

			bombMaterial.setValues(params.materials.body);

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

	var _geometry$1;

	var Gate = function (_THREE$Mesh) {
		babelHelpers.inherits(Gate, _THREE$Mesh);

		function Gate(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? gate : arguments[1];
			babelHelpers.classCallCheck(this, Gate);

			if (!_geometry$1) {
				_geometry$1 = new THREE.BoxGeometry(params.geometry.width, params.geometry.height, params.geometry.width, 1, 1, 1);
				_geometry$1.translate(0, params.geometry.height / 2, 0);
			}

			var material = params.materials.default;
			if (!material.map) {
				material = Object.assign({
					map: getTilesTexture()
				}, material);
			}

			var _material = new THREE.MeshPhongMaterial(material);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Gate).call(this, _geometry$1, _material));

			_this.name = 'gate';
			_this.params = params;

			_this.addOutline(params.outlineMaterials.default);
			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Gate, [{
			key: 'addOutline',
			value: function addOutline(params) {
				var outline = new THREE.LineSegments(new THREE.EdgesGeometry(this.geometry, 0.1), new THREE.LineBasicMaterial(params));

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
				if (!outlineMaterial.color) outlineMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);

				this._outlineMaterial.setValues(outlineMaterial);

				this.material.map.setTile(tagpro.tiles[tileId]);
				this.material.setValues(material);
			}
		}, {
			key: 'off',
			value: function off() {
				this.updateMaterials(GATE_OFF, this.params.materials.off, this.params.outlineMaterials.off);
			}
		}, {
			key: 'green',
			value: function green() {
				this.updateMaterials(GATE_GREEN, this.params.materials.green, this.params.outlineMaterials.green);
			}
		}, {
			key: 'red',
			value: function red() {
				this.updateMaterials(GATE_RED, this.params.materials.red, this.params.outlineMaterials.red);
			}
		}, {
			key: 'blue',
			value: function blue() {
				this.updateMaterials(GATE_BLUE, this.params.materials.blue, this.params.outlineMaterials.blue);
			}
		}]);
		return Gate;
	}(THREE.Mesh);

	var AXIS_Y$1 = new THREE.Vector3(0, 1, 0);
	var tempQuaternion$1 = new THREE.Quaternion();

	function createCircle(geometry, material) {
		var geom = new THREE.CircleGeometry(geometry.radius, geometry.segments);
		geom.rotateX(-Math.PI / 2);

		var mat = new THREE.MeshPhongMaterial(material);

		var mesh = new THREE.Mesh(geom, mat);

		return mesh;
	}

	function createCylinder(geometry, material) {
		var geom = new THREE.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.segments, 1, true);

		var mat = new THREE.MeshPhongMaterial(material);

		return new THREE.Mesh(geom, mat);
	}

	var Puck = function (_THREE$Object3D) {
		babelHelpers.inherits(Puck, _THREE$Object3D);

		function Puck(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? puck : arguments[1];
			babelHelpers.classCallCheck(this, Puck);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Puck).call(this));

			_this.params = params;

			_this.position.y = params.geometries.cylinder.height / 2;

			_this._circle = createCircle(params.geometries.circle, params.materials.circle.default);
			_this._circle.position.y = params.geometries.cylinder.height / 2;
			_this.add(_this._circle);

			_this._cylinder = createCylinder(params.geometries.cylinder, params.materials.cylinder.default);
			_this.add(_this._cylinder);

			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Puck, [{
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				var materialName = tileId === 'redball' ? 'red' : 'blue';

				var circle = this._circle;
				var cylinder = this._cylinder;
				var materials = this.params.materials;

				var circleMaterial = materials.circle[materialName];

				// Use built-in ball texture if not explicitly set
				if (!circleMaterial.map) {
					if (!this._tileTexture) {
						this._tileTexture = getTilesTexture();
						circle.material.map = this._tileTexture;
					}

					var texture = circle.material.map;
					texture.setTile(tagpro.tiles[tileId]);

					// HACK: Shrink texture mapping since ball is 38px, not 40px.
					texture.offset.x += 1 / tagpro.TILE_SIZE / 16;
					texture.offset.y += 1 / tagpro.TILE_SIZE / 11;
					texture.repeat.x -= 2 / tagpro.TILE_SIZE / 16;
					texture.repeat.y -= 2 / tagpro.TILE_SIZE / 11;
				} else if (!circleMaterial.color) {
					circleMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
				}

				circle.material.setValues(circleMaterial);

				var cylinderMaterial = materials.cylinder[materialName];

				if (!cylinderMaterial.color) cylinderMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);

				cylinder.material.setValues(cylinderMaterial);
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				this.position.x = player.sprite.x;
				this.position.z = player.sprite.y;

				tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -(player.a || 0) * this.params.rotationCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
			}
		}]);
		return Puck;
	}(THREE.Object3D);

	var _material;
	var _geometry$2;
	var Spike = function (_THREE$Mesh) {
		babelHelpers.inherits(Spike, _THREE$Mesh);

		function Spike(tileId) {
			var _ref = arguments.length <= 1 || arguments[1] === undefined ? spike : arguments[1];

			var geometry = _ref.geometry;
			var material = _ref.material;
			babelHelpers.classCallCheck(this, Spike);

			if (!_geometry$2) {
				_geometry$2 = createSpikeGeometry(geometry);
			}

			if (!_material) {
				if (!material.color) {
					material.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[SPIKE]);
				}

				_material = new THREE.MeshPhongMaterial(material);
			}

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Spike).call(this, _geometry$2, _material));

			_this.name = 'spike';
			return _this;
		}

		babelHelpers.createClass(Spike, [{
			key: 'updateByTileId',
			value: function updateByTileId() {}
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

	var _geometry$3;

	var Tile = function (_THREE$Mesh) {
		babelHelpers.inherits(Tile, _THREE$Mesh);

		function Tile(tileId) {
			var params = arguments.length <= 1 || arguments[1] === undefined ? tile : arguments[1];
			babelHelpers.classCallCheck(this, Tile);

			if (!_geometry$3) {
				_geometry$3 = new THREE.PlaneGeometry(tagpro.TILE_SIZE, tagpro.TILE_SIZE, 1, 1);
				_geometry$3.rotateX(-Math.PI / 2);
			}

			var texture = getTilesTexture();
			texture.setTile(tagpro.tiles[tileId]);

			var material = new THREE.MeshPhongMaterial(Object.assign({ map: texture }, params.material));

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Tile).call(this, _geometry$3, material));

			_this.updateByTileId(tileId);
			return _this;
		}

		babelHelpers.createClass(Tile, [{
			key: 'updateByTileId',
			value: function updateByTileId(tileId) {
				this.material.map.setTile(tagpro.tiles[tileId]);
			}
		}]);
		return Tile;
	}(THREE.Mesh);

	var _objectMap;
	var _animatedAssetMap;
	function createBall(player) {
		var options = this.options;

		var tileId = player.team === 1 ? 'redball' : 'blueball';

		var mesh = options.ballsArePucks ? new Puck(tileId, options.objects.puck) : new Ball(tileId, options.objects.ball);

		return mesh;
	}

	// TODO: Use single PlaneGeometry with faceVertexUvs.
	function createBackgroundPlaneFromChunks(chunks) {
		var plane = new THREE.Object3D();
		plane.position.x = -20;
		plane.position.z = -20;

		var geometry;
		chunks.forEach(function (_ref) {
			var x = _ref.x;
			var y = _ref.y;
			var width = _ref.width;
			var height = _ref.height;
			var texture = _ref.texture;

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

	var objectMap = (_objectMap = {}, babelHelpers.defineProperty(_objectMap, BOMB, Bomb), babelHelpers.defineProperty(_objectMap, BOMB_OFF, Bomb), babelHelpers.defineProperty(_objectMap, BUTTON, Tile), babelHelpers.defineProperty(_objectMap, ENDZONE_BLUE, Tile), babelHelpers.defineProperty(_objectMap, ENDZONE_RED, Tile), babelHelpers.defineProperty(_objectMap, FLAG_BLUE, Tile), babelHelpers.defineProperty(_objectMap, FLAG_BLUE_TAKEN, Tile), babelHelpers.defineProperty(_objectMap, FLAG_RED, Tile), babelHelpers.defineProperty(_objectMap, FLAG_RED_TAKEN, Tile), babelHelpers.defineProperty(_objectMap, FLAG_YELLOW, Tile), babelHelpers.defineProperty(_objectMap, FLAG_YELLOW_TAKEN, Tile), babelHelpers.defineProperty(_objectMap, GATE_BLUE, Gate), babelHelpers.defineProperty(_objectMap, GATE_GREEN, Gate), babelHelpers.defineProperty(_objectMap, GATE_OFF, Gate), babelHelpers.defineProperty(_objectMap, GATE_RED, Gate), babelHelpers.defineProperty(_objectMap, PORTAL, AnimatedTile), babelHelpers.defineProperty(_objectMap, PORTAL_OFF, AnimatedTile), babelHelpers.defineProperty(_objectMap, POWERUP_BOMB, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_GRIP, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_NONE, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_SPEED, Tile), babelHelpers.defineProperty(_objectMap, POWERUP_TAGPRO, Tile), babelHelpers.defineProperty(_objectMap, SPEEDPAD, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPEEDPAD_BLUE, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPEEDPAD_BLUE_OFF, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPEEDPAD_OFF, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPEEDPAD_RED, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPEEDPAD_RED_OFF, AnimatedTile), babelHelpers.defineProperty(_objectMap, SPIKE, Spike), _objectMap);

	var animatedAssetMap = (_animatedAssetMap = {}, babelHelpers.defineProperty(_animatedAssetMap, PORTAL, 'portal'), babelHelpers.defineProperty(_animatedAssetMap, PORTAL_OFF, 'portal'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD, 'speedpad'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD_BLUE, 'speedpadBlue'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD_BLUE_OFF, 'speedpadBlue'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD_OFF, 'speedpad'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD_RED, 'speedpadRed'), babelHelpers.defineProperty(_animatedAssetMap, SPEEDPAD_RED_OFF, 'speedpadRed'), _animatedAssetMap);

var objects$1 = Object.freeze({
		createBall: createBall,
		createBackgroundPlaneFromChunks: createBackgroundPlaneFromChunks,
		objectMap: objectMap,
		animatedAssetMap: animatedAssetMap
	});

	function createRenderer(params) {
		var renderer = new THREE.WebGLRenderer(params);

		renderer.domElement.id = 'tagpro3d';
		document.body.appendChild(renderer.domElement);

		return renderer;
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

var scene = Object.freeze({
		createRenderer: createRenderer,
		createScene: createScene,
		resizeCanvas: resizeCanvas
	});

	var square = createPathGeometry([0, 0], [1, 0], [1, 1], [0, 1]);
	var diagonalBottomLeft = createPathGeometry([0, 1], [1, 1], [0, 0]);
	var diagonalTopLeft = createPathGeometry([0, 0], [0, 1], [1, 0]);
	var diagonalTopRight = createPathGeometry([1, 0], [1, 1], [0, 0]);
	var diagonalBottomRight = createPathGeometry([0, 1], [1, 0], [1, 1]);

	function createPathGeometry() {
		var shape = new THREE.Shape();

		for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
			points[_key] = arguments[_key];
		}

		points.forEach(function (_ref) {
			var _ref2 = babelHelpers.slicedToArray(_ref, 2);

			var x = _ref2[0];
			var y = _ref2[1];
			return shape.moveTo(x, y);
		});

		var geometry = shape.extrude({ amount: 1, bevelEnabled: false });
		geometry.translate(-0.5, -0.5, -0.5);

		return geometry;
	}

	function removeInnerFaces(geometry) {
		var len = geometry.faces.length;

		for (var i = 0; i < len; i += 2) {
			var f1 = geometry.faces[i];
			var f2 = geometry.faces[i + 1];

			if (f1.materialIndex === 0) continue;

			var indices1 = [f1.a, f1.b, f1.c, f2.a, f2.b, f2.c].filter(unique).sort();

			for (var j = 0; j < i; j += 2) {
				var f3 = geometry.faces[j];
				var f4 = geometry.faces[j + 1];

				if (!f3 || !f4) continue;
				if (f3.materialIndex === 0) continue;

				var indices2 = [f3.a, f3.b, f3.c, f4.a, f4.b, f4.c].filter(unique).sort();

				if (areEqual(indices1, indices2)) {
					delete geometry.faces[i];
					delete geometry.faces[i + 1];
					delete geometry.faces[j];
					delete geometry.faces[j + 1];

					delete geometry.faceVertexUvs[0][i];
					delete geometry.faceVertexUvs[0][i + 1];
					delete geometry.faceVertexUvs[0][j];
					delete geometry.faceVertexUvs[0][j + 1];
				}
			}
		}

		geometry.faces = geometry.faces.filter(function (f) {
			return f;
		});
		geometry.faceVertexUvs[0] = geometry.faceVertexUvs[0].filter(function (f) {
			return f;
		});
	}

	function areEqual(arr1, arr2) {
		var len = arr1.length;
		for (var i = 0; i < len; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	}

	function unique(val, index, self) {
		return self.indexOf(val) === index;
	}

	var WALL = 1;
	var BL = 1.1; // ◣ bottom left
	var TL = 1.2; // ◤ top left
	var TR = 1.3; // ◥ top right
	var BR = 1.4; // ◢ bottom right

	function createWalls(map) {
		var params = arguments.length <= 1 || arguments[1] === undefined ? wall : arguments[1];

		var cols = tagpro.tiles.image.width / tagpro.TILE_SIZE;
		var rows = tagpro.tiles.image.height / tagpro.TILE_SIZE;

		var topWallTexture = getTilesTexture();
		setTextureOffset(topWallTexture, cols, rows, params.tiles.top);

		var sideWallTexture = getTilesTexture();
		setTextureOffset(sideWallTexture, cols, rows, params.tiles.side);

		var geom = createGeometryFromTilemap(map);

		var mat = new THREE.MultiMaterial([new THREE.MeshPhongMaterial(Object.assign({ map: topWallTexture }, params.materials.top)), new THREE.MeshPhongMaterial(Object.assign({ map: sideWallTexture }, params.materials.side))]);

		var mesh = new THREE.Mesh(geom, mat);

		mesh.rotation.x = Math.PI / 2;
		mesh.position.y = tagpro.TILE_SIZE / 2;
		mesh.scale.set(tagpro.TILE_SIZE, tagpro.TILE_SIZE, tagpro.TILE_SIZE);
		this.scene.add(mesh);

		var edges = new THREE.EdgesHelper(mesh, 0x000000);
		this.scene.add(edges);
	}

	function setTextureOffset(texture, cols, rows, tile) {
		var x = tile.x / cols;
		var y = 1 - tile.y / rows;
		var w = (tile.width || 1) / cols;
		var h = (tile.height || 1) / rows;

		texture.offset.set(x, y);
		texture.repeat.set(w, -h);
		texture.needsUpdate = true;
	}

	function createGeometryFromTilemap(map) {
		var geometry = new THREE.Geometry();

		time('creating wall geometry');
		map.forEach(function (columns, x) {
			columns.forEach(function (tile, y) {
				var geom;
				switch (tile) {
					case WALL:
						geom = square;break;
					case BL:
						geom = diagonalBottomLeft;break;
					case TL:
						geom = diagonalTopLeft;break;
					case TR:
						geom = diagonalTopRight;break;
					case BR:
						geom = diagonalBottomRight;break;
					default:
						return;
				}

				geom = geom.clone();
				geom.translate(x, y, 0);
				geometry.merge(geom);
			});
		});
		timeEnd('creating wall geometry');

		time('merging wall geometry vertices');
		geometry.mergeVertices();
		timeEnd('merging wall geometry vertices');

		time('removing wall geometry inner faces');
		removeInnerFaces(geometry);
		timeEnd('removing wall geometry inner faces');

		return geometry;
	}

var walls = Object.freeze({
		createWalls: createWalls
	});

	var Renderer3D = function () {
		function Renderer3D() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? defaults : arguments[0];
			babelHelpers.classCallCheck(this, Renderer3D);

			this.options = options;
			this.dynamicObjects = {};
			this.updatableObjects = [];

			this.camera = createCamera(options.camera);
			this.scene = createScene();
			this.scene.add(this.camera);
		}

		babelHelpers.createClass(Renderer3D, [{
			key: 'update',
			value: function update(timestamp) {
				this.updatableObjects.forEach(function (obj) {
					return obj.update(timestamp);
				});
			}
		}]);
		return Renderer3D;
	}();

	Object.assign(Renderer3D.prototype, camera, lights, objects$1, scene, walls);

	var TILE_SIZE$1 = tagpro__default.TILE_SIZE;

	function createRenderer3D() {
		var after$$ = after;
		var tr = tagpro__default.renderer;
		var t3d = new Renderer3D(defaults);

		tagpro__default.tagpro3d = t3d;

		// Make game canvas transparent
		tr.options.transparent = true;

		changeSomeTilesToFloorTiles(tagpro__default.tiles);

		//
		// Renderer
		//

		// TODO: Find a sensible tagpro.renderer function to hook this stuff into
		after$$(tr, 'drawStartingSplats', function () {
			t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
		});

		after$$(tr, 'createRenderer', function () {
			t3d.renderer = t3d.createRenderer(t3d.options.renderer);
		});

		after$$(tr, 'updateGraphics', function () {
			t3d.update(performance.now());
		});

		after$$(tr, 'render', function () {
			t3d.renderer.render(t3d.scene, t3d.camera);
		});

		//
		// Camera
		//

		after$$(tr, 'centerView', function () {
			t3d.resizeCanvas(t3d.renderer, tr.canvas);
			t3d.updateCameraFOV(t3d.camera, tr.canvas);
		});

		after$$(tr, 'centerContainerToPoint', function (x, y) {
			t3d.updateCameraPosition(t3d.camera, x, y);
		});

		var zoom;
		after$$(tr, 'updateCameraZoom', function () {
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
				player.object3d.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
			}
		};

		after$$(tr, 'updatePlayerVisibility', function (player) {
			player.object3d.visible = player.sprite.visible;
		});

		after$$(tr, 'updatePlayerSpritePosition', function (player) {
			player.object3d.updatePosition(player);
		});

		after$$(tr, 'destroyPlayer', function (player) {
			t3d.scene.remove(player.object3d);
			delete player.object3d;
		});

		//
		// Walls
		//

		after$$(tr, 'createBackgroundTexture', function (container) {
			t3d.createWalls(tagpro__default.map, t3d.options.objects.wall);

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

				mesh.position.x = x * TILE_SIZE$1;
				mesh.position.z = y * TILE_SIZE$1;

				t3d.scene.add(mesh);
				t3d.dynamicObjects[x][y] = mesh;

				if (mesh.update) {
					t3d.updatableObjects.push(mesh);
				}
			} else {
				mesh.updateByTileId(tileId);
			}
		};

		console.log('TagPro 3D Initialized.');
	}

	var styles = "#tagpro3d {\r\n\tdisplay: block;\r\n\tpointer-events: none;\r\n\tposition: absolute;\r\n\tz-index: -1;\r\n}\r\n";

	/**
	 * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
	 * between tagpro.ready and tagpro.ready.after.
	 */
	tagpro__default.ready.after = function (callback) {
		if (tagpro__default.resourcesLoaded) {
			setTimeout(callback, 0);
		} else {
			tagpro__default._afterReadyCallbacks.push(callback);
		}
	};

	tagpro__default.ready(function () {
		if (isInGame()) {
			addStyles(styles);
			createRenderer3D();
		}
	});

}(tagpro,THREE,RgbQuant,$));