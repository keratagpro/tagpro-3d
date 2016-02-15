import { template } from 'lodash';
import { readFileSync } from 'fs';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';

var meta = template(readFileSync(__dirname + '/src/meta.tpl.js'));

var version = require('./package.json').version;
var banner = meta({ version });

export default {
	banner,
	entry: 'src/main.js',
	format: 'iife',
	dest: 'dist/tagpro-3d.user.js',
	sourceMap: true,
	plugins: [json(), babel(), nodeResolve({
		skip: ['clipper', 'jquery', 'tagpro', 'three']
	})],
	globals: {
		jquery: '$',
		clipper: 'ClipperLib',
		three: 'THREE',
		tagpro: 'tagpro',
		pixi: 'PIXI',
	}
};