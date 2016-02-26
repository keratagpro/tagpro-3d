// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.0.1
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
// @require       https://keratagpro.github.io/tagpro-balls-3d/clipper.min.js
// ==/UserScript==

(function (tagpro,THREE,clipper,$) {
	'use strict';

	tagpro = 'default' in tagpro ? tagpro['default'] : tagpro;
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
	function drawExtraTilesToBackground(tagpro) {
		var tileSize = tagpro.TILE_SIZE;
		var width = tagpro.map.length;
		var height = tagpro.map[0].length;
		var container = tagpro.renderer.layers.background;

		var tile;
		for (var col = 0; col !== width; col++) {
			var x = col * tileSize;
			for (var row = 0; row !== height; row++) {
				var y = row * tileSize;
				tile = tagpro.map[col][row];

				if (~ ~tile === 9) {
					// Floor tiles beneath gates
					tagpro.tiles.draw(container, 2, { x: x, y: y });
				} else if (tile === 17 || tile === 18) {
					// Goal tiles
					tagpro.tiles.draw(container, tile, { x: x, y: y });
				}
			}
		}
	}

	var styles = "#tagpro3d {\r\n\tdisplay: block;\r\n\tpointer-events: none;\r\n\tposition: absolute;\r\n\tz-index: 1;\r\n}\r\n\r\n#viewport {\r\n\tz-index: 2;\r\n}\r\n\r\n#options {\r\n\tz-index: 3;\r\n}\r\n";

	var BL = 1.1; // ◣ bottom left
	var TL = 1.2; // ◤ top left
	var TR = 1.3; // ◥ top right
	var BR = 1.4; // ◢ bottom right

	function createShapesFromTilemap(_ref) {
		var map = _ref.map;
		var _ref$tileSize = _ref.tileSize;
		var tileSize = _ref$tileSize === undefined ? 40 : _ref$tileSize;
		var _ref$lightenTolerance = _ref.lightenTolerance;
		var lightenTolerance = _ref$lightenTolerance === undefined ? tileSize / 4 : _ref$lightenTolerance;
		var _ref$miterLimit = _ref.miterLimit;
		var miterLimit = _ref$miterLimit === undefined ? tileSize / 2 : _ref$miterLimit;
		var _ref$arcTolerance = _ref.arcTolerance;
		var arcTolerance = _ref$arcTolerance === undefined ? 0.25 : _ref$arcTolerance;
		var _ref$diluteDelta = _ref.diluteDelta;
		var diluteDelta = _ref$diluteDelta === undefined ? 0 : _ref$diluteDelta;

		var scale = 10;
		var paths = createClipperPaths(map, tileSize * scale);

		paths = clipper.Clipper.SimplifyPolygons(paths, clipper.PolyFillType.pftNonZero);
		paths = clipper.JS.Lighten(paths, lightenTolerance * scale);

		clipper.JS.ScaleDownPaths(paths, scale);

		var co = new clipper.ClipperOffset(miterLimit, arcTolerance);
		co.AddPaths(paths, clipper.JoinType.jtMiter, clipper.EndType.etClosedPolygon);

		var diluted = new clipper.PolyTree();
		co.Execute(diluted, diluteDelta);

		var polygons = clipper.JS.PolyTreeToExPolygons(diluted);

		var shapes = createThreeShapesFromExPolygons(polygons);

		return shapes;
	}

	function createThreeShapesFromExPolygons(polygons) {
		return polygons.map(function (_ref2) {
			var outer = _ref2.outer;
			var holes = _ref2.holes;

			var shape = new THREE.Shape();

			outer.forEach(function (_ref3, index) {
				var x = _ref3.X;
				var y = _ref3.Y;
				return shape[index === 0 ? 'moveTo' : 'lineTo'](x, y);
			});

			shape.holes = holes.map(function (hole) {
				var holeShape = new THREE.Shape();
				hole.forEach(function (_ref4, index) {
					var x = _ref4.X;
					var y = _ref4.Y;
					return holeShape[index === 0 ? 'moveTo' : 'lineTo'](x, y);
				});

				return holeShape;
			});

			return shape;
		});
	}

	function createClipperPaths(map, tileSize) {
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

	var tempQuaternion = new THREE.Quaternion();
	var AXIS_X = new THREE.Vector3(1, 0, 0);
	var AXIS_Y = new THREE.Vector3(0, 1, 0);
	var AXIS_Z = new THREE.Vector3(0, 0, 1);

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
			return _this;
		}

		babelHelpers.createClass(Ball, [{
			key: '_createOutline',
			value: function _createOutline() {
				var outline = this.options.outline;

				if (outline && outline.enabled) {
					var radius = this.options.geometry.radius;
					this.outlineMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
					this.add(new THREE.Mesh(this.geometry.clone(), this.outlineMaterial));

					var scale = 1 - outline.width / radius;
					this.geometry.scale(scale, scale, scale);

					this.position.y = radius;
				}
			}
		}, {
			key: 'updateColor',
			value: function updateColor(player) {
				var material = this.options.material;
				this.material.setValues(player.team === 1 ? material.red : material.blue);

				var outline = this.options.outline;
				if (outline && outline.enabled) {
					this.outlineMaterial.setValues(player.team === 1 ? outline.red : outline.blue);
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
		console.log(camera.position);
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
		camera.position.x = x - 19;
		camera.position.z = y - 19;
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

	function loadObjectFromJson(json) {
		var mesh = objectLoader.parse(json);
		// mesh.rotateZ(Math.PI);
		return mesh;
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
		loadObjectFromJson: loadObjectFromJson,
		addAmbientLight: addAmbientLight,
		addCameraLight: addCameraLight,
		addDirectionalLight: addDirectionalLight,
		addLights: addLights
	});

	var Bomb = function (_THREE$Object3D) {
		babelHelpers.inherits(Bomb, _THREE$Object3D);

		function Bomb() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			babelHelpers.classCallCheck(this, Bomb);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Bomb).call(this));

			var mesh = loadObjectFromJson(bombJson);
			_this.add(mesh);
			_this.getObjectByName('bomb').material.setValues(options.material.body);

			_this.options = options;
			return _this;
		}

		babelHelpers.createClass(Bomb, [{
			key: 'show',
			value: function show() {
				var values = this.options.material.show;

				this.traverse(function (o) {
					if (!o.material) return;
					o.material.setValues(values);
				});

				return this;
			}
		}, {
			key: 'hide',
			value: function hide() {
				var values = this.options.material.hide;

				this.traverse(function (o) {
					if (!o.material) return;
					o.material.setValues(values);
				});

				return this;
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

	var geometry;

	var Gate = function (_THREE$Mesh) {
		babelHelpers.inherits(Gate, _THREE$Mesh);

		function Gate() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			babelHelpers.classCallCheck(this, Gate);


			if (!geometry) geometry = createRectangleGeometry(options.geometry.width, options.extrude);
			var material = new THREE.MeshPhongMaterial(options.material.off);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Gate).call(this, geometry, material));

			_this.name = 'gate';
			_this.options = options;

			_this._addOutline();
			return _this;
		}

		babelHelpers.createClass(Gate, [{
			key: '_addOutline',
			value: function _addOutline() {
				var geom = new THREE.EdgesGeometry(this.geometry, 0.1);
				var mat = new THREE.LineBasicMaterial(this.options.material.outline);

				var outline = new THREE.LineSegments(geom, mat);
				outline.matrixAutoUpdate = false;

				this.add(outline);
			}
		}, {
			key: 'off',
			value: function off() {
				this.material.setValues(this.options.material.off);
				return this;
			}
		}, {
			key: 'red',
			value: function red() {
				this.material.setValues(this.options.material.red);
				return this;
			}
		}, {
			key: 'green',
			value: function green() {
				this.material.setValues(this.options.material.green);
				return this;
			}
		}, {
			key: 'blue',
			value: function blue() {
				this.material.setValues(this.options.material.blue);
				return this;
			}
		}]);
		return Gate;
	}(THREE.Mesh);

	var tempQuaternion$1 = new THREE.Quaternion();
	var AXIS_Z$1 = new THREE.Vector3(0, 0, 1);

	var Puck = function (_THREE$Mesh) {
		babelHelpers.inherits(Puck, _THREE$Mesh);

		function Puck(options) {
			babelHelpers.classCallCheck(this, Puck);

			var material = new THREE.MeshPhongMaterial();
			var geometry = createPuckGeometry(options.geometry, options.extrude);
			// var geometry = new THREE.SphereGeometry(options.geometry.radius, 12, 8);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Puck).call(this, geometry, material));

			_this.options = options;
			_this._createOutline();
			return _this;
		}

		babelHelpers.createClass(Puck, [{
			key: '_createOutline',
			value: function _createOutline() {
				var outline = this.options.outline;

				if (outline && outline.enabled) {
					var radius = this.options.geometry.radius;
					this.outlineMaterial = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
					this.add(new THREE.Mesh(this.geometry.clone(), this.outlineMaterial));

					var scale = 1 - outline.width / radius;
					this.geometry.scale(scale, scale, scale);

					this.position.z = radius;
				}
			}
		}, {
			key: 'updateColor',
			value: function updateColor(player) {
				var material = this.options.material;
				this.material.setValues(player.team === 1 ? material.red : material.blue);

				var outline = this.options.outline;
				if (outline && outline.enabled) {
					this.outlineMaterial.setValues(player.team === 1 ? outline.red : outline.blue);
				}
			}
		}, {
			key: 'updatePosition',
			value: function updatePosition(player) {
				this.position.x = player.sprite.x;
				this.position.z = player.sprite.y;

				tempQuaternion$1.setFromAxisAngle(AXIS_Z$1, -(player.a || 0) * this.options.rotationCoefficient);
				this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
			}
		}]);
		return Puck;
	}(THREE.Mesh);

	function createPuckGeometry(_ref, extrude) {
		var radius = _ref.radius;
		var holeRadius = _ref.holeRadius;

		var shape = createPuckShape(radius, holeRadius);
		var geometry = extrudeShape(shape, extrude, radius * 2);

		return geometry;
	}

	function createPuckShape(radius, holeRadius) {
		var shape = new THREE.Shape();
		shape.moveTo(radius, 0);
		shape.absarc(0, 0, radius, 0, 2 * Math.PI, false);

		if (holeRadius > 0) {
			var hole = new THREE.Shape();
			hole.moveTo(holeRadius, 0);
			hole.absarc(0, 0, holeRadius, 0, 2 * Math.PI, true);
			shape.holes.push(hole);
		}

		return shape;
	}

	var material;
	var geometry$1;
	var Spike = function (_THREE$Mesh) {
		babelHelpers.inherits(Spike, _THREE$Mesh);

		function Spike() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			babelHelpers.classCallCheck(this, Spike);

			if (!geometry$1) geometry$1 = createSpikeGeometry(options.geometry);
			if (!material) material = new THREE.MeshPhongMaterial(options.material);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Spike).call(this, geometry$1, material));

			_this.name = 'spike';
			return _this;
		}

		return Spike;
	}(THREE.Mesh);

	function createSpikeGeometry() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref$width = _ref.width;
		var width = _ref$width === undefined ? 32 : _ref$width;
		var _ref$segments = _ref.segments;
		var segments = _ref$segments === undefined ? 6 : _ref$segments;

		var geom = new THREE.SphereGeometry(width / 4, segments * 10);

		for (var i = 0; i < geom.vertices.length; i += 10) {
			geom.vertices[i].x = geom.vertices[i].x * 2;
			geom.vertices[i].y = geom.vertices[i].y * 2;
			geom.vertices[i].z = geom.vertices[i].z * 2;
		}

		return geom;
	}

	function createBall(player) {
		var options = this.options;

		var mesh = options.ballsArePucks ? new Puck(options.objects.puck) : new Ball(options.objects.ball);

		mesh.updateColor(player);

		return mesh;
	}

	function drawWalls(map) {
		var params = this.options.objects.wall;
		var extrude = params.extrude;
		var tileSize = this.TILE_SIZE;

		var shapes = createShapesFromTilemap({
			map: map,
			tileSize: tileSize,
			diluteDelta: extrude.bevelEnabled ? -extrude.bevelSize : 0
		});

		var geometry = new THREE.ExtrudeGeometry(shapes, extrude);
		var material = new THREE.MeshPhongMaterial(params.material);

		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'walls';
		mesh.rotateX(Math.PI / 2);
		mesh.position.set(-tileSize / 2, extrude.amount, -tileSize / 2);

		this.scene.add(mesh);

		var edges = new THREE.EdgesHelper(mesh, 0x000000);
		this.scene.add(edges);

		return mesh;
	}

	var objectMap = {
		7: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Spike(this.options.objects.spike) : arguments[0];

			return obj;
		},
		9: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(this.options.objects.gate) : arguments[0];

			return obj.off();
		},
		9.1: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(this.options.objects.gate) : arguments[0];

			return obj.green();
		},
		9.2: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(this.options.objects.gate) : arguments[0];

			return obj.red();
		},
		9.3: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(this.options.objects.gate) : arguments[0];

			return obj.blue();
		},
		10: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Bomb(this.options.objects.bomb) : arguments[0];

			return obj.show();
		},
		10.1: function _() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? new Bomb(this.options.objects.bomb) : arguments[0];

			return obj.hide();
		}
	};

var objects = Object.freeze({
		createBall: createBall,
		drawWalls: drawWalls,
		objectMap: objectMap
	});

	var ball = {
		velocityCoefficient: 0.1,
		rotationCoefficient: 0.015,
		geometry: {
			radius: 19,
			detail: 1
		},
		material: {
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
			width: 2,
			blue: {
				color: 0x0000bb
			},
			red: {
				color: 0xbb0000
			}
		}
	};

	var puck = {
		rotationCoefficient: 0.01,
		geometry: {
			radius: 19,
			holeRadius: 10
		},
		extrude: {
			curveSegments: 12,
			amount: 10,
			steps: 1,
			bevelEnabled: true,
			bevelSegments: 1,
			bevelSize: 5,
			bevelThickness: 6
		},
		material: {
			blue: {
				shading: THREE.FlatShading,
				color: 0x0000ff,
				opacity: 0.9
			},
			red: {
				shading: THREE.FlatShading,
				color: 0xff0000,
				opacity: 0.9
			}
		},
		outline: {
			enabled: false,
			width: 2,
			blue: {
				color: 0x0000ff
			},
			red: {
				color: 0xbb0000
			}
		}
	};

	var wall = {
		material: {
			shading: THREE.FlatShading,
			color: 0x787878,
			opacity: 0.95,
			transparent: true
		},
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
			color: 0x666666,
			opacity: 1
		}
	};

	var bomb = {
		material: {
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
		width: 16,
		height: 10,
		segments: 20
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
		material: {
			outline: {
				color: 0x333333
			},
			off: {
				transparent: true,
				color: 0x000000,
				opacity: 0.0
			},
			blue: {
				color: 0x0000ff,
				opacity: 0.7
			},
			green: {
				color: 0x00ff00,
				opacity: 0.7
			},
			red: {
				color: 0xff0000,
				opacity: 0.7
			}
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
		lights: [{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 }, { enabled: true, type: 'ambient', color: 0x666666 }, { enabled: true, type: 'directional', color: 0xffffff, intensity: 0.9, position: [500, 500, -500] }],
		objects: objects$1,
		ballsArePucks: false
	};

	var t3d = Object.assign({
		TILE_SIZE: 40,
		dynamicObjects: {},
		options: options
	}, objects, utils);

	// Extend tagpro.ready.after
	tagpro.ready.after = readyAfter.bind(null, tagpro);

	// HACK: for debugging
	window.t3d = t3d;

	function createRenderer3D() {
		var TILE_SIZE = tagpro.TILE_SIZE;

		tagpro.tagpro3d = t3d;

		var tr = tagpro.renderer;

		// Make game canvas transparent
		tr.options.transparent = true;

		// Add styles
		addStyles(styles);

		// Draw extra tiles to the 2D background layer.
		after(tr, 'drawBackgroundTiles', function () {
			return drawExtraTilesToBackground(tagpro);
		});

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
			if (zoom !== tagpro.zoom) {
				zoom = tagpro.zoom;
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
		after(tr, 'drawBackgroundTiles', function () {
			t3d.drawWalls(tagpro.map);
		});

		after(tr, 'chunkifyBackground', function () {
			var plane = t3d.createBackgroundPlaneFromChunks(tr.backgroundChunks);
			t3d.scene.add(plane);
			tr.layers.background.visible = false;
		});

		//
		// Tiles
		//

		var originalDrawDynamicTile = tr.drawDynamicTile;
		tr.drawDynamicTile = function (x, y) {
			var tile = tagpro.map[x][y];

			var createOrUpdateObject = t3d.objectMap[tile];

			if (!createOrUpdateObject) {
				originalDrawDynamicTile(x, y);
				return;
			}

			if (!t3d.dynamicObjects[x]) {
				t3d.dynamicObjects[x] = {};
			}

			var mesh = t3d.dynamicObjects[x][y];

			if (!mesh) {
				mesh = createOrUpdateObject.call(t3d);

				// NOTE: Some tiles are "noops", e.g. goal tiles
				if (!mesh) return;

				mesh.rotateX(Math.PI / 2);
				mesh.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
				t3d.scene.add(mesh);

				t3d.dynamicObjects[x][y] = mesh;
			} else {
				createOrUpdateObject.call(t3d, mesh);
			}
		};

		console.log('TagPro 3D Initialized.');
	}

	tagpro.ready(createRenderer3D);

	// var time, delta;
	// var lastTime = performance.now() * 0.001;

	// tagpro.events.register({
	// 	update: function () {
	// 		time = performance.now() * 0.001;
	// 		delta = time - lastTime;
	// 		r3d.update(time, delta);
	// 	}
	// });

}(tagpro,THREE,ClipperLib,$));
//# sourceMappingURL=tagpro-3d.user.js.map