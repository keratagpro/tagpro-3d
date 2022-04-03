// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       0.2.0
// @author        Kera
// @grant         GM_getResourceURL
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/icon.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro.koalabeast.com/game
// @include       https://tagpro.koalabeast.com/game
// @include       http://tangent.jukejuice.com*
// @include       https://tangent.jukejuice.com*
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
// @resource      worker http://localhost:10001/tagpro-3d.worker.js
// @require       https://unpkg.com/three@0.139.2/build/three.min.js
// @require       https://unpkg.com/comlink@4.3.1/dist/umd/comlink.min.js
// ==/UserScript==

(function (tagpro, comlink, THREE) {
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

    function isInGame() {
        return tagpro.state > 0;
    }
    function after(obj, methodName, callback) {
        const orig = obj[methodName];
        obj[methodName] = function () {
            const result = orig.apply(this, arguments);
            callback.apply(this, arguments);
            return result;
        };
    }

    function createRenderer3D() {
        const tr = tagpro.renderer;
        const workerUrl = GM_getResourceURL('worker');
        const worker = new Worker(workerUrl, { type: 'module' });
        const worker3D = comlink.wrap(worker);
        const options = defaultOptions;
        worker3D.setup(options);
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
            const offscreenCanvas = canvas3D.transferControlToOffscreen();
            worker3D.initialize(comlink.transfer(offscreenCanvas, [offscreenCanvas]), tr.canvas.width, tr.canvas.height);
        });
        after(tr, 'updateGraphics', function () {
            worker3D.render();
        });
        //
        // Camera
        //
        after(tr, 'centerView', function () {
            worker3D.resize(tr.canvas.width, tr.canvas.height);
        });
        after(tr, 'centerContainerToPoint', function (x, y) {
            worker3D.updateCameraPosition(x, y);
        });
        after(tr, 'updateCameraZoom', function () {
            worker3D.updateCameraZoom(tagpro.zoom);
        });
        //
        // Balls
        //
        if (options.ballsAre3D) {
            after(tr, 'createBallSprite', (player) => {
                worker3D.createBall(player.id, player.team);
            });
            after(tr, 'updatePlayerColor', (player) => {
                worker3D.updatePlayerColor(player.id, player.team);
            });
            after(tr, 'updatePlayerVisibility', function (player) {
                worker3D.updatePlayerVisibility(player.id, player.sprite.visible);
                // Hide the 2D ball
                player.sprites.actualBall.visible = false;
            });
            after(tr, 'updatePlayerSpritePosition', (player) => {
                const pos = {
                    x: player.sprite.x,
                    y: player.sprite.y,
                    lx: player.lx,
                    ly: player.ly,
                    a: player.a,
                };
                worker3D.updatePlayerPosition(player.id, pos);
            });
            after(tr, 'destroyPlayer', function (player) {
                worker3D.destroyPlayer(player.id);
            });
        }
        //
        // Walls
        //
        if (options.wallsAre3D) {
            after(tr, 'createBackgroundTexture', () => {
                worker3D.createWalls(tagpro.map, tagpro.TILE_SIZE);
            });
        }
        console.log('TagPro 3D Initialized.');
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
            console.log('TagPro 3D Initializing.');
            createRenderer3D();
        }
    });

})(tagpro, Comlink, THREE);
