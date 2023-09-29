import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import * as fs from 'fs';
import template from 'lodash/template';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy';

import { version } from './package.json';
import { extractBanner } from './scripts/extractBannerPlugin';

const meta = template(fs.readFileSync(__dirname + '/src/meta.tpl.ts', 'utf8'));

const banner = meta({ version });

const globals = {
	'tagpro': 'tagpro',
	'three': 'THREE',
	'loglevel': 'log',
	'rgbquant': 'RgbQuant',
	'pixi.js': 'PIXI',
};

export default defineConfig({
	input: 'src/index.ts',
	output: {
		file: 'docs/tagpro-3d.user.js',
		format: 'iife',
		banner,
		globals,
	},
	external: Object.keys(globals),
	plugins: [
		json(),
		commonjs(),
		nodeResolve(),
		typescript(),
		extractBanner({ file: 'docs/tagpro-3d.meta.js' }),
		copy({
			targets: [{ src: 'assets/', dest: 'docs/' }],
		}),
	],
});
