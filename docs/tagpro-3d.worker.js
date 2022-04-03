import { expose } from 'https://unpkg.com/comlink@4.3.1/dist/esm/comlink.js';
import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';

const RAD = 180 / Math.PI;
function createCamera({ fov = 75, aspect = 1280 / 800, near, far, distance }) {
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = distance;
    camera.up.set(0, 0, -1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
}
function updateCameraFOV(camera, width, height) {
    camera.aspect = width / height;
    camera.fov = 2 * Math.atan(height / (camera.position.y * 2)) * RAD;
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
    constructor(options) {
        const geometry = new THREE.IcosahedronGeometry(options.geometry.radius, options.geometry.detail);
        const material = new THREE.MeshPhongMaterial(options.materials.default);
        super(geometry, material);
        this.options = options;
        this.position.y = options.geometry.radius;
        if (options.outline.enabled) {
            this.addOutline(options.outline, options.outlineMaterials);
        }
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
    updatePosition({ x, y, lx = 0, ly = 0, a = 0 }) {
        this.position.x = x;
        this.position.z = y;
        tempQuaternion$1.setFromAxisAngle(AXIS_X, ly * this.options.velocityCoefficient);
        this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
        tempQuaternion$1.setFromAxisAngle(AXIS_Z, -lx * this.options.velocityCoefficient);
        this.quaternion.multiplyQuaternions(tempQuaternion$1, this.quaternion);
        tempQuaternion$1.setFromAxisAngle(AXIS_Y$1, -a * this.options.rotationCoefficient);
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
    constructor(options) {
        super();
        this.options = options;
        this.options = options;
        this.position.y = options.geometries.cylinder.height / 2;
        this._circle = createCircle(options.geometries.circle, options.materials.circle.default);
        this._circle.position.y = options.geometries.cylinder.height / 2;
        this.add(this._circle);
        this._cylinder = createCylinder(options.geometries.cylinder, options.materials.cylinder.default);
        this.add(this._cylinder);
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

function createBall(options) {
    if (options.ballsArePucks) {
        return new Puck(options.objects.puck);
    }
    else {
        return new Ball(options.objects.ball);
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
const squarePoints = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
];
const diagonalPoints = [
    [0, 1],
    [1, 1],
    [0, 0],
];
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
function createWalls(map, tileSize, options) {
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
    const squareShape = pointsToShape({
        points: squarePoints,
        offset: -0.5,
        scale: tileSize,
    });
    const diagonalShape = pointsToShape({
        points: diagonalPoints,
        offset: -0.5,
        scale: tileSize,
    });
    const squareGeometry = new THREE.ExtrudeGeometry(squareShape, options.extrude);
    const squareMesh = new THREE.InstancedMesh(squareGeometry, wallMaterials, squares.length);
    squareMesh.name = 'walls-squares';
    for (let i = 0; i < squares.length; i++) {
        const square = squares[i];
        const matrix = new THREE.Matrix4();
        matrix.setPosition(square.x * tileSize, square.y * tileSize, 0);
        squareMesh.setMatrixAt(i, matrix);
    }
    const scale = new THREE.Vector3(1, 1, 1);
    const diagonalGeometry = new THREE.ExtrudeGeometry(diagonalShape, options.extrude);
    const diagonalMesh = new THREE.InstancedMesh(diagonalGeometry, wallMaterials, diagonals.length);
    diagonalMesh.name = 'walls-diagonals';
    for (let i = 0; i < diagonals.length; i++) {
        const diagonal = diagonals[i];
        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3(diagonal.x * tileSize, diagonal.y * tileSize, 0);
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

var t3d;
let zoom;
console.log('TagPro3D: loaded worker.');
const handlers = {
    setup(options) {
        t3d = new Renderer3D(options);
    },
    initialize(canvas, width, height) {
        console.log('initialize', width, height);
        t3d.renderer = t3d.createRenderer({
            ...t3d.options.renderer,
            canvas,
        });
        t3d.renderer.setSize(width, height, false);
        t3d.addLights(t3d.options.lights, t3d.scene, t3d.camera);
    },
    render() {
        t3d.renderer?.render(t3d.scene, t3d.camera);
    },
    resize(width, height) {
        t3d.renderer?.setSize(width, height, false);
        t3d.updateCameraFOV(t3d.camera, width, height);
    },
    updateCameraPosition(x, y) {
        t3d.updateCameraPosition(t3d.camera, x, y);
    },
    updateCameraZoom(newZoom) {
        if (zoom !== newZoom) {
            zoom = newZoom;
            t3d.updateCameraZoom(t3d.camera, zoom);
        }
    },
    createBall(id, team) {
        const ball3D = t3d.createBall(t3d.options);
        ball3D.updateByTileId(team === 1 ? 'redball' : 'blueball');
        t3d.players[id] = {
            team,
            object3D: ball3D,
        };
        t3d.scene.add(ball3D);
    },
    updatePlayerColor(id, team) {
        const player = t3d.players[id];
        if (team !== player.team) {
            player.team = team;
            player.object3D.updateByTileId(player.team === 1 ? 'redball' : 'blueball');
        }
    },
    updatePlayerVisibility(id, visible) {
        t3d.players[id].object3D.visible = visible;
    },
    updatePlayerPosition(id, pos) {
        const player3D = t3d.players[id];
        player3D.object3D.updatePosition(pos);
    },
    destroyPlayer(id) {
        t3d.scene.remove(t3d.players[id].object3D);
        delete t3d.players[id];
    },
    createWalls(map, tileSize) {
        const walls3D = t3d.createWalls(map, tileSize, t3d.options.objects.wall);
        t3d.scene.add(walls3D);
    },
};
expose(handlers);
