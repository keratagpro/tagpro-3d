import { template } from 'lodash';
import { readFileSync } from 'fs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import str from 'rollup-plugin-string';

var meta = template(readFileSync(__dirname + '/src/meta.tpl.js'));

var version = require('./package.json').version;
var banner = meta({ version });

export default {
	banner,
	entry: 'src/index.js',
	format: 'iife',
	dest: 'dist/tagpro-3d.user.js',
	sourceMap: true,
	plugins: [
		json(),
		str({
			extensions: ['.css']
		}),
		babel(),
		nodeResolve({
			skip: ['clipper', 'jquery', 'tagpro', 'three']
		}),
		replace({
			TEXTURES_URL: 'https://keratagpro.github.io/tagpro-balls-3d/textures'
		}),
	],
	globals: {
		jquery: '$',
		clipper: 'ClipperLib',
		three: 'THREE',
		tagpro: 'tagpro',
		pixi: 'PIXI',
	}
};