import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';
import { defineConfig } from 'rollup';
const template = require('lodash.template');

import { version } from './package.json';

const meta = template(fs.readFileSync(__dirname + '/src/meta.js.tpl', 'utf8'));

const banner = meta({ version });

const globals = {
	jquery: '$',
	clipper: 'ClipperLib',
	three: 'THREE',
	tagpro: 'tagpro',
	rgbquant: 'RgbQuant',
};

export default defineConfig([
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/tagpro-3d.user.js',
			format: 'iife',
			banner,
			globals,
			interop: false,
		},
		external: Object.keys(globals),
		plugins: [json(), commonjs(), nodeResolve(), typescript()],
	},
]);
