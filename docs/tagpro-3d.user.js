// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.2.0
// @author        Kera
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/icon.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro.koalabeast.com/game
// @include       https://tagpro.koalabeast.com/game
// @include       http://tangent.jukejuice.com*
// @include       https://tangent.jukejuice.com*
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
// @require       https://unpkg.com/loglevel@1.8.0/lib/loglevel.js
// @require       https://unpkg.com/three@0.139.2/build/three.min.js
// ==/UserScript==

(function (tagpro, THREE, log) {
    'use strict';

    const ballOptions = {
        enabled: true,
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
        enabled: true,
        rotationCoefficient: 0.01,
        geometries: {
            circle: {
                radius: 19,
                segments: 32,
            },
            cylinder: {
                height: 10,
                radiusTop: 19,
                radiusBottom: 19,
                segments: 32,
            },
        },
        materials: {
            circle: {
                default: {
                    transparent: true,
                    alphaTest: 0.1,
                    opacity: 0.9,
                    flatShading: true,
                },
                blue: {},
                red: {},
            },
            cylinder: {
                default: {
                    transparent: true,
                    opacity: 0.9,
                    flatShading: true,
                    side: THREE.DoubleSide,
                },
                blue: {},
                red: {},
            },
        },
    };

    const wallOptions = {
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

    var camera = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createCamera: createCamera,
        updateCameraFOV: updateCameraFOV,
        updateCameraPosition: updateCameraPosition,
        updateCameraZoom: updateCameraZoom
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
        lights.forEach((light) => {
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

    const tempQuaternion$1 = new THREE.Quaternion();
    const AXIS_X = new THREE.Vector3(1, 0, 0);
    const AXIS_Y$1 = new THREE.Vector3(0, 1, 0);
    const AXIS_Z = new THREE.Vector3(0, 0, 1);
    class Ball extends THREE.Mesh {
        options;
        _outline;
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
            const outline = new THREE.Mesh(new THREE.IcosahedronGeometry(params.radius, params.detail), new THREE.MeshBasicMaterial(materials.default));
            this.add(outline);
            this._outline = outline;
        }
        updateByTileId(tileId) {
            const material = this.options.materials[tileId === 'redball' ? 'red' : 'blue'];
            this.material.setValues(material);
            if (this._outline) {
                const outlineMaterial = this.options.outlineMaterials[tileId === 'redball' ? 'red' : 'blue'];
                if (!outlineMaterial.color) {
                    outlineMaterial.color = material.color;
                }
                this._outline.material.setValues(outlineMaterial);
            }
        }
        updatePosition(player) {
            this.position.x = player.sprite.x;
            this.position.z = player.sprite.y;
            if (tagpro.renderer.options.disableBallSpin) {
                return;
            }
            tempQuaternion$1.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.options.velocityCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
            tempQuaternion$1.setFromAxisAngle(AXIS_Z, -(player.lx || 0) * this.options.velocityCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
            tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -(player.a || 0) * this.options.rotationCoefficient);
            this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
        }
    }

    // import { TILE_SIZE, tiles } from 'tagpro';
    const AXIS_Y = new THREE.Vector3(0, 1, 0);
    // const BALL_RADIUS = 38;
    const tempQuaternion = new THREE.Quaternion();
    function createCircle(geometry, material) {
        const geom = new THREE.CircleGeometry(geometry.radius, geometry.segments);
        geom.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshPhongMaterial(material);
        const mesh = new THREE.Mesh(geom, mat);
        return mesh;
    }
    function createCylinder(geometry, material) {
        const geom = new THREE.CylinderGeometry(geometry.radiusTop, geometry.radiusBottom, geometry.height, geometry.segments, 1, true);
        const mat = new THREE.MeshPhongMaterial(material);
        return new THREE.Mesh(geom, mat);
    }
    class Puck extends THREE.Object3D {
        options;
        _circle;
        _cylinder;
        _tileTexture;
        constructor(tileId, options) {
            super();
            this.options = options;
            this.options = options;
            this.position.y = options.geometries.cylinder.height / 2;
            this._circle = createCircle(options.geometries.circle, options.materials.circle.default);
            this._circle.position.y = options.geometries.cylinder.height / 2;
            this.add(this._circle);
            this._cylinder = createCylinder(options.geometries.cylinder, options.materials.cylinder.default);
            this.add(this._cylinder);
            this.updateByTileId(tileId);
        }
        updateByTileId(tileId) {
            const materialName = tileId === 'redball' ? 'red' : 'blue';
            const circle = this._circle;
            const cylinder = this._cylinder;
            const materials = this.options.materials;
            const circleMaterial = materials.circle[materialName];
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
            // }
            circle.material.setValues(circleMaterial);
            const cylinderMaterial = materials.cylinder[materialName];
            cylinder.material.setValues(cylinderMaterial);
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
        }
        else {
            return new Ball(tileId, options.objects.ball);
        }
    }

    var objects = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createBall: createBall
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

    var scene = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createRenderer: createRenderer,
        createScene: createScene,
        resizeCanvas: resizeCanvas
    });

    // import { getTilesTexture } from './utils';
    const WALL = 1;
    const BL = 1.1; // ◣ bottom left
    const TL = 1.2; // ◤ top left
    const TR = 1.3; // ◥ top right
    const BR = 1.4; // ◢ bottom right
    function pointsToShape({ points, offset = 0, scale = 1, }) {
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
        // const cols = tiles.image.width / TILE_SIZE;
        // const rows = tiles.image.height / TILE_SIZE;
        // const topWallTexture = getTilesTexture();
        // setTextureOffset(topWallTexture, cols, rows, options.tiles.top);
        // const sideWallTexture = getTilesTexture();
        // setTextureOffset(sideWallTexture, cols, rows, options.tiles.side);
        const wallMaterials = [
            new THREE.MeshPhongMaterial({ ...options.materials.top }),
            new THREE.MeshPhongMaterial({ ...options.materials.side }),
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
    // function setTextureOffset(texture, cols, rows, tile) {
    // 	const x = tile.x / cols;
    // 	const y = 1 - tile.y / rows;
    // 	const w = (tile.width || 1) / cols;
    // 	const h = (tile.height || 1) / rows;
    // 	texture.offset.set(x, y);
    // 	texture.repeat.set(w, -h);
    // 	texture.needsUpdate = true;
    // }

    var walls = /*#__PURE__*/Object.freeze({
        __proto__: null,
        createWalls: createWalls
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

    // TODO: How to narrow T[K] to a callable function?
    function after(obj, methodName, callback) {
        const orig = obj[methodName];
        obj[methodName] = function () {
            const result = orig.apply(this, arguments);
            callback.apply(this, arguments);
            return result;
        };
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('');
    new THREE.ObjectLoader();

    const originalFactory = log.methodFactory;
    log.methodFactory = function (methodName, logLevel, loggerName) {
        const rawMethod = originalFactory(methodName, logLevel, loggerName);
        return function (message) {
            rawMethod('[tagpro3d] ' + message);
        };
    };
    log.setLevel(log.getLevel());

    function isInGame() {
        return tagpro.state > 0;
    }

    function createRenderer3D() {
        const t3d = new Renderer3D(defaultOptions);
        const tr = tagpro.renderer;
        //
        // Renderer
        //
        after(tr, 'createBackground', function () {
            const canvas3D = document.createElement('canvas');
            canvas3D.width = tr.canvas.width;
            canvas3D.height = tr.canvas.height;
            const threeTexture = PIXI.Texture.fromCanvas(canvas3D);
            const threeSprite = new PIXI.Sprite(threeTexture);
            threeSprite.name = 'tagpro3d';
            /* eslint-disable @typescript-eslint/no-empty-function */
            threeSprite.updateTransform = function () { };
            tr.layers.foreground.addChild(threeSprite);
            t3d.renderer = t3d.createRenderer({
                ...t3d.options.renderer,
                canvas: canvas3D,
            });
            t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
        });
        after(tr, 'updateGraphics', function () {
            t3d.renderer?.render(t3d.scene, t3d.camera);
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
            });
        }
    }

    /**
     * Delays callbacks when resourcesLoaded == true, so it's possible to run stuff
     * between tagpro.ready and tagpro.ready.after.
     */
    tagpro.ready.after = function (callback) {
        if (tagpro.resourcesLoaded) {
            setTimeout(callback, 0);
        }
        else {
            tagpro._afterReadyCallbacks.push(callback);
        }
    };
    tagpro.ready(function () {
        if (isInGame()) {
            log.info('Initializing.');
            createRenderer3D();
            log.info('Initialized.');
        }
    });

})(tagpro, THREE, log);
