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
// @require       https://keratagpro.github.io/tagpro-3d/clipper.min.js
// ==/UserScript==

(function (tagpro,THREE,$,clipper) {
	'use strict';

	var tagpro__default = 'default' in tagpro ? tagpro['default'] : tagpro;
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

	var loader = new THREE.TextureLoader();

	var config = {
		tileSize: tagpro.TILE_SIZE,
		renderer: {
			antialias: true,
			alpha: true
		},
		camera: {
			near: 10,
			far: 10000,
			distance: 1000
		},
		lights: [{ enabled: false, type: 'camera', color: 0xffffff, intensity: 0.8 }, { enabled: true, type: 'ambient', color: 0x666666 }, { enabled: true, type: 'directional', color: 0xffffff, intensity: 0.8, position: [-500, -500, -400] }],
		materials: {
			ball: {
				default: {
					shiny: true,
					map: loader.load('./3d/assets/textures/tile.png'),
					side: THREE.DoubleSide
				},
				red: {
					color: 0xff0000
				},
				blue: {
					color: 0x0000ff
				},
				outline: {
					color: 0x000000,
					side: THREE.BackSide
				}
			},
			bomb: {
				default: {
					color: 0x000000
				},
				visible: {
					visible: true
				},
				hidden: {
					visible: false
				}
			},
			button: {
				shiny: true,
				color: 0xa06e32
			},
			flag: {
				base: {
					side: THREE.DoubleSide
				},
				cloth: {},
				blue: {
					color: 0x0000ff
				},
				red: {
					color: 0xff0000
				},
				yellow: {
					color: 0xffff00
				}
			},
			gate: {
				default: {
					shiny: true,
					transparent: true
				},
				off: {
					color: 0x000000,
					opacity: 0.2,
					wireframe: true
				},
				blue: {
					color: 0x0000ff,
					opacity: 0.7,
					wireframe: false
				},
				green: {
					color: 0x00ff00,
					opacity: 0.7,
					wireframe: false
				},
				red: {
					color: 0xff0000,
					opacity: 0.7,
					wireframe: false
				}
			},
			spike: {
				shiny: true,
				color: 0x666666,
				opacity: 1
			},
			wall: {
				shiny: true,
				color: 0x787878,
				opacity: 0.95,
				transparent: true
			}
		},
		objects: {
			ball: {
				isPuck: false,
				hasOutline: true,
				velocityCoefficient: 0.1,
				rotationCoefficient: 0.015,
				sphere: {
					radius: 18,
					widthSegments: 16,
					heightSegments: 12
				},
				puck: {
					radius: 18,
					extrude: {
						amount: 10,
						bevelEnabled: true,
						bevelSegments: 2,
						bevelSize: 6,
						bevelThickness: 10
					}
				},
				outline: {
					radius: 19
				}
			},
			button: {
				width: 16,
				height: 10,
				segments: 20
			},
			flag: {
				animate: false,
				width: 40,
				height: 20,
				waveDepth: 2,
				widthSegments: 10,
				heightSegments: 5,
				restDistance: 4
			},
			gate: {
				width: tagpro.TILE_SIZE,
				extrude: {
					amount: tagpro.TILE_SIZE,
					bevelEnabled: true,
					bevelSegments: 1,
					bevelSize: 6,
					bevelThickness: 10
				}
			},
			spike: {
				width: 32,
				segments: 6
			},
			wall: {
				extrude: {
					amount: tagpro.TILE_SIZE * 1.5,
					steps: 1,
					bevelEnabled: true,
					bevelSegments: 1,
					bevelSize: 6,
					bevelThickness: 10
				}
			}
		}
	};

	/**
	 * @author alteredq / http://alteredqualia.com/
	 * @author mr.doob / http://mrdoob.com/
	 */

	var Detector = {
		canvas: !!window.CanvasRenderingContext2D,
		webgl: function () {
			try {
				var canvas = document.createElement('canvas');
				return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
			} catch (e) {
				return false;
			}
		}(),
		workers: !!window.Worker,
		fileapi: window.File && window.FileReader && window.FileList && window.Blob,

		getWebGLErrorMessage: function getWebGLErrorMessage() {
			var element = document.createElement('div');
			element.id = 'webgl-error-message';
			element.style.fontFamily = 'monospace';
			element.style.fontSize = '13px';
			element.style.fontWeight = 'normal';
			element.style.textAlign = 'center';
			element.style.background = '#fff';
			element.style.color = '#000';
			element.style.padding = '1.5em';
			element.style.width = '400px';
			element.style.margin = '5em auto 0';

			if (!this.webgl) {
				element.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n') : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join('\n');
			}

			return element;
		},

		addGetWebGLMessage: function addGetWebGLMessage(parameters) {
			var parent, id, element;

			parameters = parameters || {};

			parent = parameters.parent !== undefined ? parameters.parent : document.body;
			id = parameters.id !== undefined ? parameters.id : 'oldie';

			element = Detector.getWebGLErrorMessage();
			element.id = id;

			parent.appendChild(element);
		}
	};

	var simplify = clipper.Clipper.SimplifyPolygons;
	var lighten = clipper.JS.Lighten;

	var BL = 1.1; // ◣ bottom left
	var TL = 1.2; // ◤ top left
	var TR = 1.3; // ◥ top right
	var BR = 1.4; // ◢ bottom right

	function createShapesFromTilemap(_ref) {
		var data = _ref.data;
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

		var paths = createClipperPaths(data, tileSize);

		var simple = simplify(paths, clipper.PolyFillType.pftNonZero);
		var light = lighten(simple, lightenTolerance);

		var co = new clipper.ClipperOffset(miterLimit, arcTolerance);
		co.AddPaths(light, clipper.JoinType.jtMiter, clipper.EndType.etClosedPolygon);

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

			outer.forEach(function (_ref3) {
				var x = _ref3.X;
				var y = _ref3.Y;
				return shape.moveTo(x, y);
			});

			shape.holes = holes.map(function (hole) {
				var holeShape = new THREE.Shape();
				hole.forEach(function (_ref4) {
					var x = _ref4.X;
					var y = _ref4.Y;
					return holeShape.moveTo(x, y);
				});

				return holeShape;
			});

			return shape;
		});
	}

	function createClipperPaths(data, tileSize) {
		var height = data.length;
		var width = data[0].length;

		return data.reduce(function (mem, columns, x) {
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

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	var funcTag = '[object Function]';
	var genTag = '[object GeneratorFunction]';
	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$1 = objectProto$1.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array constructors, and
	  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString$1.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type {Function}
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, isStrict, result) {
	  result || (result = []);

	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && isArrayLikeObject(value) && (isStrict || isArray(value) || isArguments(value))) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array.length;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * The base implementation of `_.pick` without support for individual
	 * property names.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} props The property names to pick.
	 * @returns {Object} Returns the new object.
	 */
	function basePick(object, props) {
	  object = Object(object);
	  return arrayReduce(props, function (result, key) {
	    if (key in object) {
	      result[key] = object[key];
	    }
	    return result;
	  }, {});
	}

	/**
	 * A faster alternative to `Function#apply`, this function invokes `func`
	 * with the `this` binding of `thisArg` and the arguments of `args`.
	 *
	 * @private
	 * @param {Function} func The function to invoke.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {...*} args The arguments to invoke `func` with.
	 * @returns {*} Returns the result of `func`.
	 */
	function apply(func, thisArg, args) {
	  var length = args.length;
	  switch (length) {
	    case 0:
	      return func.call(thisArg);
	    case 1:
	      return func.call(thisArg, args[0]);
	    case 2:
	      return func.call(thisArg, args[0], args[1]);
	    case 3:
	      return func.call(thisArg, args[0], args[1], args[2]);
	  }
	  return func.apply(thisArg, args);
	}

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3);
	 * // => 3
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3');
	 * // => 3
	 */
	function toNumber(value) {
	  if (isObject(value)) {
	    var other = isFunction(value.valueOf) ? value.valueOf() : value;
	    value = isObject(other) ? other + '' : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
	}

	var INFINITY = 1 / 0;
	var MAX_INTEGER = 1.7976931348623157e+308;
	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3');
	 * // => 3
	 */
	function toInteger(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = value < 0 ? -1 : 1;
	    return sign * MAX_INTEGER;
	  }
	  var remainder = value % 1;
	  return value === value ? remainder ? value - remainder : value : 0;
	}

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://mdn.io/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.rest(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function rest(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? func.length - 1 : toInteger(start), 0);
	  return function () {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        array = Array(length);

	    while (++index < length) {
	      array[index] = args[start + index];
	    }
	    switch (start) {
	      case 0:
	        return func.call(this, array);
	      case 1:
	        return func.call(this, args[0], array);
	      case 2:
	        return func.call(this, args[0], args[1], array);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = array;
	    return apply(func, this, otherArgs);
	  };
	}

	/**
	 * Creates an object composed of the picked `object` properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {...(string|string[])} [props] The property names to pick, specified
	 *  individually or in arrays.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': '2', 'c': 3 };
	 *
	 * _.pick(object, ['a', 'c']);
	 * // => { 'a': 1, 'c': 3 }
	 */
	var pick = rest(function (object, props) {
	  return object == null ? {} : basePick(object, baseFlatten(props, 1));
	});

	var GAME_WIDTH = 1280;
	var GAME_HEIGHT = 800;
	var ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;
	var RAD = 180 / Math.PI;
	var materialProperties = ['color', 'specular', 'shininess', 'opacity', 'map', 'shading', 'blending', 'wireframe', 'depthTest', 'depthWrite', 'side', 'transparent'];

	var loader$2 = new THREE.ObjectLoader();

	function loadObjectFromJson(json) {
		var mesh = loader$2.parse(json);
		mesh.rotateX(-Math.PI / 2);
		return mesh;
	}

	function createMaterial(params) {
		var Material = params.shiny ? THREE.MeshPhongMaterial : THREE.MeshLambertMaterial;
		return new Material(pick(params, materialProperties));
	}

	function createRenderer() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref$alpha = _ref.alpha;
		var alpha = _ref$alpha === undefined ? true : _ref$alpha;
		var _ref$antialias = _ref.antialias;
		var antialias = _ref$antialias === undefined ? true : _ref$antialias;

		var renderer = new THREE.WebGLRenderer({
			alpha: alpha,
			antialias: antialias
		});

		document.body.appendChild(renderer.domElement);
		renderer.domElement.id = 'walls3d';

		return renderer;
	}

	function createScene() {
		var scene = new THREE.Scene();
		return scene;
	}

	function createCamera() {
		var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref2$aspect = _ref2.aspect;
		var aspect = _ref2$aspect === undefined ? 1280 / 800 : _ref2$aspect;
		var _ref2$fov = _ref2.fov;
		var fov = _ref2$fov === undefined ? 75 : _ref2$fov;
		var _ref2$near = _ref2.near;
		var near = _ref2$near === undefined ? 10 : _ref2$near;
		var _ref2$far = _ref2.far;
		var far = _ref2$far === undefined ? 10000 : _ref2$far;
		var _ref2$distance = _ref2.distance;
		var distance = _ref2$distance === undefined ? 1000 : _ref2$distance;

		var camera = new THREE.PerspectiveCamera(fov, ASPECT_RATIO, near, far);

		// to make 0,0 be top left
		camera.up = new THREE.Vector3(0, -1, 0);

		camera.position.z = -distance;
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		return camera;
	}

	function updateCameraFOV(camera, canvasHeight) {
		camera.fov = 2 * Math.atan(canvasHeight / (-camera.position.z * 2)) * RAD;
		camera.updateProjectionMatrix();
	}

	function createRectangle() {
		var width = arguments.length <= 0 || arguments[0] === undefined ? config.tileSize : arguments[0];

		var half = width / 2;

		var shape = new THREE.Shape();
		shape.moveTo(-half, -half);
		shape.lineTo(half, -half);
		shape.lineTo(half, half);
		shape.lineTo(-half, half);

		return shape;
	}

	function createCircle() {
		var radius = arguments.length <= 0 || arguments[0] === undefined ? config.tileSize / 2 : arguments[0];

		var shape = new THREE.Shape();

		shape.moveTo(radius, 0);
		shape.absarc(0, 0, radius, 0, 2 * Math.PI, false);

		return shape;
	}

	function createRectangleGeometry() {
		var width = arguments.length <= 0 || arguments[0] === undefined ? config.tileSize : arguments[0];
		var extrude = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var shape = createRectangle(width);

		var geometry = shape.extrude(extrude);
		geometry.translate(0, 0, -extrude.amount);

		if (extrude.bevelEnabled) {
			var xy = 1 / ((width + extrude.bevelSize * 2) / width);
			geometry.scale(xy, xy, 1);
		}

		return geometry;
	}

	function createPuckGeometry() {
		var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref3$radius = _ref3.radius;
		var radius = _ref3$radius === undefined ? config.tileSize : _ref3$radius;
		var _ref3$extrude = _ref3.extrude;
		var extrude = _ref3$extrude === undefined ? {} : _ref3$extrude;

		var shape = createCircle(radius);

		var geometry = shape.extrude(extrude);
		geometry.translate(0, 0, -extrude.amount);

		if (extrude.bevelEnabled) {
			var width = radius * 2;
			var xy = 1 / ((width + extrude.bevelSize * 2) / width);
			geometry.scale(xy, xy, 1);
		}

		return geometry;
	}

	function createSphereGeometry() {
		var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref4$radius = _ref4.radius;
		var radius = _ref4$radius === undefined ? config.tileSize : _ref4$radius;
		var _ref4$widthSegments = _ref4.widthSegments;
		var widthSegments = _ref4$widthSegments === undefined ? 16 : _ref4$widthSegments;
		var _ref4$heightSegments = _ref4.heightSegments;
		var heightSegments = _ref4$heightSegments === undefined ? 12 : _ref4$heightSegments;

		var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

		return geometry;
	}

	function createClothGeometry(_ref6) {
		var _ref6$width = _ref6.width;
		var width = _ref6$width === undefined ? config.tileSize : _ref6$width;
		var _ref6$height = _ref6.height;
		var height = _ref6$height === undefined ? config.tileSize / 2 : _ref6$height;
		var _ref6$widthSegments = _ref6.widthSegments;
		var widthSegments = _ref6$widthSegments === undefined ? config.tileSize / 4 : _ref6$widthSegments;
		var _ref6$heightSegments = _ref6.heightSegments;
		var heightSegments = _ref6$heightSegments === undefined ? config.tileSize / 8 : _ref6$heightSegments;
		var _ref6$depth = _ref6.depth;
		var depth = _ref6$depth === undefined ? config.tileSize / 4 : _ref6$depth;

		var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
		geometry.translate(width / 2, height / 2, 0);

		for (var col = 0; col <= widthSegments; col++) {
			var z = Math.sin(col / widthSegments * Math.PI * 2) * depth;
			for (var row = 0; row <= heightSegments; row++) {
				geometry.vertices[row * (widthSegments + 1) + col].z = z;
			}
		}

		geometry.rotateX(Math.PI / 2);

		return geometry;
	}

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

	var metadata = { "version": 4.4, "type": "Object", "generator": "Object3D.toJSON" };
	var geometries = [{ "uuid": "533B036E-7BD8-412A-9826-C270344C731B", "type": "SphereGeometry", "radius": 16, "widthSegments": 16, "heightSegments": 16, "phiStart": 0, "phiLength": 6.283185307179586, "thetaStart": 0, "thetaLength": 3.141592653589793 }, { "uuid": "EDC5A60E-30F9-46AD-8F00-57694EA6046F", "type": "CylinderGeometry", "radiusTop": 2, "radiusBottom": 3, "height": 3, "radialSegments": 32, "heightSegments": 1, "openEnded": false }, { "uuid": "D0B38B94-F57F-43DA-B2D5-EE90F990436E", "type": "TorusGeometry", "radius": 4.38, "tube": 0.76, "radialSegments": 8, "tubularSegments": 4, "arc": 1.5 }];
	var materials$1 = [{ "uuid": "1F3DD044-3AE4-4584-86A8-C8456E25A261", "type": "MeshPhongMaterial", "color": 0, "emissive": 0, "specular": 1118481, "shininess": 30 }, { "uuid": "5EA66438-C4FF-47F2-AF74-98D9402BB676", "type": "MeshStandardMaterial", "color": 16777215, "emissive": 0 }, { "uuid": "F329FA2E-2C71-4D28-A17F-11DC28B61168", "type": "MeshLambertMaterial", "color": 16777215, "emissive": 0 }];
	var object = { "uuid": "DA35D27C-42A2-431C-88DE-E56516B50BBC", "type": "Mesh", "name": "bomb", "matrix": [0.7899922132492065, -0.5194664001464844, 0.325679212808609, 0, 0.6131168603897095, 0.6693249344825745, -0.4196329712867737, 0, 1.5541177234013048e-8, 0.5311862230300903, 0.8472551107406616, 0, 0, 0, 0, 1], "geometry": "533B036E-7BD8-412A-9826-C270344C731B", "material": "1F3DD044-3AE4-4584-86A8-C8456E25A261", "children": [{ "uuid": "3DD112B4-0A42-4E6A-A96D-5BF76D3D877D", "type": "Mesh", "name": "head", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.36041587591171265, 16.43364143371582, 2.5216023921966553, 1], "geometry": "EDC5A60E-30F9-46AD-8F00-57694EA6046F", "material": "5EA66438-C4FF-47F2-AF74-98D9402BB676", "children": [{ "uuid": "36583292-82F4-43A0-A341-165C18F8536A", "type": "Mesh", "name": "fuse", "matrix": [0.9713379740715027, -0.2377026230096817, 0, 0, 0.2377026230096817, 0.9713379740715027, 0, 0, 0, 0, 1, 0, -4.180724620819092, 2.1819465160369873, 0.011280663311481476, 1], "geometry": "D0B38B94-F57F-43DA-B2D5-EE90F990436E", "material": "F329FA2E-2C71-4D28-A17F-11DC28B61168" }] }] };
	var bombModel = {
		metadata: metadata,
		geometries: geometries,
		materials: materials$1,
		object: object
	};

	var Bomb = function (_THREE$Object3D) {
		babelHelpers.inherits(Bomb, _THREE$Object3D);

		function Bomb() {
			var materials = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			babelHelpers.classCallCheck(this, Bomb);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Bomb).call(this));

			_this.materials = materials;

			var mesh = loadObjectFromJson(bombModel);

			_this.add(mesh);

			_this.getObjectByName('bomb').material.setValues(materials.default);
			return _this;
		}

		babelHelpers.createClass(Bomb, [{
			key: 'show',
			value: function show() {
				var _this2 = this;

				this.traverse(function (o) {
					return o.material && o.material.setValues(_this2.materials.visible);
				});
				return this;
			}
		}, {
			key: 'hide',
			value: function hide() {
				var _this3 = this;

				this.traverse(function (o) {
					return o.material && o.material.setValues(_this3.materials.hidden);
				});
				return this;
			}
		}]);
		return Bomb;
	}(THREE.Object3D);

	var metadata$1 = { "version": 4.4, "type": "Object", "generator": "Object3D.toJSON" };
	var geometries$1 = [{ "uuid": "54670159-6998-4362-BA46-888A21257CD5", "type": "CylinderGeometry", "radiusTop": 14, "radiusBottom": 16, "height": 6, "radialSegments": 16, "heightSegments": 1, "openEnded": false }, { "uuid": "AE5197D7-422A-4045-8124-3856FD770B02", "type": "CylinderGeometry", "radiusTop": 2, "radiusBottom": 2, "height": 80, "radialSegments": 16, "heightSegments": 1, "openEnded": false }];
	var materials$2 = [{ "uuid": "77B0FED5-70AE-4355-8AB2-880F5272D835", "type": "MeshStandardMaterial", "color": 16777215, "emissive": 0 }, { "uuid": "01C26A60-8C68-4AE5-8748-FBA22CC708C0", "type": "MeshStandardMaterial", "color": 16777215, "emissive": 0 }];
	var object$1 = { "uuid": "0160F14F-4FD1-4031-8DF0-997DE6CF2B01", "type": "Mesh", "name": "flagpole", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3, 0, 1], "geometry": "54670159-6998-4362-BA46-888A21257CD5", "material": "77B0FED5-70AE-4355-8AB2-880F5272D835", "children": [{ "uuid": "CD24A77F-955F-4EE5-8B5F-ED57DCF91B30", "type": "Mesh", "name": "pole", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 40, 0, 1], "geometry": "AE5197D7-422A-4045-8124-3856FD770B02", "material": "01C26A60-8C68-4AE5-8748-FBA22CC708C0", "children": [{ "uuid": "10481D52-7276-49C2-89AE-363B68A34731", "type": "Group", "name": "anchor", "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 40, 0, 1] }] }] };
	var flagpoleModel = {
		metadata: metadata$1,
		geometries: geometries$1,
		materials: materials$2,
		object: object$1
	};

	var _tempVec3 = new THREE.Vector3();

	var Cloth = function () {
		function Cloth() {
			var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var _ref$widthSegments = _ref.widthSegments;
			var widthSegments = _ref$widthSegments === undefined ? 10 : _ref$widthSegments;
			var _ref$heightSegments = _ref.heightSegments;
			var heightSegments = _ref$heightSegments === undefined ? 6 : _ref$heightSegments;
			var _ref$restDistance = _ref.restDistance;
			var restDistance = _ref$restDistance === undefined ? 4 : _ref$restDistance;
			var _ref$useWind = _ref.useWind;
			var useWind = _ref$useWind === undefined ? true : _ref$useWind;
			var _ref$gravity = _ref.gravity;
			var gravity = _ref$gravity === undefined ? new THREE.Vector3(0, 0, 9.81) : _ref$gravity;
			var _ref$drag = _ref.drag;
			var drag = _ref$drag === undefined ? 0.97 : _ref$drag;
			var _ref$mass = _ref.mass;
			var mass = _ref$mass === undefined ? 0.1 : _ref$mass;
			var _ref$speed = _ref.speed;
			var speed = _ref$speed === undefined ? 0.001 : _ref$speed;
			babelHelpers.classCallCheck(this, Cloth);

			console.log(arguments[0]);
			this._widthSegments = widthSegments;
			this._heightSegments = heightSegments;
			this._windForce = new THREE.Vector3(0.1, 0.05, 0);

			this.useWind = true;
			this.gravity = gravity.multiplyScalar(mass);
			this.speed = speed;

			var clothFunction = createClothFunction(widthSegments * restDistance, heightSegments * restDistance);

			this.particles = createParticles(widthSegments, heightSegments, clothFunction, mass, drag);
			this.constraints = createConstraints(widthSegments, heightSegments, this.particles, restDistance);

			this.geometry = new THREE.ParametricGeometry(clothFunction, widthSegments, heightSegments);
			this.geometry.dynamic = true;

			console.table(this.geometry.vertices);

			window.cloth = this;

			this._initPins();
			this.pinEdge();
		}

		babelHelpers.createClass(Cloth, [{
			key: '_initPins',
			value: function _initPins() {
				var left = [];
				for (var i = 0; i <= this._heightSegments; i++) {
					left.push(i * (this._widthSegments + 1));
				}

				this._pinsEdge = left;
				this._pinsCorner = [0, this._widthSegments + 1];
			}
		}, {
			key: 'pinEdge',
			value: function pinEdge() {
				this.pins = this._pinsEdge;
			}
		}, {
			key: 'pinCorner',
			value: function pinCorner() {
				this.pins = this._pinsCorner;
			}
		}, {
			key: 'setWind',
			value: function setWind(x, y, z) {
				this._windForce.set(x, y, z);
			}
		}, {
			key: 'update',
			value: function update(delta) {
				if (this.useWind) {
					applyWind(this.geometry, this.particles, this._windForce);
				}

				applyGravity(this.geometry, this.particles, this.gravity, delta * this.speed);

				handleConstraints(this.constraints);

				handlePins(this.particles, this.pins);
			}
		}, {
			key: 'updateGeometry',
			value: function updateGeometry() {
				var len = this.particles.length;

				for (var i = 0; i < len; i++) {
					this.geometry.vertices[i].copy(this.particles[i].position);
				}

				this.geometry.computeFaceNormals();
				this.geometry.computeVertexNormals();

				this.geometry.normalsNeedUpdate = true;
				this.geometry.verticesNeedUpdate = true;
			}
		}]);
		return Cloth;
	}();

	var Particle = function () {
		function Particle(func, x, y, z, mass, drag) {
			babelHelpers.classCallCheck(this, Particle);

			this.position = func(x, y);
			this.previous = func(x, y);
			this.original = func(x, y);

			this.accel = new THREE.Vector3(0, 0, 0);
			this.mass = mass;
			this.massInv = 1 / mass;
			this.drag = drag;
		}

		// Force -> Acceleration


		babelHelpers.createClass(Particle, [{
			key: 'addForce',
			value: function addForce(force) {
				this.accel.add(_tempVec3.copy(force).multiplyScalar(this.massInv));
			}

			// Performs verlet integration

		}, {
			key: 'integrate',
			value: function integrate(timesq) {
				var pos = _tempVec3.subVectors(this.position, this.previous);
				pos.multiplyScalar(this.drag).add(this.position);
				pos.add(this.accel.multiplyScalar(timesq));

				_tempVec3 = this.previous;
				this.previous = this.position;
				this.position = pos;

				this.accel.set(0, 0, 0);
			}
		}]);
		return Particle;
	}();

	function createClothFunction(width, height) {
		return function (u, v) {
			var x = u * width;
			var y = 0;
			var z = v * height;
			return new THREE.Vector3(x, y, z);
		};
	}

	function createParticles(width, height, func, mass, drag) {
		var particles = [];
		var u, v;

		// Create particles
		for (v = 0; v <= height; v++) {
			for (u = 0; u <= width; u++) {
				particles.push(new Particle(func, u / width, v / height, 0, mass, drag));
			}
		}

		return particles;
	}

	function createConstraints(width, height, particles, restDistance) {
		var index = function index(u, v) {
			return u + v * (width + 1);
		};
		var constraints = [];
		var u, v;

		// Structural
		for (v = 0; v < height; v++) {
			for (u = 0; u < width; u++) {
				constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistance]);

				constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistance]);
			}
		}

		for (u = width, v = 0; v < height; v++) {
			constraints.push([particles[index(u, v)], particles[index(u, v + 1)], restDistance]);
		}

		for (v = height, u = 0; u < width; u++) {
			constraints.push([particles[index(u, v)], particles[index(u + 1, v)], restDistance]);
		}

		// While many system uses shear and bend springs,
		// the relax constraints model seem to be just fine
		// using structural springs.
		// Shear
		// var diagonalDist = Math.sqrt(restDistance * restDistance * 2);

		// for (v=0;v<h;v++) {
		// 	for (u=0;u<w;u++) {
		// 		constraints.push([
		// 			particles[index(u, v)],
		// 			particles[index(u+1, v+1)],
		// 			diagonalDist
		// 		]);
		//
		// 		constraints.push([
		// 			particles[index(u+1, v)],
		// 			particles[index(u, v+1)],
		// 			diagonalDist
		// 		]);
		// 	}
		// }

		return constraints;
	}

	// Aerodynamics forces
	function applyWind(geometry, particles, force) {
		var faces = geometry.faces;
		var len = faces.length;

		for (var i = 0; i < len; i++) {
			var face = faces[i];
			var normal = face.normal;

			_tempVec3.copy(normal).normalize().multiplyScalar(normal.dot(force));
			particles[face.a].addForce(_tempVec3);
			particles[face.b].addForce(_tempVec3);
			particles[face.c].addForce(_tempVec3);
		}
	}

	function applyGravity(geometry, particles, gravity, timesq) {
		var len = particles.length;
		for (var i = 0; i < len; i++) {
			var particle = particles[i];
			particle.addForce(gravity);
			particle.integrate(timesq);
		}
	}

	function satisfyConstraints(p1, p2, distance) {
		_tempVec3.subVectors(p2.position, p1.position);
		var currentDist = _tempVec3.length();
		if (currentDist == 0) return; // prevents division by 0
		var correction = _tempVec3.multiplyScalar(1 - distance / currentDist);
		var correctionHalf = correction.multiplyScalar(0.5);
		p1.position.add(correctionHalf);
		p2.position.sub(correctionHalf);
	}

	function handleConstraints(constraints) {
		var len = constraints.length;

		// Start Constraints
		for (var i = 0; i < len; i++) {
			var constraint = constraints[i];
			satisfyConstraints(constraint[0], constraint[1], constraint[2]);
		}

		// Floor Constaints
		// particles = cloth.particles;
		// il = particles.length;
		// for (i = 0; i < il; i++) {
		// 	particle = particles[i];
		// 	let pos = particle.position;
		// 	if (pos.y < - 250) {
		// 		pos.y = - 250;
		// 	}
		// }
	}

	function handlePins(particles, pins) {
		var len = pins.length;

		// Pin Constraints
		for (var i = 0; i < len; i++) {
			var xy = pins[i];
			var p = particles[xy];
			p.position.copy(p.original);
			p.previous.copy(p.original);
		}
	}

	var Flag = function (_THREE$Object3D) {
		babelHelpers.inherits(Flag, _THREE$Object3D);

		function Flag() {
			var clothMaterial = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			babelHelpers.classCallCheck(this, Flag);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Flag).call(this));

			var pole = loadObjectFromJson(flagpoleModel);
			_this.add(pole);

			_this.anchor.add(createCloth(clothMaterial, options));
			return _this;
		}

		babelHelpers.createClass(Flag, [{
			key: 'show',
			value: function show() {
				this.traverse(function (o) {
					return o.material && (o.material.opacity = 1.0);
				});
				this.anchor.visible = true;
				return this;
			}
		}, {
			key: 'hide',
			value: function hide() {
				this.traverse(function (o) {
					return o.material && (o.material.opacity = 0.2);
				});
				this.anchor.visible = false;
				return this;
			}
		}, {
			key: 'update',
			value: function update(time, delta) {
				if (this.params.cloth.animate) {
					this.cloth.update(delta);
				}
			}
		}, {
			key: 'anchor',
			get: function get() {
				return this.getObjectByName('anchor');
			}
		}]);
		return Flag;
	}(THREE.Object3D);

	function createCloth(material, params) {
		var geometry;
		if (params.animate) {
			var cloth = new Cloth(params);
			geometry = cloth.geometry;
		} else {
			geometry = createClothGeometry(params);
			// geometry.rotateX(-0.1);
		}

		var material1 = createMaterial(material);

		return new THREE.Mesh(geometry, material1);
	}

	var geometry;

	var Gate = function (_THREE$Mesh) {
		babelHelpers.inherits(Gate, _THREE$Mesh);

		function Gate() {
			var materials = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			babelHelpers.classCallCheck(this, Gate);


			if (!geometry) geometry = createRectangleGeometry(options.width, options.extrude);
			var material = createMaterial(materials.default);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Gate).call(this, geometry, material));

			_this.name = 'gate';

			_this.options = options;
			_this.materials = materials;
			return _this;
		}

		babelHelpers.createClass(Gate, [{
			key: 'off',
			value: function off() {
				this.material.setValues(this.materials.off);
				return this;
			}
		}, {
			key: 'red',
			value: function red() {
				this.material.setValues(this.materials.red);
				return this;
			}
		}, {
			key: 'green',
			value: function green() {
				this.material.setValues(this.materials.green);
				return this;
			}
		}, {
			key: 'blue',
			value: function blue() {
				this.material.setValues(this.materials.blue);
				return this;
			}
		}]);
		return Gate;
	}(THREE.Mesh);

	var spike = config.objects.spike;

	var _material;
	var _geometry;
	var Spike = function (_THREE$Mesh) {
		babelHelpers.inherits(Spike, _THREE$Mesh);

		function Spike() {
			var material = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
			babelHelpers.classCallCheck(this, Spike);

			if (!_geometry) _geometry = createSpikeGeometry(options);
			if (!_material) _material = createMaterial(material);

			var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Spike).call(this, _geometry, _material));

			_this.name = 'spike';
			return _this;
		}

		return Spike;
	}(THREE.Mesh);

	function createSpikeGeometry() {
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		var _ref$width = _ref.width;
		var width = _ref$width === undefined ? spike.width : _ref$width;
		var _ref$segments = _ref.segments;
		var segments = _ref$segments === undefined ? spike.segments : _ref$segments;

		var geometry = new THREE.SphereGeometry(width / 4, segments * 10);

		for (var i = 0; i < geometry.vertices.length; i += 10) {
			geometry.vertices[i].x = geometry.vertices[i].x * 2;
			geometry.vertices[i].y = geometry.vertices[i].y * 2;
			geometry.vertices[i].z = geometry.vertices[i].z * 2;
		}

		return geometry;
	}

	var options;
	var materials;

	var ObjectManager = function () {
		function ObjectManager(config) {
			babelHelpers.classCallCheck(this, ObjectManager);

			options = config.objects;
			materials = config.materials;
		}

		babelHelpers.createClass(ObjectManager, [{
			key: 'bomb',
			value: function bomb() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Bomb(materials.bomb) : arguments[0];

				return obj.show();
			}
		}, {
			key: 'bombHidden',
			value: function bombHidden() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Bomb(materials.bomb) : arguments[0];

				return obj.hide();
			}
		}, {
			key: 'flagRed',
			value: function flagRed() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.red, options.flag) : arguments[0];

				return obj.show();
			}
		}, {
			key: 'flagRedTaken',
			value: function flagRedTaken() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.red, options.flag) : arguments[0];

				return obj.hide();
			}
		}, {
			key: 'flagBlue',
			value: function flagBlue() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.blue, options.flag) : arguments[0];

				return obj.show();
			}
		}, {
			key: 'flagBlueTaken',
			value: function flagBlueTaken() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.blue, options.flag) : arguments[0];

				return obj.hide();
			}
		}, {
			key: 'flagYellow',
			value: function flagYellow() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.yellow, options.flag) : arguments[0];

				return obj.show();
			}
		}, {
			key: 'flagYellowTaken',
			value: function flagYellowTaken() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Flag(materials.flag.yellow, options.flag) : arguments[0];

				return obj.hide();
			}
		}, {
			key: 'gateOff',
			value: function gateOff() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(materials.gate, options.gate) : arguments[0];

				return obj.off();
			}
		}, {
			key: 'gateRed',
			value: function gateRed() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(materials.gate, options.gate) : arguments[0];

				return obj.red();
			}
		}, {
			key: 'gateGreen',
			value: function gateGreen() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(materials.gate, options.gate) : arguments[0];

				return obj.green();
			}
		}, {
			key: 'gateBlue',
			value: function gateBlue() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Gate(materials.gate, options.gate) : arguments[0];

				return obj.blue();
			}
		}, {
			key: 'spike',
			value: function spike() {
				var obj = arguments.length <= 0 || arguments[0] === undefined ? new Spike(materials.spike, options.spike) : arguments[0];

				return obj;
			}
		}, {
			key: 'byTileId',
			value: function byTileId(id) {
				switch (id) {
					case 3:
						return this.flagRed;
					case 3.1:
						return this.flagRedTaken;
					case 4:
						return this.flagBlue;
					case 4.1:
						return this.flagBlueTaken;
					case 16:
						return this.flagYellow;
					case 16.1:
						return this.flagYellowTaken;
					case 7:
						return this.spike;
					case 9:
						return this.gateOff;
					case 9.1:
						return this.gateGreen;
					case 9.2:
						return this.gateRed;
					case 9.3:
						return this.gateBlue;
					case 10:
						return this.bomb;
					case 10.1:
						return this.bombHidden;
					// floor: 2,
					// powerupNone: 6,
				}
			}
		}]);
		return ObjectManager;
	}();

	var tagpro$1;
	var loader$1 = new THREE.TextureLoader();

	var AXIS_X = new THREE.Vector3(1, 0, 0);
	var AXIS_Y = new THREE.Vector3(0, 1, 0);
	var AXIS_Z = new THREE.Vector3(0, 0, 1);
	var quaternion = new THREE.Quaternion();

	var World = function () {
		function World(tp, config) {
			babelHelpers.classCallCheck(this, World);

			tagpro$1 = tp;

			this.config = config;
			this.materials = config.materials;
			this.ballConfig = config.objects.ball;

			this.camera = createCamera(config.camera);
			this.renderer = createRenderer(config.renderer);
			this.scene = createScene();

			this.scene.add(this.camera);

			addLights(this.config.lights, this.scene, this.camera);

			this._updatables = [];
			this._updatablesLength = 0;

			this.players = [];
			this.manager = new ObjectManager(config);
		}

		babelHelpers.createClass(World, [{
			key: 'initObjects',
			value: function initObjects(width, height) {
				// Create blank array of 3D objects
				this.objects = Array(width);
				for (var i = 0; i < width; i++) {
					this.objects[i] = Array(height);
				}
			}
		}, {
			key: 'drawWalls',
			value: function drawWalls(map, pixiLayers) {
				var extrude = this.config.objects.wall.extrude;

				var shapes = createShapesFromTilemap({
					data: map,
					tileSize: this.config.tileSize,
					diluteDelta: -extrude.bevelSize
				});

				var geometry = new THREE.ExtrudeGeometry(shapes, extrude);
				var material = createMaterial(this.materials.wall);

				var width = map.length * this.config.tileSize;
				var height = map[0].length * this.config.tileSize;

				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.set(-this.config.tileSize / 2, -this.config.tileSize / 2, -extrude.amount);

				tagpro$1.walls = mesh;

				this.scene.add(mesh);
			}
		}, {
			key: 'drawDynamicTile',
			value: function drawDynamicTile(original, col, row) {
				var tile = tagpro$1.map[col][row];
				var createOrUpdateObject = this.manager.byTileId(tile);

				var mesh = this.objects[col][row];

				if (createOrUpdateObject) {
					if (!mesh) {
						var x = col * this.config.tileSize;
						var y = row * this.config.tileSize;

						// HACK: Replace gates with floor tiles
						if (~ ~tile === 9) tagpro$1.tiles.draw(tagpro$1.renderer.layers.midground, 2, { x: x, y: y });

						mesh = createOrUpdateObject.call(this.manager);
						mesh.position.set(x, y, 0);
						this.scene.add(mesh);
						this.objects[col][row] = mesh;
					} else {
						createOrUpdateObject.call(this.manager, mesh);
					}
				} else {
					original(col, row); // falls back to original tagpro function
				}
			}
		}, {
			key: 'render',
			value: function render(time, delta) {
				this.renderer.render(this.scene, this.camera);
			}
		}, {
			key: 'update',
			value: function update(time, delta) {
				for (var i = 0; i < this._updatablesLength; i++) {
					var obj = this._updatables[i];

					if (!obj) continue;

					if (obj.visible) {
						obj.update(time, delta);
					}
				}
			}
		}, {
			key: 'updateCanvas',
			value: function updateCanvas(tagproCanvas) {
				$(this.renderer.domElement).css({
					left: tagproCanvas.offsetLeft,
					top: tagproCanvas.offsetTop,
					width: null,
					height: null
				}).attr({
					width: tagproCanvas.width,
					height: tagproCanvas.height
				});

				this.renderer.setSize(tagproCanvas.width, tagproCanvas.height);
				updateCameraFOV(this.camera, tagproCanvas.height);
			}
		}, {
			key: 'updateCameraPosition',
			value: function updateCameraPosition(x, y) {
				this.camera.position.x = x;
				this.camera.position.y = y;
			}
		}, {
			key: 'updateCameraZoom',
			value: function updateCameraZoom(zoom) {
				if (this.zoom !== zoom) {
					this.zoom = zoom;
					this.camera.zoom = 1 / this.zoom;
					this.camera.updateProjectionMatrix();
				}
			}
		}, {
			key: 'addPlayer',
			value: function addPlayer(player) {
				if (!player) {
					return;
				}

				var config = this.config.objects.ball;

				var geometry = config.isPuck ? createPuckGeometry(config.puck) : createSphereGeometry(config.sphere);
				var material = createMaterial(this.materials.ball.default);
				var object = new THREE.Mesh(geometry, material);

				if (config.hasOutline) {
					var _material = createMaterial(this.materials.ball.outline);
					var _geometry = createSphereGeometry(config.outline);
					var outline = new THREE.Mesh(_geometry, _material);
					object.add(outline);
				}

				this.scene.add(object);
				this.players[player.id] = object;
			}
		}, {
			key: 'removePlayer',
			value: function removePlayer(player) {
				if (!player) {
					return;
				}

				this.scene.remove(this.players[player.id]);
				delete this.players[player.id];
			}
		}, {
			key: 'updatePlayerPosition',
			value: function updatePlayerPosition(player) {
				if (!player) return;

				var object = this.players[player.id];
				if (!object) return;

				object.position.x = player.x;
				object.position.y = player.y;

				if (!this.ballConfig.isPuck) {
					quaternion.setFromAxisAngle(AXIS_Y, -(player.lx || 0) * this.ballConfig.velocityCoefficient);
					object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
					quaternion.setFromAxisAngle(AXIS_X, (player.ly || 0) * this.ballConfig.velocityCoefficient);
					object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
				}

				quaternion.setFromAxisAngle(AXIS_Z, (player.a || 0) * this.ballConfig.rotationCoefficient);
				object.quaternion.multiplyQuaternions(quaternion, object.quaternion);
			}
		}, {
			key: 'updatePlayerColor',
			value: function updatePlayerColor(player) {
				var object = this.players[player.id];
				if (!object) return;

				var params = player.team === 1 ? this.materials.ball.red : this.materials.ball.blue;
				object.material.setValues(params);
			}
		}]);
		return World;
	}();

	var styles = '\n\t#walls3d {\n\t\tdisplay: block;\n\t\tpointer-events: none;\n\t\tposition: absolute;\n\t\tz-index: 1000;\n\t}\n\t#options {\n\t\tz-index: 2000;\n\t}\n';

	function init() {
		GM_addStyle(styles);

		if (!Detector.webgl) {
			Detector.addGetWebGLMessage();
			return;
		}

		var tr = tagpro__default.renderer;
		var canvas = tr.canvas;
		var zoom;

		var config$$ = config;

		var world = new World(tagpro__default, config$$);

		tagpro__default.tagpro3d = world;

		tr.drawDynamicTile = world.drawDynamicTile.bind(world, tr.drawDynamicTile);

		after(tr, 'drawBackgroundTiles', function () {
			world.drawWalls(tagpro__default.map);
			world.initObjects(tagpro__default.map.length, tagpro__default.map[0].length);
		});

		after(tr, 'render', function () {
			return world.render();
		});

		after(tr, 'centerView', world.updateCanvas.bind(world, tr.canvas));
		world.updateCanvas(tr.canvas);

		after(tr, 'centerContainerToPoint', function (x, y) {
			world.updateCameraPosition(x - 19, y - 19);
			world.updateCameraZoom(tagpro__default.zoom);
		});

		after(tr, 'createBallSprite', function (player) {
			// console.log('adding ball to canvas', player.id, player.name);
			world.addPlayer(player);
		});

		after(tr, 'destroyPlayer', function (player) {
			// console.log('removing ball from canvas', player.id, player.name);
			world.removePlayer(player);
		});

		after(tr, 'updatePlayerSpritePosition', function (player) {
			world.updatePlayerPosition(player);
		});

		after(tr, 'updatePlayerColor', function (player) {
			world.updatePlayerColor(player);
		});

		var time, delta;
		var lastTime = performance.now() * 0.001;

		tagpro__default.events.register({
			update: function update() {
				time = performance.now() * 0.001;
				delta = time - lastTime;
				world.update(time, delta);
			}
		});

		console.log('TagPro 3D Initialized.');
	}

	function after(obj, methodName, callback) {
		var orig = obj[methodName];
		obj[methodName] = function () {
			var result = orig.apply(this, arguments);
			callback.apply(this, arguments);
			return result;
		};
	}

	tagpro__default.ready.after(init);

}(tagpro,THREE,$,ClipperLib));
//# sourceMappingURL=tagpro-3d.user.js.map