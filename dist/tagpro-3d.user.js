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
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
// @require       https://unpkg.com/three@0.139.0/build/three.min.js
// @require       https://keratagpro.github.io/tagpro-3d/rgbquant.js
// ==/UserScript==

(function (tagpro, THREE, RgbQuant, $) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var tagpro__namespace = /*#__PURE__*/_interopNamespace(tagpro);
    var THREE__namespace = /*#__PURE__*/_interopNamespace(THREE);
    var RgbQuant__default = /*#__PURE__*/_interopDefaultLegacy(RgbQuant);
    var $__default = /*#__PURE__*/_interopDefaultLegacy($);

    var RAD = 180 / Math.PI;
    function createCamera(_a) {
        var _b = _a.fov, fov = _b === void 0 ? 75 : _b, _c = _a.aspect, aspect = _c === void 0 ? 1280 / 800 : _c, near = _a.near, far = _a.far, distance = _a.distance;
        var camera = new THREE__namespace.PerspectiveCamera(fov, aspect, near, far);
        camera.position.y = distance;
        camera.up.set(0, 0, -1);
        camera.lookAt(new THREE__namespace.Vector3(0, 0, 0));
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

    var camera = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createCamera: createCamera,
        updateCameraFOV: updateCameraFOV,
        updateCameraPosition: updateCameraPosition,
        updateCameraZoom: updateCameraZoom
    });

    function addAmbientLight(scene, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.color, color = _c === void 0 ? 0xffffff : _c;
        var light = new THREE__namespace.AmbientLight(color);
        scene.add(light);
        return light;
    }
    function addCameraLight(camera, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.color, color = _c === void 0 ? 0xffffff : _c, _d = _b.intensity, intensity = _d === void 0 ? 1 : _d, _e = _b.distance, distance = _e === void 0 ? 0 : _e, _f = _b.decay, decay = _f === void 0 ? 0 : _f;
        var light = new THREE__namespace.PointLight(color, intensity, distance, decay);
        camera.add(light);
        return light;
    }
    function addDirectionalLight(scene, _a) {
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.color, color = _d === void 0 ? 0xffffff : _d, _e = _c.intensity, intensity = _e === void 0 ? 1.0 : _e, _f = _c.position, position = _f === void 0 ? [500, -500, 400] : _f;
        var light = new THREE__namespace.DirectionalLight(color, intensity);
        (_b = light.position).set.apply(_b, position);
        scene.add(light);
        return light;
    }
    function addLights(lights, scene, camera) {
        lights.forEach(function (light) {
            if (!light.enabled)
                return;
            if (light.type === 'camera') {
                addCameraLight(camera, light);
            }
            else if (light.type === 'ambient') {
                addAmbientLight(scene, light);
            }
            else if (light.type === 'directional') {
                addDirectionalLight(scene, light);
            }
        });
    }

    var lights = /*#__PURE__*/Object.freeze({
        __proto__: null,
        addAmbientLight: addAmbientLight,
        addCameraLight: addCameraLight,
        addDirectionalLight: addDirectionalLight,
        addLights: addLights
    });

    // https://www.reddit.com/r/TagPro/wiki/api#wiki_tiles
    var BOMB = 10;
    var BOMB_OFF = 10.1;
    var GATE_BLUE = 9.3;
    var GATE_GREEN = 9.1;
    var GATE_OFF = 9;
    var GATE_RED = 9.2;
    var PORTAL = 13;
    var PORTAL_OFF = 13.1;
    var SPEEDPAD = 5;
    var SPEEDPAD_BLUE = 15;
    var SPEEDPAD_BLUE_OFF = 15.1;
    var SPEEDPAD_OFF = 5.1;
    var SPEEDPAD_RED = 14;
    var SPEEDPAD_RED_OFF = 14.1;
    var SPIKE = 7;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var ballOptions = {
        enabled: true,
        velocityCoefficient: 0.1,
        rotationCoefficient: 0.015,
        geometry: {
            detail: 1,
            radius: 17
        },
        materials: {
            "default": {
                flatShading: true
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
            "default": {
                side: THREE__namespace.BackSide
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
                "default": {
                    transparent: true,
                    alphaTest: 0.1,
                    opacity: 0.9,
                    flatShading: true
                },
                blue: {},
                red: {}
            },
            cylinder: {
                "default": {
                    transparent: true,
                    opacity: 0.9,
                    flatShading: true,
                    side: THREE__namespace.DoubleSide
                },
                blue: {},
                red: {}
            }
        }
    };
    var wallOptions = {
        materials: {
            top: {
                opacity: 0.7,
                flatShading: true,
                transparent: true
            },
            side: {
                opacity: 0.7,
                flatShading: true,
                transparent: true
            }
        },
        extrude: {
            depth: 40,
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
            "default": {
                transparent: true,
                side: THREE__namespace.DoubleSide,
                opacity: 0.3
            },
            off: {},
            green: {},
            red: {},
            blue: {}
        },
        outlineMaterials: {
            "default": {},
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

    var objects$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ballOptions: ballOptions,
        puck: puck,
        wallOptions: wallOptions,
        spike: spike,
        bomb: bomb,
        button: button,
        flag: flag,
        gate: gate,
        tile: tile,
        animatedTile: animatedTile
    });

    function getDominantColor(canvas) {
        var quantizer = new RgbQuant__default["default"]({
            colors: 4
        });
        quantizer.sample(canvas);
        var palette = quantizer.palette(true, true);
        if (!palette) {
            return null;
        }
        palette = palette.map(function (_a) {
            var r = _a[0], g = _a[1], b = _a[2];
            return new THREE__namespace.Color(r / 256, g / 256, b / 256);
        });
        // Try to find a non-grayscale color.
        var color = palette.find(function (col) { return col.getHSL().s > 0.5; });
        return color || palette[0];
    }

    console.log.bind(console);
    var time = console.time.bind(console);
    var timeEnd = console.timeEnd.bind(console);

    function cropImageToCanvas(image, x, y, width, height) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context === null || context === void 0 ? void 0 : context.drawImage(image, x, y, width, height, 0, 0, width, height);
        return canvas;
    }

    var textureLoader = new THREE__namespace.TextureLoader();
    textureLoader.setCrossOrigin('');
    var objectLoader = new THREE__namespace.ObjectLoader();
    function loadObjectFromJson(json) {
        var mesh = objectLoader.parse(json);
        return mesh;
    }

    var tileColorCache = {};
    function getDominantColorForTile(img, _a, width, height) {
        var x = _a.x, y = _a.y;
        if (width === void 0) { width = tagpro.TILE_SIZE; }
        if (height === void 0) { height = tagpro.TILE_SIZE; }
        var key = "".concat(img.src, "-").concat(x, "-").concat(y, "-").concat(width, "-").concat(height);
        if (!tileColorCache[key]) {
            var cropped = cropImageToCanvas(img, x * tagpro.TILE_SIZE, y * tagpro.TILE_SIZE, width, height);
            tileColorCache[key] = getDominantColor(cropped);
        }
        return tileColorCache[key];
    }

    var tempQuaternion$1 = new THREE__namespace.Quaternion();
    var AXIS_X = new THREE__namespace.Vector3(1, 0, 0);
    var AXIS_Y$1 = new THREE__namespace.Vector3(0, 1, 0);
    var AXIS_Z = new THREE__namespace.Vector3(0, 0, 1);
    var Ball = /** @class */ (function (_super) {
        __extends(Ball, _super);
        function Ball(tileId, options) {
            if (options === void 0) { options = ballOptions; }
            var _this = this;
            var _geometry = new THREE__namespace.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
            var _material = new THREE__namespace.MeshPhongMaterial(options.materials["default"]);
            _this = _super.call(this, _geometry, _material) || this;
            _this.options = options;
            _this.position.y = options.geometry.radius;
            _this.addOutline(options.outline, options.outlineMaterials);
            _this.updateByTileId(tileId);
            return _this;
        }
        Ball.prototype.addOutline = function (params, materials) {
            if (!params.enabled)
                return;
            var outline = new THREE__namespace.Mesh(new THREE__namespace.IcosahedronGeometry(params.radius, params.detail), new THREE__namespace.MeshBasicMaterial(materials["default"]));
            this.add(outline);
            this._outline = outline;
        };
        Ball.prototype.updateByTileId = function (tileId) {
            var material = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];
            if (!material.color)
                material.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
            this.material.setValues(material);
            if (this._outline) {
                var outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];
                if (!outlineMaterial.color)
                    outlineMaterial.color = material.color;
                this._outline.material.setValues(outlineMaterial);
            }
        };
        Ball.prototype.updatePosition = function (player) {
            this.position.x = player.sprite.x;
            this.position.z = player.sprite.y;
            tempQuaternion$1.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.options.velocityCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
            tempQuaternion$1.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.options.velocityCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
            tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -(player.a || 0) * this.options.rotationCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
        };
        return Ball;
    }(THREE__namespace.Mesh));

    var metadata = {
    	version: 4.4,
    	type: "Object",
    	generator: "Object3D.toJSON"
    };
    var geometries$1 = [
    	{
    		uuid: "533B036E-7BD8-412A-9826-C270344C731B",
    		type: "SphereGeometry",
    		radius: 16,
    		widthSegments: 16,
    		heightSegments: 16,
    		phiStart: 0,
    		phiLength: 6.283185307179586,
    		thetaStart: 0,
    		thetaLength: 3.141592653589793
    	},
    	{
    		uuid: "EDC5A60E-30F9-46AD-8F00-57694EA6046F",
    		type: "CylinderGeometry",
    		radiusTop: 2,
    		radiusBottom: 3,
    		height: 3,
    		radialSegments: 32,
    		heightSegments: 1,
    		openEnded: false
    	},
    	{
    		uuid: "D0B38B94-F57F-43DA-B2D5-EE90F990436E",
    		type: "TorusGeometry",
    		radius: 4.38,
    		tube: 0.76,
    		radialSegments: 8,
    		tubularSegments: 4,
    		arc: 1.5
    	}
    ];
    var materials = [
    	{
    		uuid: "1F3DD044-3AE4-4584-86A8-C8456E25A261",
    		type: "MeshPhongMaterial",
    		color: 0,
    		emissive: 0,
    		specular: 1118481,
    		shininess: 30
    	},
    	{
    		uuid: "F74765F4-EA20-4137-94DD-F083E9E5D714",
    		type: "MeshPhongMaterial",
    		color: 8421504,
    		emissive: 0,
    		specular: 1118481,
    		shininess: 30
    	},
    	{
    		uuid: "0E765FB3-278F-4EFE-BE0F-656922DD6B22",
    		type: "MeshPhongMaterial",
    		color: 16777215,
    		emissive: 0,
    		specular: 1118481,
    		shininess: 30
    	}
    ];
    var object = {
    	uuid: "DA35D27C-42A2-431C-88DE-E56516B50BBC",
    	type: "Mesh",
    	name: "bomb",
    	matrix: [
    		0.7899922132492065,
    		-0.4315394461154938,
    		0.43552955985069275,
    		0,
    		0.6131168603897095,
    		0.5560322999954224,
    		-0.5611735582351685,
    		0,
    		0,
    		0.7103532552719116,
    		0.7038453221321106,
    		0,
    		0,
    		0,
    		0,
    		1
    	],
    	geometry: "533B036E-7BD8-412A-9826-C270344C731B",
    	material: "1F3DD044-3AE4-4584-86A8-C8456E25A261",
    	children: [
    		{
    			uuid: "3DD112B4-0A42-4E6A-A96D-5BF76D3D877D",
    			type: "Mesh",
    			name: "head",
    			matrix: [
    				1,
    				0,
    				0,
    				0,
    				0,
    				1,
    				0,
    				0,
    				0,
    				0,
    				1,
    				0,
    				0.36041587591171265,
    				16.43364143371582,
    				2.5216023921966553,
    				1
    			],
    			geometry: "EDC5A60E-30F9-46AD-8F00-57694EA6046F",
    			material: "F74765F4-EA20-4137-94DD-F083E9E5D714",
    			children: [
    				{
    					uuid: "36583292-82F4-43A0-A341-165C18F8536A",
    					type: "Mesh",
    					name: "fuse",
    					matrix: [
    						-0.7485897541046143,
    						-0.19866932928562164,
    						0.6325692534446716,
    						0,
    						-0.15174666047096252,
    						0.9800665974617004,
    						0.12822814285755157,
    						0,
    						-0.6454349756240845,
    						0,
    						-0.7638152241706848,
    						0,
    						3.29097580909729,
    						1.9205838441848755,
    						-2.8663127422332764,
    						1
    					],
    					geometry: "D0B38B94-F57F-43DA-B2D5-EE90F990436E",
    					material: "0E765FB3-278F-4EFE-BE0F-656922DD6B22"
    				}
    			]
    		}
    	]
    };
    var bombModel = {
    	metadata: metadata,
    	geometries: geometries$1,
    	materials: materials,
    	object: object
    };

    var bombModel$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        metadata: metadata,
        geometries: geometries$1,
        materials: materials,
        object: object,
        'default': bombModel
    });

    var Bomb = /** @class */ (function (_super) {
        __extends(Bomb, _super);
        function Bomb(tileId, params) {
            if (params === void 0) { params = bomb; }
            var _this = _super.call(this) || this;
            _this.materials = params.materials;
            _this.add(loadObjectFromJson(bombModel$1));
            var bombMaterial = _this.getObjectByName('bomb').material;
            if (!bombMaterial.color)
                bombMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
            bombMaterial.setValues(params.materials.body);
            _this.updateByTileId(tileId);
            return _this;
        }
        Bomb.prototype.updateByTileId = function (tileId) {
            if (tileId == BOMB)
                this.show();
            else if (tileId == BOMB_OFF)
                this.hide();
        };
        Bomb.prototype.show = function () {
            var params = this.materials.show;
            this.traverse(function (o) {
                if (!o.material)
                    return;
                o.material.setValues(params);
            });
        };
        Bomb.prototype.hide = function () {
            var params = this.materials.hide;
            this.traverse(function (o) {
                if (!o.material)
                    return;
                o.material.setValues(params);
            });
        };
        return Bomb;
    }(THREE__namespace.Object3D));

    var _geometry$1;
    var Gate = /** @class */ (function (_super) {
        __extends(Gate, _super);
        function Gate(tileId, params) {
            if (params === void 0) { params = gate; }
            var _this = this;
            if (!_geometry$1) {
                _geometry$1 = new THREE__namespace.BoxGeometry(params.geometry.width, params.geometry.height, params.geometry.width, 1, 1, 1);
                _geometry$1.translate(0, params.geometry.height / 2, 0);
            }
            var material = params.materials["default"];
            if (!material.map) {
                material = Object.assign({
                    map: undefined()
                }, material);
            }
            var _material = new THREE__namespace.MeshPhongMaterial(material);
            _this = _super.call(this, _geometry$1, _material) || this;
            _this.name = 'gate';
            _this.params = params;
            _this.addOutline(params.outlineMaterials["default"]);
            _this.updateByTileId(tileId);
            return _this;
        }
        Gate.prototype.addOutline = function (params) {
            var outline = new THREE__namespace.LineSegments(new THREE__namespace.EdgesGeometry(this.geometry, 0.1), new THREE__namespace.LineBasicMaterial(params));
            outline.matrixAutoUpdate = false;
            this.add(outline);
            this._outlineMaterial = outline.material;
        };
        Gate.prototype.updateByTileId = function (tileId) {
            if (tileId == GATE_OFF)
                this.off();
            else if (tileId == GATE_GREEN)
                this.green();
            else if (tileId == GATE_RED)
                this.red();
            else if (tileId == GATE_BLUE)
                this.blue();
        };
        Gate.prototype.updateMaterials = function (tileId, material, outlineMaterial) {
            if (!outlineMaterial.color)
                outlineMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
            this._outlineMaterial.setValues(outlineMaterial);
            this.material.map.setTile(tagpro.tiles[tileId]);
            this.material.setValues(material);
        };
        Gate.prototype.off = function () {
            this.updateMaterials(GATE_OFF, this.params.materials.off, this.params.outlineMaterials.off);
        };
        Gate.prototype.green = function () {
            this.updateMaterials(GATE_GREEN, this.params.materials.green, this.params.outlineMaterials.green);
        };
        Gate.prototype.red = function () {
            this.updateMaterials(GATE_RED, this.params.materials.red, this.params.outlineMaterials.red);
        };
        Gate.prototype.blue = function () {
            this.updateMaterials(GATE_BLUE, this.params.materials.blue, this.params.outlineMaterials.blue);
        };
        return Gate;
    }(THREE__namespace.Mesh));

    var AXIS_Y = new THREE__namespace.Vector3(0, 1, 0);
    var tempQuaternion = new THREE__namespace.Quaternion();
    function createCircle(geometry, material) {
        var geom = new THREE__namespace.CircleGeometry(geometry.radius, geometry.segments);
        geom.rotateX(-Math.PI / 2);
        var mat = new THREE__namespace.MeshPhongMaterial(material);
        var mesh = new THREE__namespace.Mesh(geom, mat);
        return mesh;
    }
    function createCylinder(geometry, material) {
        var geom = new THREE__namespace.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.segments, 1, true);
        var mat = new THREE__namespace.MeshPhongMaterial(material);
        return new THREE__namespace.Mesh(geom, mat);
    }
    var Puck = /** @class */ (function (_super) {
        __extends(Puck, _super);
        function Puck(tileId, params) {
            if (params === void 0) { params = puck; }
            var _this = _super.call(this) || this;
            _this.params = params;
            _this.position.y = params.geometries.cylinder.height / 2;
            _this._circle = createCircle(params.geometries.circle, params.materials.circle["default"]);
            _this._circle.position.y = params.geometries.cylinder.height / 2;
            _this.add(_this._circle);
            _this._cylinder = createCylinder(params.geometries.cylinder, params.materials.cylinder["default"]);
            _this.add(_this._cylinder);
            _this.updateByTileId(tileId);
            return _this;
        }
        Puck.prototype.updateByTileId = function (tileId) {
            var materialName = tileId === 'redball' ? 'red' : 'blue';
            var circle = this._circle;
            var cylinder = this._cylinder;
            var materials = this.params.materials;
            var circleMaterial = materials.circle[materialName];
            // Use built-in ball texture if not explicitly set
            // if (!circleMaterial.map) {
            // 	if (!this._tileTexture) {
            // 		this._tileTexture = utils.getTilesTexture();
            // 		circle.material.map = this._tileTexture!;
            // 	}
            // 	const texture = circle.material.map;
            // 	texture.setTile(tiles[tileId]);
            // 	// HACK: Shrink texture mapping since ball is 38px, not 40px.
            // 	texture.offset.x += 1 / TILE_SIZE / 16;
            // 	texture.offset.y += 1 / TILE_SIZE / 11;
            // 	texture.repeat.x -= 2 / TILE_SIZE / 16;
            // 	texture.repeat.y -= 2 / TILE_SIZE / 11;
            // } else if (!circleMaterial.color) {
            // 	circleMaterial.color = utils.getDominantColorForTile(tiles.image, tiles[tileId]);
            // }
            circle.material.setValues(circleMaterial);
            var cylinderMaterial = materials.cylinder[materialName];
            if (!cylinderMaterial.color)
                cylinderMaterial.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[tileId]);
            cylinder.material.setValues(cylinderMaterial);
        };
        Puck.prototype.updatePosition = function (player) {
            this.position.x = player.sprite.x;
            this.position.z = player.sprite.y;
            tempQuaternion.setFromAxisAngle(AXIS_Y, -(player.a || 0) * this.params.rotationCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion, this.quaternion);
        };
        return Puck;
    }(THREE__namespace.Object3D));

    var _material;
    var _geometry;
    var Spike = /** @class */ (function (_super) {
        __extends(Spike, _super);
        function Spike(tileId, _a) {
            var _b = _a === void 0 ? spike : _a, geometry = _b.geometry, material = _b.material;
            var _this = this;
            if (!_geometry) {
                _geometry = createSpikeGeometry(geometry);
            }
            if (!_material) {
                if (!material.color) {
                    material.color = getDominantColorForTile(tagpro.tiles.image, tagpro.tiles[SPIKE]);
                }
                _material = new THREE__namespace.MeshPhongMaterial(material);
            }
            _this = _super.call(this, _geometry, _material) || this;
            _this.name = 'spike';
            return _this;
        }
        Spike.prototype.updateByTileId = function () { };
        return Spike;
    }(THREE__namespace.Mesh));
    function createSpikeGeometry(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.width, width = _c === void 0 ? 32 : _c, _d = _b.segments, segments = _d === void 0 ? 6 : _d;
        var geom = new THREE__namespace.SphereGeometry(width / 4, segments * 10);
        for (var i = 0; i < geom.vertices.length; i += 10) {
            geom.vertices[i].x = geom.vertices[i].x * 2;
            geom.vertices[i].y = geom.vertices[i].y * 2;
            geom.vertices[i].z = geom.vertices[i].z * 2;
        }
        return geom;
    }

    var _a, _b;
    function createBall(player) {
        var options = this.options;
        var tileId = player.team === 1 ? 'redball' : 'blueball';
        var mesh = options.ballsArePucks ? new Puck(tileId, options.objects.puck) : new Ball(tileId, options.objects.ball);
        return mesh;
    }
    var objectMap = (_a = {},
        _a[BOMB] = Bomb,
        _a[BOMB_OFF] = Bomb,
        // [constants.BUTTON]: Tile,
        // [constants.ENDZONE_BLUE]: Tile,
        // [constants.ENDZONE_RED]: Tile,
        // [constants.FLAG_BLUE]: Tile,
        // [constants.FLAG_BLUE_TAKEN]: Tile,
        // [constants.FLAG_RED]: Tile,
        // [constants.FLAG_RED_TAKEN]: Tile,
        // [constants.FLAG_YELLOW]: Tile,
        // [constants.FLAG_YELLOW_TAKEN]: Tile,
        _a[GATE_BLUE] = Gate,
        _a[GATE_GREEN] = Gate,
        _a[GATE_OFF] = Gate,
        _a[GATE_RED] = Gate,
        // [constants.PORTAL]: AnimatedTile,
        // [constants.PORTAL_OFF]: AnimatedTile,
        // [constants.POWERUP_BOMB]: Tile,
        // [constants.POWERUP_GRIP]: Tile,
        // [constants.POWERUP_NONE]: Tile,
        // [constants.POWERUP_SPEED]: Tile,
        // [constants.POWERUP_TAGPRO]: Tile,
        // [constants.SPEEDPAD]: AnimatedTile,
        // [constants.SPEEDPAD_BLUE]: AnimatedTile,
        // [constants.SPEEDPAD_BLUE_OFF]: AnimatedTile,
        // [constants.SPEEDPAD_OFF]: AnimatedTile,
        // [constants.SPEEDPAD_RED]: AnimatedTile,
        // [constants.SPEEDPAD_RED_OFF]: AnimatedTile,
        _a[SPIKE] = Spike,
        _a);
    var animatedAssetMap = (_b = {},
        _b[PORTAL] = 'portal',
        _b[PORTAL_OFF] = 'portal',
        _b[SPEEDPAD] = 'speedpad',
        _b[SPEEDPAD_BLUE] = 'speedpadBlue',
        _b[SPEEDPAD_BLUE_OFF] = 'speedpadBlue',
        _b[SPEEDPAD_OFF] = 'speedpad',
        _b[SPEEDPAD_RED] = 'speedpadRed',
        _b[SPEEDPAD_RED_OFF] = 'speedpadRed',
        _b);

    var objects = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createBall: createBall,
        objectMap: objectMap,
        animatedAssetMap: animatedAssetMap
    });

    var defaultOptions = {
        renderer: {
            antialias: true,
            alpha: true
        },
        camera: {
            near: 10,
            far: 10000,
            distance: 1000
        },
        lights: [
            { enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 },
            { enabled: true, type: 'ambient', color: 0x666666 },
            { enabled: true, type: 'directional', color: 0xffffff, intensity: 1.0, position: [-500, 500, -500] },
        ],
        objects: objects$1,
        ballsArePucks: false
    };

    function createRenderer(params) {
        var renderer = new THREE__namespace.WebGLRenderer(params);
        renderer.domElement.id = 'tagpro3d';
        document.body.appendChild(renderer.domElement);
        return renderer;
    }
    function createScene() {
        var scene = new THREE__namespace.Scene();
        return scene;
    }
    function resizeCanvas(gameCanvas, renderer) {
        if (!renderer) {
            return;
        }
        $__default["default"](renderer.domElement)
            .css({
            left: gameCanvas.offsetLeft,
            top: gameCanvas.offsetTop,
            width: null,
            height: null
        })
            .attr({
            width: gameCanvas.width,
            height: gameCanvas.height
        });
        renderer.setSize(gameCanvas.width, gameCanvas.height);
    }

    var scene = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createRenderer: createRenderer,
        createScene: createScene,
        resizeCanvas: resizeCanvas
    });

    function createPathGeometry() {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        var shape = new THREE__namespace.Shape();
        points.forEach(function (_a) {
            var x = _a[0], y = _a[1];
            return shape.moveTo(x, y);
        });
        var geometry = new THREE__namespace.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        geometry.translate(-0.5, -0.5, -0.5);
        return geometry;
    }
    var geometries = {
        square: createPathGeometry([0, 0], [1, 0], [1, 1], [0, 1]),
        diagonalBottomLeft: createPathGeometry([0, 1], [1, 1], [0, 0]),
        diagonalTopLeft: createPathGeometry([0, 0], [0, 1], [1, 0]),
        diagonalTopRight: createPathGeometry([1, 0], [1, 1], [0, 0]),
        diagonalBottomRight: createPathGeometry([0, 1], [1, 0], [1, 1])
    };

    var WALL = 1;
    var BL = 1.1; // ◣ bottom left
    var TL = 1.2; // ◤ top left
    var TR = 1.3; // ◥ top right
    var BR = 1.4; // ◢ bottom right
    function createWalls(map, options) {
        // const topWallTexture = getTilesTexture();
        // setTextureOffset(topWallTexture, cols, rows, options.tiles.top);
        // const sideWallTexture = getTilesTexture();
        // setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);
        var geom = createGeometryFromTilemap(map);
        var mesh = new THREE__namespace.Mesh(geom, new THREE__namespace.MeshPhongMaterial({ color: 0xff0000 }));
        // const mesh = new THREE.Mesh(geom, [
        // 	new THREE.MeshPhongMaterial(Object.assign({ map: topWallTexture }, options.materials.top)),
        // 	new THREE.MeshPhongMaterial(Object.assign({ map: sideWallTexture }, options.materials.side)),
        // ]);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = tagpro.TILE_SIZE / 2;
        mesh.scale.set(tagpro.TILE_SIZE, tagpro.TILE_SIZE, tagpro.TILE_SIZE);
        this.scene.add(mesh);
        // const edges = new THREE.EdgesHelper(mesh, 0x000000);
        // this.scene.add(edges);
    }
    // function setTextureOffset(texture, cols, rows, tile) {
    // 	const x = tile.x / cols;
    // 	const y = 1 - tile.y / rows;
    // 	const w = (tile.width || 1) / cols;
    // 	const h = (tile.height || 1) / rows;
    // 	texture.offset.set(x, y);
    // 	texture.repeat.set(w, -h);
    // 	texture.needsUpdate = true;
    // }
    function createGeometryFromTilemap(tagproMap) {
        var tileGeometries = [];
        time('creating wall geometry');
        tagproMap.forEach(function (columns, x) {
            columns.forEach(function (tile, y) {
                var tileGeometry;
                switch (tile) {
                    case WALL:
                        tileGeometry = geometries.square;
                        break;
                    case BL:
                        tileGeometry = geometries.diagonalBottomLeft;
                        break;
                    case TL:
                        tileGeometry = geometries.diagonalTopLeft;
                        break;
                    case TR:
                        tileGeometry = geometries.diagonalTopRight;
                        break;
                    case BR:
                        tileGeometry = geometries.diagonalBottomRight;
                        break;
                    default:
                        return;
                }
                tileGeometry = tileGeometry.clone();
                tileGeometry.translate(x, y, 0);
                tileGeometries.push(tileGeometry);
            });
        });
        timeEnd('creating wall geometry');
        time('merging wall geometry vertices');
        var geometry = THREE__namespace.BufferGeometryUtils.mergeBufferGeometries(tileGeometries);
        timeEnd('merging wall geometry vertices');
        return geometry;
    }

    var walls = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createWalls: createWalls
    });

    var Renderer3D = /** @class */ (function () {
        function Renderer3D(options) {
            if (options === void 0) { options = {}; }
            this.options = Object.assign({}, defaultOptions, options);
            this.dynamicObjects = {};
            this.updatableObjects = [];
            this.camera = createCamera(this.options.camera);
            this.scene = createScene();
            this.scene.add(this.camera);
        }
        return Renderer3D;
    }());
    Object.assign(Renderer3D.prototype, camera, lights, objects, scene, walls);

    function isInGame() {
        return tagpro__namespace.state > 0;
    }

    // TODO: How to narrow T[K] to a callable function?
    function after(obj, methodName, callback) {
        var orig = obj[methodName];
        obj[methodName] = function () {
            var result = orig.apply(this, arguments);
            callback.apply(this, arguments);
            return result;
        };
    }

    function createRenderer3D() {
        var after$1 = after;
        var tr = tagpro__namespace.renderer;
        var t3d = new Renderer3D();
        Object.assign(tagpro__namespace, { tagpro3d: t3d });
        //
        // Renderer
        //
        // TODO: Find a sensible tagpro.renderer function to hook this stuff into
        after$1(tr, 'drawStartingSplats', function () {
            t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
        });
        after$1(tr, 'createRenderer', function () {
            t3d.renderer = t3d.createRenderer(t3d.options.renderer);
        });
        // after(tr, 'updateGraphics', function () {
        // 	t3d.update(performance.now());
        // });
        after$1(tr, 'render', function () {
            var _a;
            (_a = t3d.renderer) === null || _a === void 0 ? void 0 : _a.render(t3d.scene, t3d.camera);
        });
        //
        // Camera
        //
        after$1(tr, 'centerView', function () {
            t3d.resizeCanvas(tr.canvas, t3d.renderer);
            t3d.updateCameraFOV(t3d.camera, tr.canvas);
        });
        after$1(tr, 'centerContainerToPoint', function (x, y) {
            t3d.updateCameraPosition(t3d.camera, x, y);
        });
        var zoom;
        after$1(tr, 'updateCameraZoom', function () {
            if (zoom !== tagpro__namespace.zoom) {
                zoom = tagpro__namespace.zoom;
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
        after$1(tr, 'updatePlayerVisibility', function (player) {
            player.object3d.visible = player.sprite.visible;
        });
        after$1(tr, 'updatePlayerSpritePosition', function (player) {
            player.object3d.updatePosition(player);
        });
        after$1(tr, 'destroyPlayer', function (player) {
            t3d.scene.remove(player.object3d);
            delete player.object3d;
        });
        //
        // Walls
        //
        after$1(tr, 'createBackgroundTexture', function () {
            t3d.createWalls(tagpro__namespace.map, t3d.options.objects.wall);
        });
        console.log('TagPro 3D Initialized.');
    }

    /**
     * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
     * between tagpro.ready and tagpro.ready.after.
     */
    tagpro__namespace.ready.after = function (callback) {
        if (tagpro__namespace.resourcesLoaded) {
            setTimeout(callback, 0);
        }
        else {
            tagpro__namespace._afterReadyCallbacks.push(callback);
        }
    };
    tagpro__namespace.ready(function () {
        if (isInGame()) {
            createRenderer3D();
        }
    });

})(tagpro, THREE, RgbQuant, $);
